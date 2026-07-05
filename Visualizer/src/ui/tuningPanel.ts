import type { RubiksCube } from "../cube/rubiksCube";
import type { PieceTuningState } from "../model/pieceTuning";

type PositionComponent = 0 | 1 | 2;

const ROTATION_AXES = [
  { axis: "x" as const, label: "X", component: 0 },
  { axis: "y" as const, label: "Y", component: 1 },
  { axis: "z" as const, label: "Z", component: 2 },
];

const POSITION_CONTROLS = [
  { component: 0 as PositionComponent, label: "Pos X", min: -0.5, max: 0.5, step: 0.01 },
  { component: 1 as PositionComponent, label: "Pos Y", min: -0.5, max: 0.5, step: 0.01 },
  { component: 2 as PositionComponent, label: "Pos Z", min: -0.5, max: 0.5, step: 0.01 },
];

export interface TuningPanelOptions {
  onYAxisToggle: (visible: boolean) => void;
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
        <h3 class="tuning-section__title">Position</h3>
        <div data-role="position-controls"></div>
      </div>
      <label class="tuning-field">
        <span class="tuning-field__label">Scale</span>
        <div class="tuning-field__row">
          <input type="range" data-role="scale-range" min="0.1" max="3" step="0.01" value="1" />
          <input type="number" class="tuning-field__number" data-role="scale-number" min="0.1" max="3" step="0.01" value="1" />
        </div>
      </label>
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
  const scaleRange = panel.querySelector<HTMLInputElement>("[data-role=scale-range]");
  const scaleNumber = panel.querySelector<HTMLInputElement>("[data-role=scale-number]");
  const exportArea = panel.querySelector<HTMLTextAreaElement>("[data-role=export]");
  const yAxisToggle = panel.querySelector<HTMLInputElement>("[data-role=y-axis]");

  if (
    !pieceSelect ||
    !rotationControlsEl ||
    !positionControlsEl ||
    !scaleRange ||
    !scaleNumber ||
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
  const positionInputs = new Map<number, { range: HTMLInputElement; number: HTMLInputElement }>();

  for (const { axis, label, component } of ROTATION_AXES) {
    const row = document.createElement("div");
    row.className = "rotation-row";
    row.innerHTML = `
      <span class="rotation-row__label">${label}</span>
      <div class="rotation-row__controls">
        <button type="button" class="btn-step" data-rot-axis="${axis}" data-delta="-15">-15</button>
        <button type="button" class="btn-step" data-rot-axis="${axis}" data-delta="-1">-1</button>
        <input type="number" class="tuning-field__number rotation-row__value" data-rot-component="${component}" step="1" value="0" />
        <button type="button" class="btn-step" data-rot-axis="${axis}" data-delta="1">+1</button>
        <button type="button" class="btn-step" data-rot-axis="${axis}" data-delta="15">+15</button>
      </div>
    `;
    const input = row.querySelector<HTMLInputElement>(`[data-rot-component="${component}"]`);
    if (!input) throw new Error(`Missing rotation input for ${label}`);
    rotationInputs.set(component, input);
    rotationControlsEl.append(row);
  }

  for (const control of POSITION_CONTROLS) {
    const block = document.createElement("label");
    block.className = "tuning-field";
    block.innerHTML = `
      <span class="tuning-field__label">${control.label}</span>
      <div class="tuning-field__row">
        <input type="range" data-pos-component="${control.component}" min="${control.min}" max="${control.max}" step="${control.step}" value="0" />
        <input type="number" class="tuning-field__number" data-pos-component="${control.component}" min="${control.min}" max="${control.max}" step="${control.step}" value="0" />
      </div>
    `;
    const range = block.querySelector<HTMLInputElement>(
      `input[type=range][data-pos-component="${control.component}"]`,
    );
    const number = block.querySelector<HTMLInputElement>(
      `input[type=number][data-pos-component="${control.component}"]`,
    );
    if (!range || !number) throw new Error(`Missing position inputs for ${control.label}`);
    positionInputs.set(control.component, { range, number });
    positionControlsEl.append(block);
  }

  const updateExport = () => {
    exportArea.value = cube.formatTuningExport(activeId);
  };

  const syncUiFromCube = () => {
    const state = cube.getTuning(activeId);
    if (!state) return;

    for (const [component, input] of rotationInputs) {
      input.value = String(state.twistDeg[component as 0 | 1 | 2]);
    }

    for (const [component, inputs] of positionInputs) {
      const value = state.position[component];
      inputs.range.value = String(value);
      inputs.number.value = String(value);
    }

    scaleRange.value = String(state.scale);
    scaleNumber.value = String(state.scale);
    updateExport();
  };

  const applyPartial = (partial: Partial<PieceTuningState>) => {
    cube.setTuning(activeId, partial);
    syncUiFromCube();
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
    const axis = target.dataset.rotAxis;
    const delta = target.dataset.delta;
    if (!axis || !delta) return;
    if (axis !== "x" && axis !== "y" && axis !== "z") return;
    cube.nudgeRotation(activeId, axis, Number(delta));
    syncUiFromCube();
  });

  for (const [component, inputs] of positionInputs) {
    const onChange = (raw: string) => {
      const value = Number(raw);
      if (Number.isNaN(value)) return;
      const state = cube.getTuning(activeId);
      if (!state) return;
      const position = [...state.position] as [number, number, number];
      position[component] = value;
      applyPartial({ position });
    };

    inputs.range.addEventListener("input", () => {
      inputs.number.value = inputs.range.value;
      onChange(inputs.range.value);
    });
    inputs.number.addEventListener("change", () => {
      inputs.range.value = inputs.number.value;
      onChange(inputs.number.value);
    });
  }

  const syncScale = (raw: string) => {
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    scaleRange.value = String(value);
    scaleNumber.value = String(value);
    applyPartial({ scale: value });
  };

  scaleRange.addEventListener("input", () => syncScale(scaleRange.value));
  scaleNumber.addEventListener("change", () => syncScale(scaleNumber.value));

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
