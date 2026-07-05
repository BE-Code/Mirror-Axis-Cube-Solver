import { CUBIE_SIZE } from "../cube/cubie";
import type { FaceLetter } from "../cube/names";

/** Per-piece import tuning keyed by FLBRUD id. */
export interface PieceModelTransform {
  /** Euler rotation (radians) applied before scaling. */
  rotation: [number, number, number];
  /** Cubie face the model's outer side should align with. */
  anchorFace: FaceLetter;
  /** Scene-unit offset applied after slot placement. */
  offset?: [number, number, number];
  /** Target size used for scaling; defaults to `CUBIE_SIZE`. */
  fitSize?: number;
  /** Scale to horizontal footprint instead of tallest dimension. */
  fitFootprint?: boolean;
  /** Pin the inward side to `-fitSize/2` instead of the outer side to `+fitSize/2`. */
  anchorInward?: boolean;
  /** Manual scale multiplier applied after fit scaling. */
  scale?: number;
}

export const PIECE_TRANSFORMS: Partial<Record<string, PieceModelTransform>> = {
  U: {
    // Model is authored with height along +Z; rotate so the tip points up (+Y).
    rotation: [-Math.PI / 2, 0, 0],
    anchorFace: "U",
    anchorInward: true,
    fitFootprint: true,
    fitSize: CUBIE_SIZE,
  },
};
