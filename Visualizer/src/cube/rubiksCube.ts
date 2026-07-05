import * as THREE from "three";
import { CUBIE_SPACING } from "./cubie";
import { createBoxCubie } from "./cubie";
import {
  buildCubieSlots,
  PIECE_MODELS,
  type CubieSlot,
  type PieceModelId,
} from "./pieces";
import { createModelCubie, disposeObject3D } from "../model/pieceModel";
import {
  nudgeQuaternion,
  slotPositionWithCubeRotation,
  toThreeQuaternion,
} from "../model/cubeSpaceRotation";
import {
  createDefaultTuning,
  formatTuningForExport,
  type PieceTuningState,
} from "../model/pieceTuning";
import { PIECE_TRANSFORMS } from "../model/pieceTransforms";

/** Slots that should load a 3MF model instead of a placeholder box. */
export const MODEL_ASSIGNMENTS: Partial<Record<string, PieceModelId>> = {
  U: "center",
};

export class RubiksCube {
  readonly group: THREE.Group;
  private readonly cubies = new Map<string, THREE.Object3D>();
  private readonly tuningState = new Map<string, PieceTuningState>();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "rubiks-cube";

    for (const slot of buildCubieSlots()) {
      const cubie = this.createCubie(slot);
      this.cubies.set(slot.id, cubie);
      this.group.add(cubie);
    }
  }

  async loadAssignedModels(): Promise<void> {
    const tasks = Object.entries(MODEL_ASSIGNMENTS)
      .filter((entry): entry is [string, PieceModelId] => entry[1] !== undefined)
      .map(([id, modelId]) => this.replaceWithModel(id, modelId));
    await Promise.all(tasks);
  }

  getTunablePieceIds(): string[] {
    return Object.keys(MODEL_ASSIGNMENTS);
  }

  getTuning(id: string): PieceTuningState | undefined {
    const state = this.tuningState.get(id);
    if (!state) return undefined;
    return {
      quaternion: [...state.quaternion] as PieceTuningState["quaternion"],
      twistDeg: [...state.twistDeg] as [number, number, number],
      scale: state.scale,
      position: [...state.position] as [number, number, number],
    };
  }

  setTuning(id: string, partial: Partial<PieceTuningState>): void {
    const current = this.tuningState.get(id) ?? createDefaultTuning();
    const next: PieceTuningState = {
      quaternion: partial.quaternion ?? [...current.quaternion] as PieceTuningState["quaternion"],
      twistDeg: partial.twistDeg ?? [...current.twistDeg] as [number, number, number],
      scale: partial.scale ?? current.scale,
      position: partial.position ?? [...current.position] as [number, number, number],
    };
    this.tuningState.set(id, next);
    this.applyTuning(id);
  }

  resetTuning(id: string): void {
    this.tuningState.set(id, createDefaultTuning());
    this.applyTuning(id);
  }

  formatTuningExport(id: string): string {
    const state = this.tuningState.get(id) ?? createDefaultTuning();
    return formatTuningForExport(id, state);
  }

  nudgeRotation(id: string, axis: "x" | "y" | "z", deltaDeg: number): void {
    if (deltaDeg === 0) return;

    const current = this.tuningState.get(id) ?? createDefaultTuning();
    const index = axis === "x" ? 0 : axis === "y" ? 1 : 2;
    const twistDeg = [...current.twistDeg] as [number, number, number];
    twistDeg[index] += deltaDeg;

    this.setTuning(id, {
      quaternion: nudgeQuaternion(current.quaternion, axis, deltaDeg),
      twistDeg,
    });
  }

  protected createCubie(slot: CubieSlot): THREE.Object3D {
    return createBoxCubie(slot);
  }

  private async replaceWithModel(id: string, modelId: PieceModelId): Promise<void> {
    const current = this.cubies.get(id);
    if (!current) return;

    const slot = current.userData.slot as CubieSlot | undefined;
    if (!slot) return;

    const transform = PIECE_TRANSFORMS[id];
    if (!transform) {
      throw new Error(`Missing transform config for piece "${id}"`);
    }

    const content = await createModelCubie(slot, PIECE_MODELS[modelId], transform);
    content.position.set(0, 0, 0);

    const scaleGroup = new THREE.Group();
    scaleGroup.name = `tuning-scale-${id}`;
    scaleGroup.add(content);

    const wrapper = new THREE.Group();
    wrapper.name = `piece-${id}`;
    wrapper.userData.slot = slot;
    wrapper.userData.tunable = true;
    wrapper.userData.tuningScale = scaleGroup;
    wrapper.add(scaleGroup);

    this.tuningState.set(id, createDefaultTuning());
    this.applyTuning(id, wrapper);

    this.group.remove(current);
    disposeObject3D(current);
    this.cubies.set(id, wrapper);
    this.group.add(wrapper);
  }

  private applyTuning(id: string, cubie = this.cubies.get(id)): void {
    if (!cubie || !cubie.userData.tunable) return;

    const slot = cubie.userData.slot as CubieSlot;
    const scaleGroup = cubie.userData.tuningScale as THREE.Object3D | undefined;
    const state = this.tuningState.get(id) ?? createDefaultTuning();

    const slotVec = new THREE.Vector3(
      slot.x * CUBIE_SPACING,
      slot.y * CUBIE_SPACING,
      slot.z * CUBIE_SPACING,
    );
    const tunePos = new THREE.Vector3(...state.position);

    cubie.position.copy(slotPositionWithCubeRotation(slotVec, state.quaternion, tunePos));
    cubie.quaternion.copy(toThreeQuaternion(state.quaternion));
    cubie.scale.set(1, 1, 1);

    if (scaleGroup) {
      scaleGroup.scale.setScalar(state.scale);
      scaleGroup.rotation.set(0, 0, 0);
    }
  }

  getPieceIds(): string[] {
    return [...this.cubies.keys()];
  }

  getCubie(id: string): THREE.Object3D | undefined {
    return this.cubies.get(id);
  }

  setPieceVisible(id: string, visible: boolean): void {
    const cubie = this.cubies.get(id);
    if (cubie) cubie.visible = visible;
  }

  isPieceVisible(id: string): boolean {
    return this.cubies.get(id)?.visible ?? false;
  }
}
