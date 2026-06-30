import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildScene, type SceneAssets } from "../model/buildScene";

export class CubeRenderer {
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;
  private cubeGroup: THREE.Group | null = null;
  private assets: SceneAssets | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.scene.background = new THREE.Color(0x111318);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
    this.camera.position.set(3.5, 2.8, 3.5);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.target.set(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    this.scene.add(ambient);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 3);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0x8899bb, 0.45);
    fill.position.set(-3, 1, -2);
    this.scene.add(fill);

    window.addEventListener("resize", () => this.resize());
    this.resize();
    this.animate();
  }

  setAssets(assets: SceneAssets): void {
    this.assets = assets;
  }

  renderState(slots: number[], visibility?: boolean[]): void {
    if (!this.assets) return;

    if (this.cubeGroup) {
      this.scene.remove(this.cubeGroup);
      this.cubeGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    this.cubeGroup = buildScene(slots, this.assets, visibility);
    this.scene.add(this.cubeGroup);
  }

  private resize(): void {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  private animate = (): void => {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };
}
