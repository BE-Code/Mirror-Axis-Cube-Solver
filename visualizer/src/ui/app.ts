import {
  formatDec,
  formatHex,
  formatState,
  parseInput,
  parseState,
  SOLVED_STATE,
} from "../codec/state";
import { SLOT_COUNT, SLOTS } from "../codec/slots";

export interface AppCallbacks {
  onStateChange(slots: number[], visibility: boolean[]): void;
}

export function initApp(callbacks: AppCallbacks): {
  setSlots(slots: number[]): void;
  getSlots(): number[];
} {
  const stateInput = document.getElementById("state-input") as HTMLInputElement;
  const parseError = document.getElementById("parse-error") as HTMLParagraphElement;
  const stateHex = document.getElementById("state-hex") as HTMLParagraphElement;
  const stateDec = document.getElementById("state-dec") as HTMLParagraphElement;
  const slotGrid = document.getElementById("slot-grid") as HTMLDivElement;
  const loadSolvedBtn = document.getElementById("load-solved") as HTMLButtonElement;
  const applyBtn = document.getElementById("apply-state") as HTMLButtonElement;

  let slots = parseState(SOLVED_STATE);
  let visibility = Array.from({ length: SLOT_COUNT }, () => true);

  function notify(): void {
    const raw = formatState(slots);
    stateHex.textContent = formatHex(raw);
    stateDec.textContent = formatDec(raw);
    stateInput.value = formatHex(raw);
    renderGrid();
    callbacks.onStateChange([...slots], [...visibility]);
  }

  function updateDisplay(): void {
    notify();
  }

  function renderGrid(): void {
    slotGrid.innerHTML = "";
    for (const slot of SLOTS) {
      const cell = document.createElement("div");
      cell.className = `slot-cell ${slot.type}`;
      if (!visibility[slot.index]) {
        cell.classList.add("slot-hidden");
      }
      cell.title = `Slot ${slot.index}: ${slot.name} (${slot.type})`;

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "slot-visible";
      checkbox.checked = visibility[slot.index] ?? true;
      checkbox.title = "Show piece";
      checkbox.addEventListener("click", (e) => e.stopPropagation());
      checkbox.addEventListener("change", () => {
        visibility[slot.index] = checkbox.checked;
        cell.classList.toggle("slot-hidden", !checkbox.checked);
        callbacks.onStateChange([...slots], [...visibility]);
      });

      const name = document.createElement("span");
      name.className = "slot-name";
      name.textContent = slot.name;

      const value = document.createElement("span");
      value.className = "slot-value";
      value.textContent = String(slots[slot.index]);

      cell.appendChild(checkbox);
      cell.appendChild(name);
      cell.appendChild(value);

      cell.addEventListener("click", () => {
        slots[slot.index] = ((slots[slot.index] ?? 0) + 1) % 4;
        value.textContent = String(slots[slot.index]);
        const raw = formatState(slots);
        stateHex.textContent = formatHex(raw);
        stateDec.textContent = formatDec(raw);
        stateInput.value = formatHex(raw);
        callbacks.onStateChange([...slots], [...visibility]);
      });

      slotGrid.appendChild(cell);
    }
  }

  function applyInput(): boolean {
    try {
      const raw = parseInput(stateInput.value);
      slots = parseState(raw);
      parseError.hidden = true;
      parseError.textContent = "";
      updateDisplay();
      return true;
    } catch (err) {
      parseError.hidden = false;
      parseError.textContent = err instanceof Error ? err.message : String(err);
      return false;
    }
  }

  loadSolvedBtn.addEventListener("click", () => {
    slots = parseState(SOLVED_STATE);
    updateDisplay();
  });

  applyBtn.addEventListener("click", applyInput);

  stateInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") applyInput();
  });

  updateDisplay();

  return {
    setSlots(newSlots: number[]) {
      slots = [...newSlots];
      updateDisplay();
    },
    getSlots() {
      return [...slots];
    },
  };
}

export function hideLoading(): void {
  const el = document.getElementById("loading");
  if (el) el.classList.add("hidden");
}

export function showLoadingError(message: string): void {
  const el = document.getElementById("loading");
  if (el) {
    el.textContent = `Error: ${message}`;
    el.classList.remove("hidden");
  }
}
