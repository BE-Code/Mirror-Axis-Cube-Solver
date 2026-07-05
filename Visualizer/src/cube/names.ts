import type { CubieKind, GridCoord } from "./pieces";

/** Face letters in standard order: U, D, F, B, R, L. */
const FACE_ORDER = ["U", "D", "F", "B", "R", "L"] as const;
export type FaceLetter = (typeof FACE_ORDER)[number];

/** Derive Singmaster-style id from grid position (e.g. UFR, UF, U, core). */
export function slotToFlbrud(x: GridCoord, y: GridCoord, z: GridCoord): string {
  const faces: FaceLetter[] = [];

  if (y === 1) faces.push("U");
  if (y === -1) faces.push("D");
  if (z === 1) faces.push("F");
  if (z === -1) faces.push("B");
  if (x === 1) faces.push("R");
  if (x === -1) faces.push("L");

  if (faces.length === 0) return "core";

  return faces
    .sort((a, b) => FACE_ORDER.indexOf(a) - FACE_ORDER.indexOf(b))
    .join("");
}

const KIND_SORT: Record<CubieKind, number> = {
  center: 0,
  edge: 1,
  corner: 2,
  core: 3,
};

export function comparePieceIds(a: string, b: string, kindA: CubieKind, kindB: CubieKind): number {
  const kindDiff = KIND_SORT[kindA] - KIND_SORT[kindB];
  if (kindDiff !== 0) return kindDiff;
  return a.localeCompare(b);
}
