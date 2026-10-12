"""Build the two character rigs from the unmodified poly.pizza GLBs.

Run: blender --background --python scripts/rig-characters.py -- SOURCE_GLB_DIR
Outputs are separate from modeling/ originals; reruns replace generated outputs.
"""

import hashlib
import json
import math
import shutil
import struct
from pathlib import Path

import bmesh
import bpy
from mathutils import Matrix, Quaternion, Vector


ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {
    'chicken-guy': '85d4f3671a9383f810a53bbac55da34b890e3eb0f16769c63d6643a1a436fae3',
    'cool-banana-guy': 'd12abda5c80a2fd9988c6a50be941134e765d673ca2aa8d7c52e324b49da07c6',
    'turtle': 'a068045dde8482f7781eb6b1433c827db1762d051395f15899ad987431df60fc',
}
CLIPS = ('Idle', 'RaiseHand', 'LookLeft', 'LookRight', 'Sit')


def smooth(value, start, end):
    t = max(0.0, min(1.0, (value - start) / (end - start)))
    return t * t * (3 - 2 * t)


def normalize(mesh, name):
    matrix = mesh.matrix_world.copy()
    mesh.parent = None
    mesh.matrix_world = Matrix.Identity(4)
    mesh.data.transform(matrix)
    if name == 'cool-banana-guy':
        mesh.data.transform(Matrix.Rotation(-math.pi / 2, 4, 'Z'))
    low = Vector([min(v.co[i] for v in mesh.data.vertices) for i in range(3)])
    high = Vector([max(v.co[i] for v in mesh.data.vertices) for i in range(3)])
    move = Matrix.Translation((-(high.x + low.x) / 2, -(high.y + low.y) / 2, -low.z))
    mesh.data.transform(Matrix.Scale(2 / (high.z - low.z), 4) @ move)
    # Joint cuts keep the original surface while giving elbows room to bend.
    bm = bmesh.new()
    bm.from_mesh(mesh.data)
    arm_low, arm_high = (1.04, 1.32) if name == 'cool-banana-guy' else (0.85, 1.12)
    for side in (-1, 1):
        for x in ((0.45, 0.5, 0.55, 0.78, 0.83) if name == 'cool-banana-guy' else (0.46, 0.5, 0.54, 0.65, 0.69)):
            faces = [f for f in bm.faces if all(side * v.co.x > 0.27 and arm_low < v.co.z < arm_high for v in f.verts)]
            geometry = set(faces)
            for face in faces:
                geometry.update(face.edges)
                geometry.update(face.verts)
            bmesh.ops.bisect_plane(bm, geom=list(geometry), dist=1e-6,
                                  plane_co=(side * x, 0, 0), plane_no=(1, 0, 0))
    bm.to_mesh(mesh.data)
    bm.free()
    mesh.data.update()


def make_rig(name):
    banana = name == 'cool-banana-guy'
    hip, knee, ankle = ((0.67, 0.35, 0.055) if banana else (0.44, 0.23, 0.065))
    hip_x = 0.12 if banana else 0.18
    shoulder, elbow, wrist = ((0.23, 0.5, 0.82) if banana else (0.29, 0.5, 0.67))
    arm_y, arm_z = ((0.03, 1.19) if banana else (0.116, 0.992))
    head_z = 1.33 if banana else 1.24
    data = bpy.data.armatures.new(name + '-skeleton')
    rig = bpy.data.objects.new(name + '-rig', data)
    bpy.context.collection.objects.link(rig)
    bpy.context.view_layer.objects.active = rig
    rig.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')

    def bone(label, head, tail, parent=None, deform=True):
        b = data.edit_bones.new(label)
        b.head, b.tail, b.use_deform = head, tail, deform
        if parent:
            b.parent = data.edit_bones[parent]
        return b

    bone('Root', (0, 0, 0), (0, 0, 0.15), deform=False)
    bone('Pelvis', (0, 0, hip), (0, 0, 0.87), 'Root')
    bone('Spine', (0, 0, 0.87), (0, 0, head_z), 'Pelvis')
    bone('Head', (0, 0, head_z), (0, 0, 1.85), 'Spine')
    for side, sign in (('L', 1), ('R', -1)):
        bone('UpperArm.' + side, (sign * shoulder, arm_y, arm_z), (sign * elbow, arm_y, arm_z), 'Spine')
        bone('Forearm.' + side, (sign * elbow, arm_y, arm_z), (sign * wrist, arm_y, arm_z), 'UpperArm.' + side)
        bone('Hand.' + side, (sign * wrist, arm_y, arm_z), (sign * (wrist + 0.1), arm_y, arm_z), 'Forearm.' + side)
        bone('Thigh.' + side, (sign * hip_x, 0.02, hip), (sign * hip_x, 0.01, knee), 'Pelvis')
        bone('Shin.' + side, (sign * hip_x, 0.01, knee), (sign * hip_x, 0.02, ankle), 'Thigh.' + side)
        bone('Foot.' + side, (sign * hip_x, 0.02, ankle), (sign * hip_x, -0.08, ankle), 'Shin.' + side)
    bpy.ops.object.mode_set(mode='OBJECT')
    rig.show_in_front = True
    return rig


def banana_parts(mesh):
    # Separate banana limbs overlap the body, so positions alone cannot classify them.
    parents = list(range(len(mesh.data.vertices)))

    def find(i):
        while parents[i] != i:
            parents[i] = parents[parents[i]]
            i = parents[i]
        return i

    positions = {}
    for v in mesh.data.vertices:
        key = tuple(round(c, 5) for c in v.co)
        if key in positions:
            parents[find(v.index)] = find(positions[key])
        else:
            positions[key] = v.index
    for edge in mesh.data.edges:
        a, b = edge.vertices
        parents[find(a)] = find(b)
    components = {}
    for v in mesh.data.vertices:
        components.setdefault(find(v.index), []).append(v)
    labels = {}
    for vertices in components.values():
        zmin, zmax = min(v.co.z for v in vertices), max(v.co.z for v in vertices)
        xmax = max(abs(v.co.x) for v in vertices)
        kind = 'arm' if zmin > 1.1 and zmax < 1.25 and xmax > 0.7 else 'leg' if zmax < 0.71 and xmax < 0.2 else 'body'
        labels.update((v.index, kind) for v in vertices)
    return labels


def bind(mesh, rig, name):
    banana = name == 'cool-banana-guy'
    parts = banana_parts(mesh) if banana else {}
    groups = {b.name: mesh.vertex_groups.new(name=b.name) for b in rig.data.bones if b.use_deform}
    for v in mesh.data.vertices:
        x, y, z = v.co
        a = abs(x)
        side = 'L' if x >= 0 else 'R'
        is_arm = parts.get(v.index) == 'arm' if banana else a > 0.28 and 0.85 < z < 1.12 and y > -0.02
        is_leg = parts.get(v.index) == 'leg' if banana else z < 0.46 and a > 0.035
        if is_arm:
            arm = 1.0 if banana else smooth(a, 0.285, 0.37)
            forearm = smooth(a, 0.455, 0.545)
            hand = smooth(a, 0.77, 0.85) if banana else smooth(a, 0.635, 0.705)
            weights = {'Spine': 1 - arm, 'UpperArm.' + side: arm * (1 - forearm),
                       'Forearm.' + side: arm * forearm * (1 - hand), 'Hand.' + side: arm * forearm * hand}
        elif is_leg:
            leg = 1.0 if banana else 1 - smooth(z, 0.32, 0.46)
            shin = 1 - smooth(z, 0.30, 0.40) if banana else 1 - smooth(z, 0.18, 0.28)
            foot = 1 - smooth(z, 0.035, 0.09)
            weights = {'Pelvis': 1 - leg, 'Thigh.' + side: leg * (1 - shin),
                       'Shin.' + side: leg * shin * (1 - foot), 'Foot.' + side: leg * shin * foot}
        else:
            head = smooth(z, 1.20, 1.35) if banana else smooth(z, 1.20, 1.28)
            spine = smooth(z, 0.66, 0.95) if banana else smooth(z, 0.43, 0.80)
            weights = {'Pelvis': (1 - head) * (1 - spine), 'Spine': (1 - head) * spine, 'Head': head}
        for label, weight in weights.items():
            if weight > 1e-7:
                groups[label].add([v.index], weight, 'REPLACE')
    # Keep mesh and skeleton as scene roots; glTF skinning ignores mesh-parent transforms.
    modifier = mesh.modifiers.new('Character skeleton', 'ARMATURE')
    modifier.object = rig
    # Use linear skinning, the same deformation model the GLB carries to three.js.
    modifier.use_deform_preserve_volume = False
    assert all(abs(sum(g.weight for g in v.groups) - 1) < 1e-5 for v in mesh.data.vertices)
    assert all(len(v.groups) <= 4 for v in mesh.data.vertices)


def rotate(rig, label, axis, degrees):
    bone = rig.pose.bones[label]
    basis = bone.bone.matrix_local.to_quaternion()
    bone.rotation_quaternion = basis.inverted() @ Quaternion(axis, math.radians(degrees)) @ basis


def pose(rig, label, amount=1.0):
    for b in rig.pose.bones:
        b.rotation_mode = 'QUATERNION'
        b.rotation_quaternion = Quaternion()
        b.location = (0, 0, 0)
        b.scale = (1, 1, 1)
    if label == 'Rest':
        bpy.context.view_layer.update()
        return
    rotate(rig, 'UpperArm.L', (0, 1, 0), 65)
    rotate(rig, 'UpperArm.R', (0, 1, 0), -65)
    if label == 'RaiseHand':
        rotate(rig, 'UpperArm.L', (0, 1, 0), 65 - 95 * amount)
        rotate(rig, 'Forearm.L', (0, 1, 0), -65 * amount)
    elif label in ('LookLeft', 'LookRight'):
        rotate(rig, 'Head', (0, 0, 1), (25 if label == 'LookLeft' else -25) * amount)
    elif label == 'Sit':
        for side in ('L', 'R'):
            rotate(rig, 'Thigh.' + side, (1, 0, 0), -75 * amount)
            rotate(rig, 'Shin.' + side, (1, 0, 0), 75 * amount)
    bpy.context.view_layer.update()


def animate(rig):
    rig.animation_data_create()
    for name in CLIPS:
        action = bpy.data.actions.new(name)
        rig.animation_data.action = action
        for frame, amount in ((1, 0), (16, 1), (32, 1), (48, 0)):
            pose(rig, name, amount)
            for b in rig.pose.bones:
                b.keyframe_insert(data_path='rotation_quaternion', frame=frame, group=b.name)
        action.use_fake_user = True
        track = rig.animation_data.nla_tracks.new()
        track.name = name
        strip = track.strips.new(name, 1, action)
        strip.name = name
        track.mute = True
    rig.animation_data.action = None
    pose(rig, 'Rest')


def render_setup():
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x = 720
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    scene.world = bpy.data.worlds.new('Rig preview')
    scene.world.use_nodes = True
    scene.world.node_tree.nodes['Background'].inputs[0].default_value = (0.16, 0.19, 0.24, 1)
    scene.world.node_tree.nodes['Background'].inputs[1].default_value = 0.8
    scene.view_settings.view_transform = 'Standard'
    for position, power in (((3, -4, 5), 500), ((-4, 1, 4), 350)):
        data = bpy.data.lights.new('Preview light', 'AREA')
        data.energy, data.shape, data.size = power, 'DISK', 5
        light = bpy.data.objects.new('Preview light', data)
        scene.collection.objects.link(light)
        light.location = position
        light.rotation_euler = (Vector((0, 0, 1)) - light.location).to_track_quat('-Z', 'Y').to_euler()
    data = bpy.data.cameras.new('Preview camera')
    camera = bpy.data.objects.new('Preview camera', data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    data.type, data.ortho_scale = 'ORTHO', 2.7
    camera.location = (2.5, -6, 2.6)
    camera.rotation_euler = (Vector((0, 0, 1)) - camera.location).to_track_quat('-Z', 'Y').to_euler()


def evaluated_positions(mesh):
    evaluated = mesh.evaluated_get(bpy.context.evaluated_depsgraph_get())
    return [evaluated.matrix_world @ v.co for v in evaluated.data.vertices]


def verify_deformation(mesh, rig, name):
    pose(rig, 'Rest')
    before = evaluated_positions(mesh)
    bones = {}
    for b in rig.data.bones:
        if not b.use_deform:
            continue
        rotate(rig, b.name, (1, 0, 0) if 'Arm' not in b.name and 'arm' not in b.name else (0, 1, 0), 25)
        bpy.context.view_layer.update()
        after = evaluated_positions(mesh)
        delta = max((a - c).length for a, c in zip(before, after))
        assert delta > 1e-4, (b.name, 'does not deform the mesh')
        assert all(math.isfinite(c) for v in after for c in v)
        bones[b.name] = round(delta, 6)
        pose(rig, 'Rest')
    rotate(rig, 'UpperArm.L', (0, 1, 0), -45)
    bpy.context.view_layer.update()
    after = evaluated_positions(mesh)
    tip = [v.index for v in mesh.data.vertices if v.co.x > (0.9 if name == 'cool-banana-guy' else 0.7)]
    assert min((after[i] - before[i]).length for i in tip) > 0.1, 'Arm tip is not fully connected'
    torso = [v.index for v in mesh.data.vertices if v.co.y > 0.12 and 0.9 < v.co.z < 1.22] if name == 'cool-banana-guy' else [v.index for v in mesh.data.vertices if abs(v.co.x) < 0.2 and 0.55 < v.co.z < 0.85]
    assert max((after[i] - before[i]).length for i in torso) < 1e-5, 'Arm pulls the torso'
    pose(rig, 'Rest')
    return bones


def build_all(source, root=ROOT):
    source, root = Path(source), Path(root)
    for name, expected in EXPECTED.items():
        assert hashlib.sha256((source / (name + '.glb')).read_bytes()).hexdigest() == expected, name + ': source changed'
    models = root / 'src/assets/models'
    editable = root / 'assets-source/characters'
    evidence = root / 'specs/001-kids-driving-safety-game/_workspace/rigging'
    for folder in (models, editable, evidence):
        folder.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source / 'chicken-guy.glb', models / 'chicken-guy.glb')
    report = {'blender': bpy.app.version_string, 'source_sha256': EXPECTED, 'characters': {}}
    for name in ('cool-banana-guy', 'turtle'):
        bpy.ops.wm.read_homefile(use_empty=True, use_factory_startup=True)
        bpy.ops.import_scene.gltf(filepath=str(source / (name + '.glb')))
        mesh = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
        normalize(mesh, name)
        for o in list(bpy.context.scene.objects):
            if o != mesh:
                bpy.data.objects.remove(o, do_unlink=True)
        rig = make_rig(name)
        bind(mesh, rig, name)
        deformation = verify_deformation(mesh, rig, name)
        animate(rig)
        bpy.ops.object.select_all(action='DESELECT')
        mesh.select_set(True)
        rig.select_set(True)
        bpy.context.view_layer.objects.active = rig
        path = models / (name + '.glb')
        bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True,
                                  export_animations=True, export_animation_mode='NLA_TRACKS',
                                  export_yup=True, export_extras=True)
        blob = path.read_bytes()
        length = struct.unpack_from('<I', blob, 12)[0]
        gltf = json.loads(blob[20:20 + length])
        clips = [a['name'] for a in gltf.get('animations', [])]
        assert set(clips) == set(CLIPS), clips
        assert len(gltf['skins']) == 1
        assert all('JOINTS_0' in p['attributes'] and 'WEIGHTS_0' in p['attributes'] for m in gltf['meshes'] for p in m['primitives'])
        report['characters'][name] = {'bones': len(rig.data.bones), 'vertices': len(mesh.data.vertices),
                                      'clips': clips, 'deformation_max_m': deformation,
                                      'bytes': len(blob), 'sha256': hashlib.sha256(blob).hexdigest()}
        render_setup()
        for label in ('Idle', 'RaiseHand', 'LookLeft', 'Sit'):
            pose(rig, label)
            bpy.context.scene.render.filepath = str(evidence / (name + '-' + label + '.png'))
            bpy.ops.render.render(write_still=True)
        pose(rig, 'Idle')
        bpy.context.scene.frame_start, bpy.context.scene.frame_end = 1, 48
        bpy.context.scene.render.fps = 24
        bpy.ops.wm.save_as_mainfile(filepath=str(editable / (name + '.blend')))
    lines = [hashlib.sha256(p.read_bytes()).hexdigest() + '  ' + p.name for p in sorted(models.glob('*.glb'))]
    (models / 'SHA256SUMS').write_text('\n'.join(lines) + '\n')
    (evidence / 'build-report.json').write_text(json.dumps(report, indent=2) + '\n')
    return report


if __name__ == '__main__':
    import sys
    args = sys.argv[sys.argv.index('--') + 1:]
    print(json.dumps(build_all(args[0]), indent=2))
