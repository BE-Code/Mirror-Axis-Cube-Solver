import type { QuatTuple } from "./cubeSpaceRotation";

export type CubeAxis = "x" | "y" | "z";

export type TuningOp =
  | { kind: "rotate"; axis: CubeAxis; deltaDeg: number }
  | { kind: "translate"; axis: CubeAxis; delta: number }
  | { kind: "scale"; delta: number };

export interface PieceTuningState {
  ops: TuningOp[];
}

export interface TuningTallies {
  twistDeg: [number, number, number];
  position: [number, number, number];
  scale: number;
}

export interface TuningDecomposed {
  position: [number, number, number];
  quaternion: QuatTuple;
  scale: [number, number, number];
}

export interface PieceTuningView extends PieceTuningState, TuningTallies {}

const U_DEFAULT_TUNING_OPS: TuningOp[] = [
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: -15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 1 },
  { kind: "rotate", axis: "y", deltaDeg: -1 },
  { kind: "rotate", axis: "y", deltaDeg: -1 },
  { kind: "rotate", axis: "x", deltaDeg: 15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "rotate", axis: "x", deltaDeg: -15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "x", delta: -0.15 },
  { kind: "translate", axis: "x", delta: 0.15 },
  { kind: "translate", axis: "z", delta: -0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.15 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: -15 },
  { kind: "translate", axis: "y", delta: -0.15 },
  { kind: "translate", axis: "y", delta: -0.15 },
  { kind: "translate", axis: "y", delta: -0.15 },
  { kind: "translate", axis: "y", delta: -0.01 },
  { kind: "translate", axis: "y", delta: -0.01 },
  { kind: "rotate", axis: "y", deltaDeg: -15 },
  { kind: "rotate", axis: "y", deltaDeg: -15 },
  { kind: "rotate", axis: "y", deltaDeg: -15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: 15 },
  { kind: "rotate", axis: "y", deltaDeg: -45 },
  { kind: "rotate", axis: "y", deltaDeg: -1 },
  { kind: "rotate", axis: "y", deltaDeg: 1 },
  { kind: "rotate", axis: "x", deltaDeg: 1 },
  { kind: "rotate", axis: "x", deltaDeg: -1 },
  { kind: "rotate", axis: "x", deltaDeg: -1 },
  { kind: "rotate", axis: "x", deltaDeg: -1 },
  { kind: "rotate", axis: "x", deltaDeg: 1 },
  { kind: "rotate", axis: "x", deltaDeg: -1 },
  { kind: "rotate", axis: "x", deltaDeg: -1 },
  { kind: "rotate", axis: "x", deltaDeg: -1 },
  { kind: "translate", axis: "x", delta: -0.01 },
  { kind: "translate", axis: "x", delta: 0.01 },
  { kind: "translate", axis: "z", delta: -0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "rotate", axis: "x", deltaDeg: 45 },
  { kind: "rotate", axis: "x", deltaDeg: -45 },
  { kind: "rotate", axis: "y", deltaDeg: -45 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "scale", delta: 0.01 },
  { kind: "rotate", axis: "y", deltaDeg: 180 },
  { kind: "translate", axis: "x", delta: 0.01 },
  { kind: "translate", axis: "z", delta: 0.01 },
  { kind: "translate", axis: "z", delta: -0.01 },
  { kind: "translate", axis: "z", delta: -0.01 },
  { kind: "translate", axis: "z", delta: -0.01 },
  { kind: "translate", axis: "z", delta: -0.01 },
  { kind: "translate", axis: "y", delta: 0.15 },
  { kind: "translate", axis: "y", delta: -0.01 },
  { kind: "translate", axis: "y", delta: -0.01 },
  { kind: "translate", axis: "y", delta: -0.01 },
  { kind: "translate", axis: "y", delta: -0.01 },
  { kind: "translate", axis: "y", delta: 0.01 },
];

/** Per-piece default tuning ops keyed by FLBRUD id. */
export const DEFAULT_PIECE_TUNING: Partial<Record<string, PieceTuningState>> = {
  U: { ops: U_DEFAULT_TUNING_OPS },
};

export function createDefaultTuning(id?: string): PieceTuningState {
  const preset = id ? DEFAULT_PIECE_TUNING[id] : undefined;
  return preset ? { ops: [...preset.ops] } : { ops: [] };
}

const AXIS_INDEX: Record<CubeAxis, number> = { x: 0, y: 1, z: 2 };

export function foldTallies(ops: readonly TuningOp[]): TuningTallies {
  const twistDeg: [number, number, number] = [0, 0, 0];
  const position: [number, number, number] = [0, 0, 0];
  let scale = 1;

  for (const op of ops) {
    if (op.kind === "rotate") {
      twistDeg[AXIS_INDEX[op.axis]] += op.deltaDeg;
    } else if (op.kind === "translate") {
      position[AXIS_INDEX[op.axis]] += op.delta;
    } else {
      scale += op.delta;
    }
  }

  return { twistDeg, position, scale };
}

function formatOp(op: TuningOp): string {
  if (op.kind === "rotate") {
    return `{ kind: "rotate", axis: "${op.axis}", deltaDeg: ${op.deltaDeg} }`;
  }
  if (op.kind === "translate") {
    return `{ kind: "translate", axis: "${op.axis}", delta: ${op.delta} }`;
  }
  return `{ kind: "scale", delta: ${op.delta} }`;
}

export function formatTuningForExport(
  id: string,
  ops: readonly TuningOp[],
  decomposed: TuningDecomposed,
): string {
  const [px, py, pz] = decomposed.position.map((v) => v.toFixed(4));
  const [qx, qy, qz, qw] = decomposed.quaternion.map((v) => v.toFixed(6));
  const [sx, sy, sz] = decomposed.scale.map((v) => v.toFixed(4));
  const opLines = ops.map((op) => `  ${formatOp(op)},`).join("\n");

  return `// ${id}
ops: [
${opLines}
],
position: [${px}, ${py}, ${pz}],
quaternion: [${qx}, ${qy}, ${qz}, ${qw}],
scale: [${sx}, ${sy}, ${sz}],`;
}
