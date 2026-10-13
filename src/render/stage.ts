import * as THREE from 'three';
import { DRIVING_SPEC, type Pose } from '../sim/vehicle';

export type Stage = {
  readonly scene: THREE.Scene;
  resize(): void;
  draw(): void;
  /** 렌더러 내부용(구현 재량): 뒤에서 조금 내려다보는 고정 오프셋 카메라를 이 자세에 맞춤 */
  follow(target: Pose): void;
  /** 렌더러 내부용: 진열처럼 카메라를 직접 놓는 화면 */
  readonly camera: THREE.PerspectiveCamera;
  /** 렌더러 내부용: 화면마다 자기 Group을 두고 이것만 보이게 함 */
  show(group: THREE.Object3D): void;
};

// ponytail: 픽셀 비율 상한 하나. 저사양 기기에서 낮출 값은 초기 기기 점검(T113)에서 정함
const MAX_PIXEL_RATIO = 2;
// 카메라 오프셋은 모델 크기가 아니라 DRIVING_SPEC 기준(FR-011)
const CAMERA_BACK = DRIVING_SPEC.bodyLength * 2.5;
const CAMERA_UP = DRIVING_SPEC.bodyLength * 1.4;
const LOOK_AHEAD = DRIVING_SPEC.bodyLength;

export function createStage(canvas: HTMLCanvasElement, onContext: (lost: boolean) => void): Stage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  } catch {
    return null; // WebGL2 없음·렌더러 생성 실패(FR-005)
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x9fd8ff);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x88aa66, 2));
  const sun = new THREE.DirectionalLight(0xffffff, 1.5);
  sun.position.set(20, 40, 10);
  scene.add(sun);

  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 500);
  const lookAt = new THREE.Vector3();
  const groups = new Set<THREE.Object3D>();

  const resize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener('resize', resize);
  canvas.addEventListener('webglcontextlost', () => onContext(true));
  canvas.addEventListener('webglcontextrestored', () => onContext(false));

  return {
    scene,
    camera,
    resize,
    draw: () => renderer.render(scene, camera),
    follow(target) {
      const sin = Math.sin(target.heading);
      const cos = Math.cos(target.heading);
      camera.position.set(target.x - sin * CAMERA_BACK, CAMERA_UP, target.z - cos * CAMERA_BACK);
      camera.lookAt(lookAt.set(target.x + sin * LOOK_AHEAD, 0, target.z + cos * LOOK_AHEAD));
    },
    show(group) {
      if (!groups.has(group)) scene.add(group);
      groups.add(group);
      for (const g of groups) g.visible = g === group;
    },
  };
}
