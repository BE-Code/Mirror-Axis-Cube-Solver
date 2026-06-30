import * as THREE from "three";
import { parseMeshXml, computeNormalizeMatrix } from "./geometry";

const NS = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02";
const P_NS = "http://schemas.microsoft.com/3dmanufacturing/production/2015/06";

export function parse3mfTransform(values: string): THREE.Matrix4 {
  const t = values.trim().split(/\s+/).map(Number);
  if (t.length !== 12) {
    throw new Error(`Expected 12 transform values, got ${t.length}`);
  }
  const m = new THREE.Matrix4();
  m.set(
    t[0], t[1], t[2], t[9],
    t[3], t[4], t[5], t[10],
    t[6], t[7], t[8], t[11],
    0, 0, 0, 1,
  );
  return m;
}

export function isAssembledItem(matrix: THREE.Matrix4): boolean {
  const tz = matrix.elements[14]!;
  return tz > 2.0;
}

export function leafFilename(path: string): string {
  return path.split("/").pop() ?? path;
}

export function getLeafPath(componentEl: Element): string {
  const path =
    componentEl.getAttributeNS(P_NS, "path") ??
    componentEl.getAttribute("p:path") ??
    componentEl.getAttribute("path");
  if (!path) {
    throw new Error("Component missing path attribute");
  }
  return path.startsWith("/") ? path.slice(1) : path;
}

export interface Placement {
  prototype: string;
  matrix: THREE.Matrix4;
}

export interface Loaded3mf {
  prototypes: Map<string, THREE.BufferGeometry>;
  corePlacements: Placement[];
  tilePlacements: Placement[];
  normalizeMatrix: THREE.Matrix4;
}

interface ObjectResource {
  id: string;
  components: { objectId: string; path: string; transform: THREE.Matrix4 }[];
}

function parseObjectResources(doc: Document): Map<string, ObjectResource> {
  const objects = new Map<string, ObjectResource>();
  const resourceNodes = doc.getElementsByTagNameNS(NS, "resources")[0];
  if (!resourceNodes) return objects;

  const objectNodes = resourceNodes.getElementsByTagNameNS(NS, "object");
  for (let i = 0; i < objectNodes.length; i++) {
    const objEl = objectNodes[i]!;
    const id = objEl.getAttribute("id");
    if (!id) continue;

    const componentsEl = objEl.getElementsByTagNameNS(NS, "components")[0];
    if (!componentsEl) continue;

    const compNodes = componentsEl.getElementsByTagNameNS(NS, "component");
    const components: ObjectResource["components"] = [];
    for (let j = 0; j < compNodes.length; j++) {
      const comp = compNodes[j]!;
      const objectId = comp.getAttribute("objectid");
      if (!objectId) continue;
      const path = getLeafPath(comp);
      const transformStr = comp.getAttribute("transform");
      const transform = transformStr
        ? parse3mfTransform(transformStr)
        : new THREE.Matrix4();
      components.push({ objectId, path, transform });
    }
    objects.set(id, { id, components });
  }
  return objects;
}

function resolveLeafPaths(
  objectId: string,
  objects: Map<string, ObjectResource>,
  parentTransform: THREE.Matrix4,
): { path: string; transform: THREE.Matrix4 }[] {
  const obj = objects.get(objectId);
  if (!obj) return [];

  const results: { path: string; transform: THREE.Matrix4 }[] = [];
  for (const comp of obj.components) {
    const world = parentTransform.clone().multiply(comp.transform);
    const child = objects.get(comp.objectId);
    if (child) {
      results.push(...resolveLeafPaths(comp.objectId, objects, world));
    } else {
      results.push({ path: comp.path, transform: world });
    }
  }
  return results;
}

export async function load3mf(url: string): Promise<Loaded3mf> {
  const JSZip = (await import("jszip")).default;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const buffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);

  const modelFile = zip.file("3D/3dmodel.model");
  if (!modelFile) {
    throw new Error("3MF missing 3D/3dmodel.model");
  }
  const modelXml = await modelFile.async("string");
  const doc = new DOMParser().parseFromString(modelXml, "application/xml");
  const objects = parseObjectResources(doc);

  const prototypes = new Map<string, THREE.BufferGeometry>();
  const cache = new Map<string, string>();

  async function loadPrototype(path: string): Promise<THREE.BufferGeometry> {
    const filename = leafFilename(path);
    const existing = prototypes.get(filename);
    if (existing) return existing;

    let xml = cache.get(path);
    if (!xml) {
      const file = zip.file(path);
      if (!file) {
        throw new Error(`Missing mesh file: ${path}`);
      }
      xml = await file.async("string");
      cache.set(path, xml);
    }
    const geometry = parseMeshXml(xml).clone();
    prototypes.set(filename, geometry);
    return geometry;
  }

  const build = doc.getElementsByTagNameNS(NS, "build")[0];
  if (!build) {
    throw new Error("3MF missing build section");
  }

  const items = build.getElementsByTagNameNS(NS, "item");
  const corePlacements: Placement[] = [];
  const tilePlacements: Placement[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    const objectId = item.getAttribute("objectid");
    const transformStr = item.getAttribute("transform");
    if (!objectId || !transformStr) continue;

    const itemMatrix = parse3mfTransform(transformStr);
    if (!isAssembledItem(itemMatrix)) continue;

    const leaves = resolveLeafPaths(objectId, objects, itemMatrix);
    for (const leaf of leaves) {
      const filename = leafFilename(leaf.path);
      await loadPrototype(leaf.path);
      const placement: Placement = { prototype: filename, matrix: leaf.transform.clone() };
      if (filename === "object_1.model" || filename === "object_2.model") {
        corePlacements.push(placement);
      } else {
        tilePlacements.push(placement);
      }
    }
  }

  const coreGeo = prototypes.get("object_1.model");
  if (!coreGeo) {
    throw new Error("Core mesh object_1.model not found");
  }
  const normalizeMatrix = computeNormalizeMatrix(coreGeo);

  return { prototypes, corePlacements, tilePlacements, normalizeMatrix };
}
