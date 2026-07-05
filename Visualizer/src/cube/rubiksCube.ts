import * as THREE from "three";
import { createBoxCubie } from "./cubie";
import { buildCubieSlots, type CubieSlot } from "./pieces";

export class RubiksCube {
  readonly group: THREE.Group;
  private readonly cubies: THREE.Mesh[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = "rubiks-cube";

    for (const slot of buildCubieSlots()) {
      const cubie = this.createCubie(slot);
      this.cubies.push(cubie);
      this.group.add(cubie);
    }
  }

  /** Override point for swapping individual slots to 3MF models. */
  protected createCubie(slot: CubieSlot): THREE.Mesh {
    return createBoxCubie(slot);
  }

  getCubies(): readonly THREE.Mesh[] {
    return this.cubies;
  }
}
