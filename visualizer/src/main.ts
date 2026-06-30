import { solvedSlots } from "./codec/slots";
import { load3mf } from "./model/load3mf";
import { prepareSceneAssets } from "./model/buildScene";
import { CubeRenderer } from "./scene/renderer";
import { hideLoading, initApp, showLoadingError } from "./ui/app";

const MODEL_URL = "/Axis+Cube+Tile+Release.3mf";

async function main(): Promise<void> {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  const renderer = new CubeRenderer(canvas);

  initApp({
    onStateChange(slots, visibility) {
      renderer.renderState(slots, visibility);
    },
  });

  try {
    const loaded = await load3mf(MODEL_URL);
    const assets = prepareSceneAssets(loaded);
    renderer.setAssets(assets);
    renderer.renderState(solvedSlots());
    hideLoading();
  } catch (err) {
    showLoadingError(err instanceof Error ? err.message : String(err));
    console.error(err);
  }
}

main();
