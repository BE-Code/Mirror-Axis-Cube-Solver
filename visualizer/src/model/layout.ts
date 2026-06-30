import * as THREE from "three";
import { anchorMatrix } from "./geometry";
import type { SlotDef } from "../codec/slots";

export interface SlotAnchor {
  index: number;
  position: THREE.Vector3;
  normal: THREE.Vector3;
  up: THREE.Vector3;
  matrix: THREE.Matrix4;
}

/** Tile inset from unit-cube face (half-edge = 1). */
const INSET = 0.88;
const CORNER = 0.82;

function v(x: number, y: number, z: number): THREE.Vector3 {
  return new THREE.Vector3(x, y, z);
}

function buildCenter(
  index: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  up: THREE.Vector3,
): SlotAnchor {
  return {
    index,
    position,
    normal,
    up,
    matrix: anchorMatrix(position, normal, up),
  };
}

function buildCorner(index: number, position: THREE.Vector3): SlotAnchor {
  const normal = position.clone().normalize();
  const up = new THREE.Vector3(0, 1, 0);
  return {
    index,
    position,
    normal,
    up,
    matrix: anchorMatrix(position, normal, up),
  };
}

function buildSide(
  index: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  up: THREE.Vector3,
): SlotAnchor {
  return buildCenter(index, position, normal, up);
}

/**
 * Canonical slot anchors on a unit cube centered at origin.
 * Axes: X = R/L, Y = U/D, Z = F/B.
 */
export function buildLayoutAnchors(): SlotAnchor[] {
  const anchors: SlotAnchor[] = [];

  // Centers 0–4: F, L, B, R, U
  anchors.push(buildCenter(0, v(0, 0, INSET), v(0, 0, 1), v(0, 1, 0)));
  anchors.push(buildCenter(1, v(-INSET, 0, 0), v(-1, 0, 0), v(0, 1, 0)));
  anchors.push(buildCenter(2, v(0, 0, -INSET), v(0, 0, -1), v(0, 1, 0)));
  anchors.push(buildCenter(3, v(INSET, 0, 0), v(1, 0, 0), v(0, 1, 0)));
  anchors.push(buildCenter(4, v(0, INSET, 0), v(0, 1, 0), v(0, 0, -1)));

  // Corners 5–12
  anchors.push(buildCorner(5, v(-CORNER, -CORNER, CORNER))); // FLD
  anchors.push(buildCorner(6, v(-CORNER, -CORNER, -CORNER))); // BLD
  anchors.push(buildCorner(7, v(CORNER, -CORNER, -CORNER))); // BRD
  anchors.push(buildCorner(8, v(CORNER, -CORNER, CORNER))); // FRD
  anchors.push(buildCorner(9, v(-CORNER, CORNER, CORNER))); // FLU
  anchors.push(buildCorner(10, v(-CORNER, CORNER, -CORNER))); // BLU
  anchors.push(buildCorner(11, v(CORNER, CORNER, -CORNER))); // BRU
  anchors.push(buildCorner(12, v(CORNER, CORNER, CORNER))); // FRU

  // Sides 13–24
  anchors.push(buildSide(13, v(0, -CORNER, CORNER), v(0, 0, 1), v(0, -1, 0))); // FD
  anchors.push(buildSide(14, v(-CORNER, -CORNER, 0), v(-1, 0, 0), v(0, -1, 0))); // LD
  anchors.push(buildSide(15, v(0, -CORNER, -CORNER), v(0, 0, -1), v(0, -1, 0))); // BD
  anchors.push(buildSide(16, v(CORNER, -CORNER, 0), v(1, 0, 0), v(0, -1, 0))); // RD
  anchors.push(buildSide(17, v(-CORNER, 0, CORNER), v(0, 0, 1), v(-1, 0, 0))); // FL
  anchors.push(buildSide(18, v(-CORNER, 0, -CORNER), v(0, 0, -1), v(-1, 0, 0))); // BL
  anchors.push(buildSide(19, v(CORNER, 0, -CORNER), v(0, 0, -1), v(1, 0, 0))); // BR
  anchors.push(buildSide(20, v(CORNER, 0, CORNER), v(0, 0, 1), v(1, 0, 0))); // FR
  anchors.push(buildSide(21, v(0, CORNER, CORNER), v(0, 0, 1), v(0, 1, 0))); // FU
  anchors.push(buildSide(22, v(-CORNER, CORNER, 0), v(-1, 0, 0), v(0, 1, 0))); // LU
  anchors.push(buildSide(23, v(0, CORNER, -CORNER), v(0, 0, -1), v(0, 1, 0))); // BU
  anchors.push(buildSide(24, v(CORNER, CORNER, 0), v(1, 0, 0), v(0, 1, 0))); // RU

  return anchors;
}

export function getAnchorForSlot(
  anchors: SlotAnchor[],
  slot: SlotDef,
): SlotAnchor {
  const anchor = anchors.find((a) => a.index === slot.index);
  if (!anchor) {
    throw new Error(`No anchor for slot ${slot.index}`);
  }
  return anchor;
}
