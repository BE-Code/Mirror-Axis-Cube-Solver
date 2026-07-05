import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RubiksCube } from "../cube/rubiksCube";

export interface SceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  cube: RubiksCube;
  setYAxisVisible: (visible: boolean) => void;
  dispose: () => void;
}

function createYAxisGuide(): THREE.Group {
  const color = 0xd93025;
  const material = new THREE.MeshBasicMaterial({ color });

  const group = new THREE.Group();
  group.name = "y-axis-guide";

  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 5, 16), material);
  shaft.name = "y-axis-shaft";

  const marker = new THREE.Mesh(new THREE.SphereGeometry(0.055, 20, 20), material);
  marker.name = "y-axis-marker";

  group.add(shaft, marker);
  return group;
}

export function createScene(canvas: HTMLCanvasElement): SceneContext {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xf4f5f7);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(4.5, 4, 5.5);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 14;
  controls.target.set(0, 0, 0);

  const ambient = new THREE.AmbientLight(0xffffff, 0.55);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(5, 8, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x8899bb, 0.35);
  fill.position.set(-4, -2, -3);
  scene.add(fill);

  const yAxisGuide = createYAxisGuide();
  scene.add(yAxisGuide);

  const cube = new RubiksCube();
  scene.add(cube.group);

  const setYAxisVisible = (visible: boolean) => {
    yAxisGuide.visible = visible;
  };

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);

  let frameId = 0;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  const dispose = () => {
    cancelAnimationFrame(frameId);
    observer.disconnect();
    controls.dispose();
    yAxisGuide.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
    renderer.dispose();
    cube.group.traverse((obj: THREE.Object3D) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => m.dispose());
      }
    });
  };

  return { renderer, scene, camera, controls, cube, setYAxisVisible, dispose };
}
