import "./style.css";
import { createScene } from "./scene/createScene";
import { createPiecePanel } from "./ui/piecePanel";

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #canvas element");
}

const panelRoot = document.getElementById("piece-panel-root");
if (!panelRoot) {
  throw new Error("Missing #piece-panel-root element");
}

const scene = createScene(canvas);

createPiecePanel(panelRoot, scene.cube, {
  onToggle: (id, visible) => scene.cube.setPieceVisible(id, visible),
});
