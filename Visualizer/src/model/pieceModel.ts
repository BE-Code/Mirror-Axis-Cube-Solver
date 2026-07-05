import * as THREE from "three";
import { CUBIE_SIZE, CUBIE_SPACING } from "../cube/cubie";
import type { CubieSlot } from "../cube/pieces";
import type { FaceLetter } from "../cube/names";
import { load3mfGeometry } from "./load3mf";
import type { PieceModelTransform } from "./pieceTransforms";

const DEFAULT_MATERIAL = new THREE.MeshStandardMaterial({
  color: 0xc8ccd4,
  metalness: 0.65,
  roughness: 0.28,
});

const FACE_NORMALS: Record<FaceLetter, THREE.Vector3> = {
  U: new THREE.Vector3(0, 1, 0),
  D: new THREE.Vector3(0, -1, 0),
  F: new THREE.Vector3(0, 0, 1),
  B: new THREE.Vector3(0, 0, -1),
  R: new THREE.Vector3(1, 0, 0),
  L: new THREE.Vector3(-1, 0, 0),
};

export async function createModelCubie(
  slot: CubieSlot,
  modelUrl: string,
  transform: PieceModelTransform,
): Promise<THREE.Group> {
  const geometry = await load3mfGeometry(modelUrl);
  const mesh = new THREE.Mesh(geometry, DEFAULT_MATERIAL.clone());
  mesh.rotation.set(...transform.rotation);

  const fitSize = transform.fitSize ?? CUBIE_SIZE;
  const preScaleBox = new THREE.Box3().setFromObject(mesh);
  const preScaleSize = preScaleBox.getSize(new THREE.Vector3());

  let fitBasis: number;
  if (transform.fitFootprint) {
    const normal = FACE_NORMALS[transform.anchorFace];
    const axes = [
      { size: preScaleSize.x, dot: Math.abs(normal.x) },
      { size: preScaleSize.y, dot: Math.abs(normal.y) },
      { size: preScaleSize.z, dot: Math.abs(normal.z) },
    ];
    const horizontal = axes
      .filter((axis) => axis.dot < 0.5)
      .map((axis) => axis.size);
    fitBasis = Math.max(...horizontal, 0);
  } else {
    fitBasis = Math.max(preScaleSize.x, preScaleSize.y, preScaleSize.z);
  }

  const fitScale = fitBasis > 0 ? fitSize / fitBasis : 1;
  const scale = fitScale * (transform.scale ?? 1);
  mesh.scale.setScalar(scale);

  anchorMeshToFace(mesh, transform.anchorFace, fitSize, transform.anchorInward ?? false);

  const group = new THREE.Group();
  group.add(mesh);
  group.position.set(
    slot.x * CUBIE_SPACING + (transform.offset?.[0] ?? 0),
    slot.y * CUBIE_SPACING + (transform.offset?.[1] ?? 0),
    slot.z * CUBIE_SPACING + (transform.offset?.[2] ?? 0),
  );
  group.userData.slot = slot;
  return group;
}

function anchorMeshToFace(
  mesh: THREE.Mesh,
  face: FaceLetter,
  fitSize: number,
  anchorInward: boolean,
): void {
  const normal = FACE_NORMALS[face];
  const box = new THREE.Box3().setFromObject(mesh);
  const corners = [
    new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    new THREE.Vector3(box.max.x, box.max.y, box.max.z),
  ];

  let maxAlong = -Infinity;
  let minAlong = Infinity;
  for (const corner of corners) {
    const along = corner.dot(normal);
    maxAlong = Math.max(maxAlong, along);
    minAlong = Math.min(minAlong, along);
  }

  const half = fitSize / 2;
  const inwardFace = face === "D" || face === "B" || face === "L";
  const shift = anchorInward
    ? (inwardFace ? half - maxAlong : -half - minAlong)
    : (inwardFace ? half - minAlong : half - maxAlong);

  mesh.position.add(normal.clone().multiplyScalar(shift));
}

export function disposeObject3D(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
}
