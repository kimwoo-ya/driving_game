import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import type { CharacterKind, CharacterKindId } from '../content/characters';
import type { VehicleKind, VehicleKindId } from '../content/vehicles';
import { DRIVING_SPEC } from '../sim/vehicle';

export type PreparedModel = { root: THREE.Object3D; clips: readonly THREE.AnimationClip[] };

const CHARACTER_HEIGHT = 1; // 인물 기준 키(m). 쓰는 곳에서 scale로 실제 키를 줌
const prepared = new Map<VehicleKindId | CharacterKindId, PreparedModel>();

/** assets.md 4장 순서로 정규화하고 id별로 보관한다. 손상된 GLB면 reject */
export async function prepareModel(glb: ArrayBuffer, kind: VehicleKind | CharacterKind): Promise<PreparedModel> {
  const gltf = await new GLTFLoader().parseAsync(glb, '');
  gltf.scene.updateMatrixWorld(true);
  const isVehicle = 'seats' in kind;
  const inner = isVehicle ? mergeByMaterial(gltf.scene) : gltf.scene;

  inner.rotation.y = THREE.MathUtils.degToRad(kind.yawDeg); // 앞쪽을 +Z로
  const root = new THREE.Group().add(inner);
  // 차량은 정점 기준 상자(precise): 원본이 축에 비스듬하면(트럭) geometry 상자로는 길이·중심이 어긋남
  const box = new THREE.Box3().setFromObject(root, isVehicle);
  const size = box.getSize(new THREE.Vector3());
  inner.scale.multiplyScalar(isVehicle ? DRIVING_SPEC.bodyLength / size.z : CHARACTER_HEIGHT / size.y);
  box.setFromObject(root, isVehicle);
  const center = box.getCenter(new THREE.Vector3());
  inner.position.set(-center.x, -box.min.y, -center.z); // 바닥 0, 가로 중심 원점

  const model = { root, clips: gltf.animations };
  prepared.set(kind.id, model);
  return model;
}

export function preparedModel(id: VehicleKindId | CharacterKindId): PreparedModel | undefined {
  return prepared.get(id);
}

/** 차량은 clone()(geometry 공유), 뼈대가 있는 캐릭터는 SkeletonUtils.clone */
export function cloneModel(model: PreparedModel): THREE.Object3D {
  let skinned = false;
  model.root.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) skinned = true;
  });
  return skinned ? SkeletonUtils.clone(model.root) : model.root.clone();
}

/** 차량 전용: world 좌표로 옮긴 geometry를 재질별로 합침. 합치기에 실패한 재질은 원래 메시 유지 */
function mergeByMaterial(scene: THREE.Object3D): THREE.Object3D {
  const byMaterial = new Map<THREE.Material, THREE.Mesh[]>();
  const keep: THREE.Mesh[] = [];
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (Array.isArray(mesh.material)) keep.push(mesh);
    else byMaterial.set(mesh.material, [...(byMaterial.get(mesh.material) ?? []), mesh]);
  });
  const out = new THREE.Group();
  const bake = (mesh: THREE.Mesh) => {
    const copy = new THREE.Mesh(mesh.geometry.clone().applyMatrix4(mesh.matrixWorld), mesh.material);
    out.add(copy);
  };
  for (const [material, meshes] of byMaterial) {
    const merged = mergeGeometries(meshes.map((m) => m.geometry.clone().applyMatrix4(m.matrixWorld))) as
      | THREE.BufferGeometry
      | null;
    if (merged) out.add(new THREE.Mesh(merged, material));
    else meshes.forEach(bake);
  }
  keep.forEach(bake);
  return out;
}
