import { SLOT_COUNT } from "./state";

export type SlotType = "center" | "corner" | "side";

export { SLOT_COUNT };

export interface SlotDef {
  index: number;
  name: string;
  type: SlotType;
  /** Solved-state value for this slot (from cases.rs). */
  solvedValue: number;
  /** Leaf mesh filename in the 3MF. */
  prototype: string;
}

/**
 * Slot layout mirrors src/cases.rs and Mirror Axis Cube Encoding.drawio.
 * - 0–4:   Centers F, L, B, R, U
 * - 5–12:  Corners FLD, BLD, BRD, FRD, FLU, BLU, BRU, FRU
 * - 13–24: Sides FD, LD, BD, RD, FL, BL, BR, FR, FU, LU, BU, RU
 */
export const SLOTS: readonly SlotDef[] = [
  { index: 0, name: "F", type: "center", solvedValue: 2, prototype: "object_48.model" },
  { index: 1, name: "L", type: "center", solvedValue: 1, prototype: "object_48.model" },
  { index: 2, name: "B", type: "center", solvedValue: 3, prototype: "object_48.model" },
  { index: 3, name: "R", type: "center", solvedValue: 0, prototype: "object_48.model" },
  { index: 4, name: "U", type: "center", solvedValue: 3, prototype: "object_48.model" },
  { index: 5, name: "FLD", type: "corner", solvedValue: 3, prototype: "object_54.model" },
  { index: 6, name: "BLD", type: "corner", solvedValue: 2, prototype: "object_54.model" },
  { index: 7, name: "BRD", type: "corner", solvedValue: 0, prototype: "object_54.model" },
  { index: 8, name: "FRD", type: "corner", solvedValue: 1, prototype: "object_54.model" },
  { index: 9, name: "FLU", type: "corner", solvedValue: 0, prototype: "object_54.model" },
  { index: 10, name: "BLU", type: "corner", solvedValue: 1, prototype: "object_54.model" },
  { index: 11, name: "BRU", type: "corner", solvedValue: 3, prototype: "object_54.model" },
  { index: 12, name: "FRU", type: "corner", solvedValue: 2, prototype: "object_54.model" },
  { index: 13, name: "FD", type: "side", solvedValue: 1, prototype: "object_62.model" },
  { index: 14, name: "LD", type: "side", solvedValue: 0, prototype: "object_60.model" },
  { index: 15, name: "BD", type: "side", solvedValue: 3, prototype: "object_175.model" },
  { index: 16, name: "RD", type: "side", solvedValue: 3, prototype: "object_112.model" },
  { index: 17, name: "FL", type: "side", solvedValue: 3, prototype: "object_62.model" },
  { index: 18, name: "BL", type: "side", solvedValue: 1, prototype: "object_60.model" },
  { index: 19, name: "BR", type: "side", solvedValue: 2, prototype: "object_175.model" },
  { index: 20, name: "FR", type: "side", solvedValue: 0, prototype: "object_112.model" },
  { index: 21, name: "FU", type: "side", solvedValue: 2, prototype: "object_62.model" },
  { index: 22, name: "LU", type: "side", solvedValue: 2, prototype: "object_60.model" },
  { index: 23, name: "BU", type: "side", solvedValue: 0, prototype: "object_175.model" },
  { index: 24, name: "RU", type: "side", solvedValue: 1, prototype: "object_112.model" },
];

export const CORE_PROTOTYPES = ["object_1.model", "object_2.model"] as const;

export function solvedSlots(): number[] {
  return SLOTS.map((s) => s.solvedValue);
}
