import "./style.css";
import { createScene } from "./scene/createScene";
import { createPiecePanel } from "./ui/piecePanel";
import { createTuningPanel } from "./ui/tuningPanel";

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #canvas element");
}

const panelRoot = document.getElementById("piece-panel-root");
if (!panelRoot) {
  throw new Error("Missing #piece-panel-root element");
}

const tuningRoot = document.getElementById("tuning-panel-root");
if (!tuningRoot) {
  throw new Error("Missing #tuning-panel-root element");
}

const scene = createScene(canvas);

createPiecePanel(panelRoot, scene.cube, {
  onToggle: (id, visible) => scene.cube.setPieceVisible(id, visible),
});

const tuningPanel = createTuningPanel(tuningRoot, scene.cube, {
  onYAxisToggle: (visible) => scene.setYAxisVisible(visible),
});

void scene.cube.loadAssignedModels().then(() => {
  tuningPanel.refresh();
});
