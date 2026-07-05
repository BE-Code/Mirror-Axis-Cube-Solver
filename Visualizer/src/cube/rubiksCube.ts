import * as THREE from "three";
import { createBoxCubie } from "./cubie";
import { buildCubieSlots, type CubieSlot } from "./pieces";

export class RubiksCube {
  readonly group: THREE.Group;
  private readonly cubies = new Map<string, THREE.Mesh>();

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "rubiks-cube";

    for (const slot of buildCubieSlots()) {
      const cubie = this.createCubie(slot);
      this.cubies.set(slot.id, cubie);
      this.group.add(cubie);
    }
  }

  /** Override point for swapping individual slots to 3MF models. */
  protected createCubie(slot: CubieSlot): THREE.Mesh {
    return createBoxCubie(slot);
  }

  getPieceIds(): string[] {
    return [...this.cubies.keys()];
  }

  getCubie(id: string): THREE.Mesh | undefined {
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
