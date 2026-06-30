import * as THREE from "three";

const NS = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02";

export function parseMeshXml(xml: string): THREE.BufferGeometry {
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const mesh = doc.getElementsByTagNameNS(NS, "mesh")[0];
  if (!mesh) {
    throw new Error("No mesh found in 3MF object");
  }

  const vertices = mesh.getElementsByTagNameNS(NS, "vertices")[0];
  const triangles = mesh.getElementsByTagNameNS(NS, "triangles")[0];
  if (!vertices || !triangles) {
    throw new Error("Mesh missing vertices or triangles");
  }

  const vertexNodes = vertices.getElementsByTagNameNS(NS, "vertex");
  const positions = new Float32Array(vertexNodes.length * 3);
  for (let i = 0; i < vertexNodes.length; i++) {
    const v = vertexNodes[i]!;
    positions[i * 3] = parseFloat(v.getAttribute("x") ?? "0");
    positions[i * 3 + 1] = parseFloat(v.getAttribute("y") ?? "0");
    positions[i * 3 + 2] = parseFloat(v.getAttribute("z") ?? "0");
  }

  const triNodes = triangles.getElementsByTagNameNS(NS, "triangle");
  const indices = new Uint32Array(triNodes.length * 3);
  for (let i = 0; i < triNodes.length; i++) {
    const tri = triNodes[i]!;
    indices[i * 3] = parseInt(tri.getAttribute("v1") ?? "0", 10);
    indices[i * 3 + 1] = parseInt(tri.getAttribute("v2") ?? "0", 10);
    indices[i * 3 + 2] = parseInt(tri.getAttribute("v3") ?? "0", 10);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setIndex(new THREE.BufferAttribute(indices, 1));
  geometry.computeVertexNormals();
  return geometry;
}

export function computeNormalizeMatrix(coreGeometry: THREE.BufferGeometry): THREE.Matrix4 {
  coreGeometry.computeBoundingBox();
  const box = coreGeometry.boundingBox!;
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2.0 / maxDim : 1;

  const m = new THREE.Matrix4();
  m.makeTranslation(-center.x, -center.y, -center.z);
  const scaleM = new THREE.Matrix4().makeScale(scale, scale, scale);
  return scaleM.multiply(m);
}

export function extractRotationMatrix(matrix: THREE.Matrix4): THREE.Matrix4 {
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  matrix.decompose(position, quaternion, scale);
  return new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
}

/** Relative rotation of core part B vs part A (same center, orthogonal interlock). */
export function computeCoreRelativeRotation(
  partA: THREE.Matrix4,
  partB: THREE.Matrix4,
): THREE.Matrix4 {
  const rotA = extractRotationMatrix(partA);
  const rotB = extractRotationMatrix(partB);
  return rotB.clone().multiply(rotA.clone().invert());
}

/** Rotation that maps one surface direction to another (for propagating tile poses). */
export function rotationBetweenDirections(
  from: THREE.Vector3,
  to: THREE.Vector3,
): THREE.Matrix4 {
  const a = from.clone();
  const b = to.clone();
  if (a.lengthSq() < 1e-8 || b.lengthSq() < 1e-8) {
    return new THREE.Matrix4();
  }
  a.normalize();
  b.normalize();
  const q = new THREE.Quaternion().setFromUnitVectors(a, b);
  return new THREE.Matrix4().makeRotationFromQuaternion(q);
}

export function anchorMatrix(
  position: THREE.Vector3,
  normal: THREE.Vector3,
  up: THREE.Vector3,
): THREE.Matrix4 {
  const z = normal.clone().normalize();
  const x = new THREE.Vector3().crossVectors(up, z).normalize();
  if (x.lengthSq() < 1e-8) {
    x.set(1, 0, 0);
  }
  const y = new THREE.Vector3().crossVectors(z, x).normalize();
  const m = new THREE.Matrix4().makeBasis(x, y, z);
  m.setPosition(position);
  return m;
}

export function extractNormal(matrix: THREE.Matrix4): THREE.Vector3 {
  const normal = new THREE.Vector3();
  matrix.extractBasis(new THREE.Vector3(), new THREE.Vector3(), normal);
  return normal.normalize();
}

export function applyOrientDelta(
  baseMatrix: THREE.Matrix4,
  value: number,
  solvedValue: number,
): THREE.Matrix4 {
  const delta = value - solvedValue;
  if (delta === 0) {
    return baseMatrix.clone();
  }

  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  baseMatrix.decompose(position, quaternion, scale);

  const normal = extractNormal(baseMatrix);
  const deltaQuat = new THREE.Quaternion().setFromAxisAngle(
    normal,
    delta * (Math.PI / 2),
  );
  quaternion.premultiply(deltaQuat);

  const result = new THREE.Matrix4();
  result.compose(position, quaternion, scale);
  return result;
}
