"""Re-import the delivered GLBs in a fresh Blender process and test their rigs."""

import hashlib
import json
import math
import struct
from pathlib import Path

import bpy


ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / 'src/assets/models'
EVIDENCE = ROOT / 'specs/001-kids-driving-safety-game/_workspace/rigging'
REPORT = {}


def positions(mesh):
    bpy.context.view_layer.update()
    evaluated = mesh.evaluated_get(bpy.context.evaluated_depsgraph_get())
    return [evaluated.matrix_world @ v.co for v in evaluated.data.vertices]


def activate(rig, action):
    rig.animation_data.action = action
    rig.animation_data.action_slot = action.slots[0]
    for track in rig.animation_data.nla_tracks:
        track.mute = True


for name in ('cool-banana-guy', 'turtle', 'chicken-guy'):
    path = MODELS / (name + '.glb')
    blob = path.read_bytes()
    magic, version, total = struct.unpack_from('<III', blob)
    assert magic == 0x46546C67 and version == 2 and total == len(blob)
    length = struct.unpack_from('<I', blob, 12)[0]
    gltf = json.loads(blob[20:20 + length])
    assert gltf.get('skins'), name + ': missing skin'
    assert all('uri' not in buffer for buffer in gltf['buffers'])
    assert all('bufferView' in image for image in gltf.get('images', []))
    entry = {'sha256': hashlib.sha256(blob).hexdigest(), 'bytes': len(blob),
             'skins': len(gltf['skins']), 'animations': [a['name'] for a in gltf['animations']]}
    bpy.ops.wm.read_homefile(use_empty=True, use_factory_startup=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    rigs = [o for o in bpy.context.scene.objects if o.type == 'ARMATURE']
    skinned = [o for o in bpy.context.scene.objects if o.type == 'MESH' and any(m.type == 'ARMATURE' for m in o.modifiers)]
    assert rigs and skinned
    assert all(not image.filepath or image.packed_file for image in bpy.data.images if image.type != 'RENDER_RESULT')
    if name == 'chicken-guy':
        assert entry['sha256'] == '85d4f3671a9383f810a53bbac55da34b890e3eb0f16769c63d6643a1a436fae3'
        assert {'Armature|Walk', 'Armature|Idle'} <= set(entry['animations'])
        assert {'Head', 'Hand.L', 'Hand.R'} <= {b.name for rig in rigs for b in rig.data.bones}
        entry['original_preserved'] = True
        REPORT[name] = entry
        continue
    assert len(rigs) == len(skinned) == 1
    rig, mesh = rigs[0], skinned[0]
    assert len(rig.data.bones) == 16
    for vertex in mesh.data.vertices:
        assert 0 < len(vertex.groups) <= 4
        assert abs(sum(g.weight for g in vertex.groups) - 1) < 1e-4
    actions = {}
    for clip in ('Idle', 'RaiseHand', 'LookLeft', 'LookRight', 'Sit'):
        candidates = [a for a in bpy.data.actions if a.name == clip or a.name.startswith(clip + '_')]
        assert len(candidates) == 1, (clip, [a.name for a in bpy.data.actions])
        actions[clip] = candidates[0]
    activate(rig, actions['Idle'])
    bpy.context.scene.frame_set(1)
    baseline = positions(mesh)
    values = {}
    for clip, action in actions.items():
        activate(rig, action)
        bpy.context.scene.frame_set(16)
        current = positions(mesh)
        deltas = [(a - b).length for a, b in zip(current, baseline)]
        assert all(math.isfinite(c) for point in current for c in point)
        if clip == 'Idle':
            assert max(deltas) < 1e-4
        else:
            assert max(deltas) > 0.03, clip + ': no visible deformation after export'
        if clip == 'RaiseHand':
            tip = [v.index for v in mesh.data.vertices if v.co.x > (0.9 if name == 'cool-banana-guy' else 0.7)]
            assert min(current[i].z - baseline[i].z for i in tip) > 0.4, 'Left hand did not rise'
            torso = [v.index for v in mesh.data.vertices if abs(v.co.x) < 0.15 and 0.75 < v.co.z < 0.9]
            assert max(deltas[i] for i in torso) < 1e-4, 'Raising a hand pulls the torso'
        if clip == 'Sit':
            feet = [v.index for v in mesh.data.vertices if v.co.z < 0.1]
            assert sum(current[i].y - baseline[i].y for i in feet) / len(feet) < -0.08, 'Sitting legs did not move forward'
        values[clip] = round(max(deltas), 6)
    entry['roundtrip_max_displacement_m'] = values
    entry['weighted_vertices'] = len(mesh.data.vertices)
    entry['bones'] = len(rig.data.bones)
    REPORT[name] = entry

EVIDENCE.mkdir(parents=True, exist_ok=True)
(EVIDENCE / 'roundtrip-report.json').write_text(json.dumps(REPORT, indent=2) + '\n')
print(json.dumps(REPORT, indent=2))
