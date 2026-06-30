import type { SlotType } from "../codec/slots";

/**
 * Orientation delta for slot values 0–3.
 * Centers: in-plane 90° steps around face normal.
 * Corners/sides: same rotation model; calibrated via solved-state base matrices.
 */
export function orientSteps(type: SlotType): number {
  void type;
  return 4;
}

export function orientRadians(value: number, solvedValue: number): number {
  const delta = ((value - solvedValue) % 4 + 4) % 4;
  return delta * (Math.PI / 2);
}
