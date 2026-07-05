import JSZip from "jszip";
import * as THREE from "three";

const NS = "http://schemas.microsoft.com/3dmanufacturing/core/2015/02";

export async function load3mfGeometry(url: string): Promise<THREE.BufferGeometry> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load 3MF: ${url} (${response.status})`);
  }

  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const modelEntry = Object.values(zip.files).find((file) =>
    file.name.toLowerCase().endsWith("3dmodel.model"),
  );
  if (!modelEntry) {
    throw new Error(`No 3dmodel.model found in ${url}`);
  }

  const xml = await modelEntry.async("text");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  if (doc.querySelector("parsererror")) {
    throw new Error(`Invalid 3MF XML in ${url}`);
  }

  const vertices = [...doc.getElementsByTagNameNS(NS, "vertex")].map((vertex) => {
    return new THREE.Vector3(
      parseFloat(vertex.getAttribute("x") ?? "0"),
      parseFloat(vertex.getAttribute("y") ?? "0"),
      parseFloat(vertex.getAttribute("z") ?? "0"),
    );
  });

  const positions: number[] = [];
  for (const triangle of doc.getElementsByTagNameNS(NS, "triangle")) {
    const i1 = Number(triangle.getAttribute("v1"));
    const i2 = Number(triangle.getAttribute("v2"));
    const i3 = Number(triangle.getAttribute("v3"));
    for (const index of [i1, i2, i3]) {
      const vertex = vertices[index];
      positions.push(vertex.x, vertex.y, vertex.z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  return geometry;
}
