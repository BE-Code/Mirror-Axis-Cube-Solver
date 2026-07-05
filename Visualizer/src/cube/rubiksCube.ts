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
import { applyTuningToWrapper } from "../model/cubeSpaceRotation";
import {
  createDefaultTuning,
  foldTallies,
  formatTuningForExport,
  type PieceTuningState,
  type PieceTuningView,
  type TuningOp,
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
  private readonly tuningDecomposed = new Map<string, ReturnType<typeof applyTuningToWrapper>>();

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

  getTuning(id: string): PieceTuningView | undefined {
    const state = this.tuningState.get(id);
    if (!state) return undefined;
    return {
      ops: [...state.ops],
      ...foldTallies(state.ops),
    };
  }

  resetTuning(id: string): void {
    this.tuningState.set(id, createDefaultTuning(id));
    this.applyTuning(id);
  }

  formatTuningExport(id: string): string {
    const state = this.tuningState.get(id) ?? createDefaultTuning(id);
    const decomposed = this.tuningDecomposed.get(id);
    if (!decomposed) {
      return formatTuningForExport(id, state.ops, {
        position: [0, 0, 0],
        quaternion: [0, 0, 0, 1],
        scale: [1, 1, 1],
      });
    }
    return formatTuningForExport(id, state.ops, decomposed);
  }

  nudgeRotation(id: string, axis: "x" | "y" | "z", deltaDeg: number): void {
    if (deltaDeg === 0) return;
    this.appendOp(id, { kind: "rotate", axis, deltaDeg });
  }

  nudgePosition(id: string, axis: "x" | "y" | "z", delta: number): void {
    if (delta === 0) return;
    this.appendOp(id, { kind: "translate", axis, delta });
  }

  nudgeScale(id: string, delta: number): void {
    if (delta === 0) return;
    this.appendOp(id, { kind: "scale", delta });
  }

  protected createCubie(slot: CubieSlot): THREE.Object3D {
    return createBoxCubie(slot);
  }

  private appendOp(id: string, op: TuningOp): void {
    const current = this.tuningState.get(id) ?? createDefaultTuning(id);
    this.tuningState.set(id, { ops: [...current.ops, op] });
    this.applyTuning(id);
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

    const wrapper = new THREE.Group();
    wrapper.name = `piece-${id}`;
    wrapper.userData.slot = slot;
    wrapper.userData.tunable = true;
    wrapper.add(content);

    this.tuningState.set(id, createDefaultTuning(id));
    this.applyTuning(id, wrapper);

    this.group.remove(current);
    disposeObject3D(current);
    this.cubies.set(id, wrapper);
    this.group.add(wrapper);
  }

  private applyTuning(id: string, cubie = this.cubies.get(id)): void {
    if (!cubie || !cubie.userData.tunable) return;

    const slot = cubie.userData.slot as CubieSlot;
    const state = this.tuningState.get(id) ?? createDefaultTuning(id);
    const slotVec = new THREE.Vector3(
      slot.x * CUBIE_SPACING,
      slot.y * CUBIE_SPACING,
      slot.z * CUBIE_SPACING,
    );

    const decomposed = applyTuningToWrapper(cubie, slotVec, state.ops);
    this.tuningDecomposed.set(id, decomposed);
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
