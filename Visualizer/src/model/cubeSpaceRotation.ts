import * as THREE from "three";
import type { CubeAxis, TuningDecomposed, TuningOp } from "./pieceTuning";

const AXES: Record<CubeAxis, THREE.Vector3> = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
};

export type QuatTuple = [number, number, number, number];

const _matrix = new THREE.Matrix4();
const _op = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

function rotationMatrix(axis: CubeAxis, deltaDeg: number): THREE.Matrix4 {
  return _op.makeRotationAxis(AXES[axis], THREE.MathUtils.degToRad(deltaDeg));
}

function translationMatrix(axis: CubeAxis, delta: number): THREE.Matrix4 {
  const offset = new THREE.Vector3();
  offset[axis] = delta;
  return _op.makeTranslation(offset.x, offset.y, offset.z);
}

function scaleAtPivotMatrix(
  M_tune: THREE.Matrix4,
  M_base: THREE.Matrix4,
  delta: number,
): THREE.Matrix4 {
  _matrix.multiplyMatrices(M_tune, M_base);
  _matrix.decompose(_position, _quaternion, _scale);

  const factor = 1 + delta;
  const scale = _op.makeScale(factor, factor, factor);
  const toPivot = new THREE.Matrix4().makeTranslation(_position.x, _position.y, _position.z);
  const fromPivot = toPivot.clone().invert();

  return new THREE.Matrix4()
    .multiply(toPivot)
    .multiply(scale)
    .multiply(fromPivot);
}

function applyOp(
  M_tune: THREE.Matrix4,
  M_base: THREE.Matrix4,
  op: TuningOp,
): void {
  if (op.kind === "rotate") {
    M_tune.premultiply(rotationMatrix(op.axis, op.deltaDeg));
    return;
  }

  if (op.kind === "translate") {
    M_tune.premultiply(translationMatrix(op.axis, op.delta));
    return;
  }

  M_tune.premultiply(scaleAtPivotMatrix(M_tune, M_base, op.delta));
}

/** Replay ordered tuning ops onto the slot baseline. */
export function composeTuningMatrix(
  slot: THREE.Vector3,
  ops: readonly TuningOp[],
): THREE.Matrix4 {
  const M_base = new THREE.Matrix4().makeTranslation(slot.x, slot.y, slot.z);
  const M_tune = new THREE.Matrix4().identity();

  for (const op of ops) {
    applyOp(M_tune, M_base, op);
  }

  return new THREE.Matrix4().multiplyMatrices(M_tune, M_base);
}

export function decomposeTuningMatrix(matrix: THREE.Matrix4): TuningDecomposed {
  matrix.decompose(_position, _quaternion, _scale);
  return {
    position: [_position.x, _position.y, _position.z],
    quaternion: [_quaternion.x, _quaternion.y, _quaternion.z, _quaternion.w],
    scale: [_scale.x, _scale.y, _scale.z],
  };
}

export function applyTuningToWrapper(
  wrapper: THREE.Object3D,
  slot: THREE.Vector3,
  ops: readonly TuningOp[],
): TuningDecomposed {
  const matrix = composeTuningMatrix(slot, ops);
  const decomposed = decomposeTuningMatrix(matrix);

  wrapper.position.set(...decomposed.position);
  wrapper.quaternion.set(...decomposed.quaternion);
  wrapper.scale.set(...decomposed.scale);

  return decomposed;
}
