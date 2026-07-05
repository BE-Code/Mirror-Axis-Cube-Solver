import type { RubiksCube } from "../cube/rubiksCube";

const AXIS_LABELS = ["X", "Y", "Z"] as const;

const ROTATION_DELTAS = [-15, -1, 1, 15];
const POSITION_DELTAS = [-0.15, -0.01, 0.01, 0.15];
const SCALE_DELTAS = [-0.15, -0.01, 0.01, 0.15];

export interface TuningPanelOptions {
  onYAxisToggle: (visible: boolean) => void;
}

function formatDelta(delta: number): string {
  if (Number.isInteger(delta)) {
    return delta > 0 ? `+${delta}` : String(delta);
  }
  const text = delta.toFixed(2);
  return delta > 0 ? `+${text}` : text;
}

function createStepRow(
  label: string,
  deltas: number[],
  inputAttrs: Record<string, string>,
  deltaAttr: string,
  buttonAttrs: Record<string, string> = {},
): { row: HTMLElement; input: HTMLInputElement } {
  const row = document.createElement("div");
  row.className = "tuning-row";

  const extraButtonAttrs = Object.entries(buttonAttrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  const buttons = deltas
    .map(
      (delta) =>
        `<button type="button" class="btn-step" ${deltaAttr}="${delta}" ${extraButtonAttrs}>${formatDelta(delta)}</button>`,
    )
    .join("");

  const attrs = Object.entries(inputAttrs)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");

  row.innerHTML = `
    <span class="tuning-row__label">${label}</span>
    <div class="tuning-row__controls">
      ${buttons}
      <input type="number" class="tuning-field__number tuning-row__value" ${attrs} step="any" value="0" />
    </div>
  `;

  const input = row.querySelector<HTMLInputElement>(".tuning-row__value");
  if (!input) throw new Error(`Missing input for ${label}`);
  return { row, input };
}

export function createTuningPanel(
  container: HTMLElement,
  cube: RubiksCube,
  options: TuningPanelOptions,
): { refresh: () => void } {
  const tunableIds = cube.getTunablePieceIds();
  let activeId = tunableIds[0] ?? "U";

  const panel = document.createElement("aside");
  panel.className = "tuning-panel";
  panel.innerHTML = `
    <div class="tuning-panel__header">
      <h2>Model Tuning</h2>
      <button type="button" class="btn-link" data-action="reset">Reset</button>
    </div>
    <div class="tuning-panel__body">
      <label class="tuning-field">
        <span class="tuning-field__label">Piece</span>
        <select class="tuning-field__select" data-role="piece-select"></select>
      </label>
      <label class="tuning-field tuning-field--inline">
        <input type="checkbox" data-role="y-axis" checked />
        <span class="tuning-field__label">Y axis guide</span>
      </label>
      <div class="tuning-section">
        <h3 class="tuning-section__title">Rotation (cube axes)</h3>
        <div data-role="rotation-controls"></div>
      </div>
      <div class="tuning-section">
        <h3 class="tuning-section__title">Position (cube axes)</h3>
        <div data-role="position-controls"></div>
      </div>
      <div class="tuning-section">
        <h3 class="tuning-section__title">Scale</h3>
        <div data-role="scale-controls"></div>
      </div>
      <label class="tuning-field">
        <span class="tuning-field__label">Export values</span>
        <textarea class="tuning-export" data-role="export" readonly rows="6"></textarea>
      </label>
      <button type="button" class="btn-secondary" data-action="copy">Copy values</button>
    </div>
  `;

  const pieceSelect = panel.querySelector<HTMLSelectElement>("[data-role=piece-select]");
  const rotationControlsEl = panel.querySelector("[data-role=rotation-controls]");
  const positionControlsEl = panel.querySelector("[data-role=position-controls]");
  const scaleControlsEl = panel.querySelector("[data-role=scale-controls]");
  const exportArea = panel.querySelector<HTMLTextAreaElement>("[data-role=export]");
  const yAxisToggle = panel.querySelector<HTMLInputElement>("[data-role=y-axis]");

  if (
    !pieceSelect ||
    !rotationControlsEl ||
    !positionControlsEl ||
    !scaleControlsEl ||
    !exportArea ||
    !yAxisToggle
  ) {
    throw new Error("Missing tuning panel elements");
  }

  for (const id of tunableIds) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = id;
    pieceSelect.append(option);
  }
  pieceSelect.value = activeId;

  const rotationInputs = new Map<number, HTMLInputElement>();
  const positionInputs = new Map<number, HTMLInputElement>();

  for (let component = 0; component < 3; component++) {
    const { row, input } = createStepRow(
      AXIS_LABELS[component],
      ROTATION_DELTAS,
      { "data-rot-component": String(component) },
      "data-rot-delta",
      { "data-rot-component": String(component) },
    );
    rotationInputs.set(component, input);
    rotationControlsEl.append(row);

    const pos = createStepRow(
      AXIS_LABELS[component],
      POSITION_DELTAS,
      { "data-pos-component": String(component) },
      "data-pos-delta",
      { "data-pos-component": String(component) },
    );
    positionInputs.set(component, pos.input);
    positionControlsEl.append(pos.row);
  }

  const { row: scaleRow, input: scaleInput } = createStepRow(
    "S",
    SCALE_DELTAS,
    { "data-role": "scale-value" },
    "data-scale-delta",
  );
  scaleControlsEl.append(scaleRow);

  const updateExport = () => {
    exportArea.value = cube.formatTuningExport(activeId);
  };

  const syncUiFromCube = () => {
    const state = cube.getTuning(activeId);
    if (!state) return;

    for (const [component, input] of rotationInputs) {
      input.value = String(state.twistDeg[component as 0 | 1 | 2]);
    }

    for (const [component, input] of positionInputs) {
      input.value = String(state.position[component]);
    }

    scaleInput.value = String(state.scale);
    updateExport();
  };

  for (const [component, input] of rotationInputs) {
    input.addEventListener("change", () => {
      const state = cube.getTuning(activeId);
      if (!state) return;
      const value = Number(input.value);
      if (Number.isNaN(value)) return;
      const axis = component === 0 ? "x" : component === 1 ? "y" : "z";
      const delta = value - state.twistDeg[component as 0 | 1 | 2];
      cube.nudgeRotation(activeId, axis, delta);
      syncUiFromCube();
    });
  }

  rotationControlsEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const component = target.dataset.rotComponent;
    const delta = target.dataset.rotDelta;
    if (component === undefined || !delta) return;
    const axis = Number(component) === 0 ? "x" : Number(component) === 1 ? "y" : "z";
    cube.nudgeRotation(activeId, axis, Number(delta));
    syncUiFromCube();
  });

  for (const [component, input] of positionInputs) {
    input.addEventListener("change", () => {
      const state = cube.getTuning(activeId);
      if (!state) return;
      const value = Number(input.value);
      if (Number.isNaN(value)) return;
      const axis = component === 0 ? "x" : component === 1 ? "y" : "z";
      const delta = value - state.position[component];
      cube.nudgePosition(activeId, axis, delta);
      syncUiFromCube();
    });
  }

  positionControlsEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const component = target.dataset.posComponent;
    const delta = target.dataset.posDelta;
    if (component === undefined || !delta) return;
    const axis = Number(component) === 0 ? "x" : Number(component) === 1 ? "y" : "z";
    cube.nudgePosition(activeId, axis, Number(delta));
    syncUiFromCube();
  });

  scaleInput.addEventListener("change", () => {
    const state = cube.getTuning(activeId);
    if (!state) return;
    const value = Number(scaleInput.value);
    if (Number.isNaN(value)) return;
    cube.nudgeScale(activeId, value - state.scale);
    syncUiFromCube();
  });

  scaleControlsEl.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const delta = target.dataset.scaleDelta;
    if (!delta) return;
    cube.nudgeScale(activeId, Number(delta));
    syncUiFromCube();
  });

  pieceSelect.addEventListener("change", () => {
    activeId = pieceSelect.value;
    syncUiFromCube();
  });

  yAxisToggle.addEventListener("change", () => {
    options.onYAxisToggle(yAxisToggle.checked);
  });

  panel.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.dataset.action === "reset") {
      cube.resetTuning(activeId);
      syncUiFromCube();
      return;
    }

    if (target.dataset.action === "copy") {
      await navigator.clipboard.writeText(exportArea.value);
      target.textContent = "Copied!";
      window.setTimeout(() => {
        target.textContent = "Copy values";
      }, 1200);
    }
  });

  container.append(panel);

  return {
    refresh: syncUiFromCube,
  };
}
