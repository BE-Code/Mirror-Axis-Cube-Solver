import * as THREE from "three";

const AXES = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
} as const;

export type QuatTuple = [number, number, number, number];

export function identityQuaternion(): QuatTuple {
  return [0, 0, 0, 1];
}

export function toThreeQuaternion(quat: QuatTuple): THREE.Quaternion {
  return new THREE.Quaternion(quat[0], quat[1], quat[2], quat[3]);
}

/** Apply one incremental rotation around a fixed cube axis through the origin. */
export function nudgeQuaternion(
  quat: QuatTuple,
  axis: keyof typeof AXES,
  deltaDeg: number,
): QuatTuple {
  const current = toThreeQuaternion(quat);
  const delta = new THREE.Quaternion().setFromAxisAngle(
    AXES[axis],
    THREE.MathUtils.degToRad(deltaDeg),
  );
  current.premultiply(delta);
  return [current.x, current.y, current.z, current.w];
}

export function slotPositionWithCubeRotation(
  slot: THREE.Vector3,
  quat: QuatTuple,
  offset: THREE.Vector3,
): THREE.Vector3 {
  return slot.clone().applyQuaternion(toThreeQuaternion(quat)).add(offset);
}
