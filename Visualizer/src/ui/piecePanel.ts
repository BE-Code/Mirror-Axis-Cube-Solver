import { comparePieceIds } from "../cube/names";
import { buildCubieSlots } from "../cube/pieces";
import type { RubiksCube } from "../cube/rubiksCube";

export interface PiecePanelOptions {
  onToggle: (id: string, visible: boolean) => void;
}

export function createPiecePanel(
  container: HTMLElement,
  cube: RubiksCube,
  options: PiecePanelOptions,
): void {
  const slots = [...buildCubieSlots()].sort((a, b) =>
    comparePieceIds(a.id, b.id, a.kind, b.kind),
  );

  const panel = document.createElement("aside");
  panel.className = "piece-panel";
  panel.innerHTML = `
    <div class="piece-panel__header">
      <h2>Pieces</h2>
      <div class="piece-panel__actions">
        <button type="button" class="btn-link" data-action="all-on">All on</button>
        <button type="button" class="btn-link" data-action="all-off">All off</button>
      </div>
    </div>
    <div class="piece-panel__groups"></div>
  `;

  const groupsEl = panel.querySelector(".piece-panel__groups");
  if (!groupsEl) throw new Error("Missing piece panel groups element");

  const byKind = new Map<string, typeof slots>();
  for (const slot of slots) {
    const label = kindLabel(slot.kind);
    const group = byKind.get(label) ?? [];
    group.push(slot);
    byKind.set(label, group);
  }

  for (const [kindLabelText, kindSlots] of byKind) {
    const section = document.createElement("section");
    section.className = "piece-group";
    section.innerHTML = `<h3 class="piece-group__title">${kindLabelText}</h3>`;

    const list = document.createElement("div");
    list.className = "piece-group__list";

    for (const slot of kindSlots) {
      const row = document.createElement("label");
      row.className = "piece-toggle";
      row.htmlFor = `piece-${slot.id}`;

      const input = document.createElement("input");
      input.type = "checkbox";
      input.id = `piece-${slot.id}`;
      input.checked = cube.isPieceVisible(slot.id);
      input.addEventListener("change", () => {
        options.onToggle(slot.id, input.checked);
      });

      const name = document.createElement("span");
      name.className = "piece-toggle__name";
      name.textContent = slot.id;

      row.append(input, name);
      list.append(row);
    }

    section.append(list);
    groupsEl.append(section);
  }

  panel.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.action;
    if (!action) return;

    const visible = action === "all-on";
    for (const slot of slots) {
      const input = panel.querySelector<HTMLInputElement>(`#piece-${slot.id}`);
      if (input) input.checked = visible;
      options.onToggle(slot.id, visible);
    }
  });

  container.append(panel);
}

function kindLabel(kind: string): string {
  switch (kind) {
    case "center":
      return "Centers";
    case "edge":
      return "Edges";
    case "corner":
      return "Corners";
    case "core":
      return "Core";
    default:
      return kind;
  }
}
