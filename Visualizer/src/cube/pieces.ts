import { slotToFlbrud } from "./names";

import centerModelUrl from "../../3D Models/pieces/center.3mf?url";

/** Maps future 3MF assets under `3D Models/pieces/`. */
export const PIECE_MODELS = {
  center: centerModelUrl,
  cornerPyramid: "3D Models/pieces/corner - pyramid.3mf",
  cornerTriangle: "3D Models/pieces/corner - triangle.3mf",
  sideTrapezoid: "3D Models/pieces/side - trapezoid.3mf",
  sideDiagTopLeft: "3D Models/pieces/side - diag top left.3mf",
  sideDiagTopRight: "3D Models/pieces/side - diag top right.3mf",
} as const;

export type PieceModelId = keyof typeof PIECE_MODELS;

export type CubieKind = "corner" | "edge" | "center" | "core";

export type GridCoord = -1 | 0 | 1;

export interface CubieSlot {
  /** FLBRUD id (e.g. UFR, UF, U, core). */
  id: string;
  x: GridCoord;
  y: GridCoord;
  z: GridCoord;
  kind: CubieKind;
  /** When set, this slot will eventually load a 3MF instead of a box. */
  modelId?: PieceModelId;
}

function cubieKind(x: GridCoord, y: GridCoord, z: GridCoord): CubieKind {
  if (x === 0 && y === 0 && z === 0) return "core";

  const exposedFaces = [x, y, z].filter((c) => c !== 0).length;
  if (exposedFaces === 1) return "center";
  if (exposedFaces === 2) return "edge";
  return "corner";
}

/** All 27 cubie positions on a 3×3×3 cube. */
export function buildCubieSlots(): CubieSlot[] {
  const slots: CubieSlot[] = [];
  const coords: GridCoord[] = [-1, 0, 1];

  for (const x of coords) {
    for (const y of coords) {
      for (const z of coords) {
        const kind = cubieKind(x, y, z);
        slots.push({ id: slotToFlbrud(x, y, z), x, y, z, kind });
      }
    }
  }

  return slots;
}
