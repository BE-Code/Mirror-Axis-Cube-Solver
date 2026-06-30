import * as THREE from "three";
import { SLOTS, type SlotDef } from "../codec/slots";
import {
  applyOrientDelta,
  computeCoreRelativeRotation,
  extractRotationMatrix,
  rotationBetweenDirections,
} from "./geometry";
import { buildLayoutAnchors, getAnchorForSlot, type SlotAnchor } from "./layout";
import type { Loaded3mf, Placement } from "./load3mf";

const TILE_COLORS: Record<string, number> = {
  "object_48.model": 0xc8d8e8,
  "object_54.model": 0xa8d4a8,
  "object_62.model": 0xd4c8e8,
  "object_60.model": 0xd8d0c0,
  "object_175.model": 0xc0d0e0,
  "object_112.model": 0xe0c8d0,
};

const CORE_COLOR = 0x404550;

interface NormalizedPlacement {
  prototype: string;
  matrix: THREE.Matrix4;
}

/** Axis-align the scene using core part A orientation from the 3MF. */
function computeAlignmentMatrix(corePlateMatrix: THREE.Matrix4): THREE.Matrix4 {
  const rot = extractRotationMatrix(corePlateMatrix);
  return rot.clone().invert();
}

function buildCoCenteredCorePlacements(
  loadedCorePlacements: Placement[],
  normalizeMatrix: THREE.Matrix4,
): NormalizedPlacement[] {
  const core1 = loadedCorePlacements.find((p) => p.prototype === "object_1.model");
  const core2 = loadedCorePlacements.find((p) => p.prototype === "object_2.model");
  if (!core1 || !core2) {
    throw new Error("Expected object_1.model and object_2.model core parts");
  }

  const relative = computeCoreRelativeRotation(core1.matrix, core2.matrix);
  return [
    { prototype: "object_1.model", matrix: normalizeMatrix.clone() },
    {
      prototype: "object_2.model",
      matrix: normalizeMatrix.clone().multiply(relative),
    },
  ];
}

function normalizePlacements(
  placements: Placement[],
  normalizeMatrix: THREE.Matrix4,
  alignmentMatrix: THREE.Matrix4,
): NormalizedPlacement[] {
  return placements.map((p) => ({
    prototype: p.prototype,
    matrix: alignmentMatrix.clone().multiply(normalizeMatrix).multiply(p.matrix),
  }));
}

function calibrateFromPlacements(
  tilePlacements: NormalizedPlacement[],
  anchors: SlotAnchor[],
): Map<number, THREE.Matrix4> {
  const used = new Set<number>();
  const result = new Map<number, THREE.Matrix4>();

  const slotsByRarity = [...SLOTS].sort((a, b) => {
    const count = (proto: string) =>
      tilePlacements.filter((p) => p.prototype === proto).length;
    return count(a.prototype) - count(b.prototype);
  });

  for (const slot of slotsByRarity) {
    const anchor = getAnchorForSlot(anchors, slot);
    let bestIdx = -1;
    let bestDist = Infinity;

    for (let i = 0; i < tilePlacements.length; i++) {
      if (used.has(i)) continue;
      if (tilePlacements[i]!.prototype !== slot.prototype) continue;
      const pos = new THREE.Vector3().setFromMatrixPosition(tilePlacements[i]!.matrix);
      const dist = pos.distanceTo(anchor.position);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }

    if (bestIdx >= 0) {
      used.add(bestIdx);
      result.set(slot.index, tilePlacements[bestIdx]!.matrix.clone());
    }
  }

  return result;
}

function findExemplar(
  slot: SlotDef,
  calibrated: Map<number, THREE.Matrix4>,
): { slot: SlotDef; matrix: THREE.Matrix4 } | null {
  for (const preferSameType of [true, false]) {
    for (const other of SLOTS) {
      if (other.prototype !== slot.prototype) continue;
      if (preferSameType && other.type !== slot.type) continue;
      const matrix = calibrated.get(other.index);
      if (matrix) return { slot: other, matrix };
    }
  }
  return null;
}

/** Propagate calibrated 3MF poses to slots without a direct placement match. */
function fillUncalibratedSlots(
  calibrated: Map<number, THREE.Matrix4>,
  anchors: SlotAnchor[],
): Map<number, THREE.Matrix4> {
  const result = new Map(calibrated);

  for (const slot of SLOTS) {
    if (result.has(slot.index)) continue;

    const exemplar = findExemplar(slot, calibrated);
    if (exemplar) {
      const fromAnchor = getAnchorForSlot(anchors, exemplar.slot);
      const toAnchor = getAnchorForSlot(anchors, slot);
      const rot = rotationBetweenDirections(fromAnchor.position, toAnchor.position);
      result.set(slot.index, rot.clone().multiply(exemplar.matrix));
      continue;
    }

    result.set(slot.index, getAnchorForSlot(anchors, slot).matrix.clone());
  }

  return result;
}

function makeMaterial(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: 0.15,
    roughness: 0.55,
    flatShading: true,
  });
}

export interface SceneAssets {
  slotBaseMatrices: Map<number, THREE.Matrix4>;
  prototypes: Map<string, THREE.BufferGeometry>;
  corePlacements: NormalizedPlacement[];
}

export function prepareSceneAssets(loaded: Loaded3mf): SceneAssets {
  const anchors = buildLayoutAnchors();
  const core1 = loaded.corePlacements.find((p) => p.prototype === "object_1.model");
  if (!core1) {
    throw new Error("Core mesh object_1.model not found");
  }
  const alignmentMatrix = computeAlignmentMatrix(core1.matrix);

  const tilePlacements = normalizePlacements(
    loaded.tilePlacements,
    loaded.normalizeMatrix,
    alignmentMatrix,
  );
  const corePlacements = buildCoCenteredCorePlacements(
    loaded.corePlacements,
    loaded.normalizeMatrix,
  );

  const directCalibration = calibrateFromPlacements(tilePlacements, anchors);
  const slotBaseMatrices = fillUncalibratedSlots(directCalibration, anchors);

  return {
    slotBaseMatrices,
    prototypes: loaded.prototypes,
    corePlacements,
  };
}

export function buildScene(
  slots: number[],
  assets: SceneAssets,
  visibility: boolean[] = Array.from({ length: SLOTS.length }, () => true),
): THREE.Group {
  const group = new THREE.Group();

  for (const placement of assets.corePlacements) {
    const geometry = assets.prototypes.get(placement.prototype);
    if (!geometry) continue;
    const mesh = new THREE.Mesh(geometry, makeMaterial(CORE_COLOR));
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(placement.matrix);
    group.add(mesh);
  }

  for (const slot of SLOTS) {
    if (visibility[slot.index] === false) continue;

    const value = slots[slot.index] ?? 0;
    const geometry = assets.prototypes.get(slot.prototype);
    if (!geometry) continue;

    const baseMatrix =
      assets.slotBaseMatrices.get(slot.index) ??
      buildLayoutAnchors().find((a) => a.index === slot.index)!.matrix;
    const worldMatrix = applyOrientDelta(baseMatrix, value, slot.solvedValue);

    const color = TILE_COLORS[slot.prototype] ?? 0xaaaaaa;
    const mesh = new THREE.Mesh(geometry.clone(), makeMaterial(color));
    mesh.name = `slot-${slot.index}-${slot.name}`;
    mesh.matrixAutoUpdate = false;
    mesh.matrix.copy(worldMatrix);
    group.add(mesh);
  }

  return group;
}
