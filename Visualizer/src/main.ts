import "./style.css";
import { createScene } from "./scene/createScene";

const canvas = document.getElementById("canvas");
if (!(canvas instanceof HTMLCanvasElement)) {
  throw new Error("Missing #canvas element");
}

createScene(canvas);
