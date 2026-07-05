import type { QuatTuple } from "./cubeSpaceRotation";
import { identityQuaternion } from "./cubeSpaceRotation";

export interface PieceTuningState {
  /** Accumulated orientation; each axis nudge left-multiplies a fixed-axis rotation. */
  quaternion: QuatTuple;
  /** Running total of degrees nudged per cube axis (UI display only). */
  twistDeg: [number, number, number];
  scale: number;
  /** Offset from rotated slot in fixed cube XYZ. */
  position: [number, number, number];
}

export function createDefaultTuning(): PieceTuningState {
  return {
    quaternion: identityQuaternion(),
    twistDeg: [0, 0, 0],
    scale: 1,
    position: [0, 0, 0],
  };
}

export function formatTuningForExport(id: string, state: PieceTuningState): string {
  const [px, py, pz] = state.position.map((v) => v.toFixed(4));
  const [qx, qy, qz, qw] = state.quaternion.map((v) => v.toFixed(6));

  return `// ${id}
quaternion: [${qx}, ${qy}, ${qz}, ${qw}],
twistDeg: [${state.twistDeg.join(", ")}],
scale: ${state.scale.toFixed(4)},
position: [${px}, ${py}, ${pz}],`;
}
