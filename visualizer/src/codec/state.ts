export const SLOT_COUNT = 25;
export const STATE_BITS = 50;
export const STATE_MASK = (1n << BigInt(STATE_BITS)) - 1n;

/** Solved state from cases.rs SOLVED constant. */
export const SOLVED_STATE = 0x1289fc6d12f36n;

export function parseState(raw: bigint): number[] {
  const masked = raw & STATE_MASK;
  return Array.from({ length: SLOT_COUNT }, (_, i) =>
    Number((masked >> BigInt(i * 2)) & 3n),
  );
}

export function formatState(slots: number[]): bigint {
  let raw = 0n;
  for (let i = 0; i < SLOT_COUNT; i++) {
    raw |= BigInt(slots[i]! & 3) << BigInt(i * 2);
  }
  return raw & STATE_MASK;
}

export function parseInput(s: string): bigint {
  const trimmed = s.trim();
  if (!trimmed) {
    throw new Error("State number is empty");
  }
  try {
    if (trimmed.startsWith("0x") || trimmed.startsWith("0X")) {
      return BigInt(trimmed) & STATE_MASK;
    }
    return BigInt(trimmed) & STATE_MASK;
  } catch {
    throw new Error(`Invalid state number: ${s}`);
  }
}

export function formatHex(raw: bigint): string {
  return `0x${(raw & STATE_MASK).toString(16)}`;
}

export function formatDec(raw: bigint): string {
  return (raw & STATE_MASK).toString(10);
}
