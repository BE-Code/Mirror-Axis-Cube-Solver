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

export function createDefaultTuning(): PieceTuningState {
  return { ops: [] };
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
