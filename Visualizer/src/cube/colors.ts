import * as THREE from "three";

/** Standard Rubik's cube face colors (U D F B R L). */
export const FACE_COLORS = {
  U: 0xffffff,
  D: 0xffd500,
  F: 0x00b341,
  B: 0x0066ff,
  R: 0xb71234,
  L: 0xff5800,
} as const;

export const HIDDEN_FACE = 0x1a1d24;

export function faceMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.05,
    roughness: 0.35,
  });
}
