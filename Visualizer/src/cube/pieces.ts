/** Maps future 3MF assets under `3D Models/pieces/`. */
export const PIECE_MODELS = {
  center: "3D Models/pieces/center.3mf",
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
  x: GridCoord;
  y: GridCoord;
  z: GridCoord;
  kind: CubieKind;
  /** When set, this slot will eventually load a 3MF instead of a box. */
  modelId?: PieceModelId;
}

function cubieKind(x: GridCoord, y: GridCoord, z: GridCoord): CubieKind {
  const onSurface = x === 0 || y === 0 || z === 0;
  if (!onSurface) return "core";

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
        slots.push({ x, y, z, kind: cubieKind(x, y, z) });
      }
    }
  }

  return slots;
}
