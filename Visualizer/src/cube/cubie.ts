import * as THREE from "three";
import { FACE_COLORS, HIDDEN_FACE, faceMaterial } from "./colors";
import type { CubieSlot, GridCoord } from "./pieces";

export const CUBIE_SIZE = 0.92;
export const CUBIE_SPACING = 1;

export interface CubieMeshOptions {
  size?: number;
  spacing?: number;
}

/**
 * Builds a single cubie mesh. Swap this implementation per-slot later
 * to load 3MF geometry from `PIECE_MODELS`.
 */
export function createBoxCubie(
  slot: CubieSlot,
  options: CubieMeshOptions = {},
): THREE.Mesh {
  const size = options.size ?? CUBIE_SIZE;
  const spacing = options.spacing ?? CUBIE_SPACING;
  const geometry = new THREE.BoxGeometry(size, size, size);

  const { x, y, z } = slot;
  const materials = [
    faceForAxis(x, 1, FACE_COLORS.R),
    faceForAxis(x, -1, FACE_COLORS.L),
    faceForAxis(y, 1, FACE_COLORS.U),
    faceForAxis(y, -1, FACE_COLORS.D),
    faceForAxis(z, 1, FACE_COLORS.F),
    faceForAxis(z, -1, FACE_COLORS.B),
  ];

  const mesh = new THREE.Mesh(geometry, materials);
  mesh.position.set(x * spacing, y * spacing, z * spacing);
  mesh.userData.slot = slot;
  return mesh;
}

function faceForAxis(
  coord: GridCoord,
  exposed: GridCoord,
  color: number,
): THREE.MeshStandardMaterial {
  return faceMaterial(coord === exposed ? color : HIDDEN_FACE);
}
