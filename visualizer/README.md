# Axis Cube Visualizer

Standalone web tool for viewing Mirror Axis Cube states. Loads the 3MF model on the fly, decodes 50-bit state numbers into 25 slot values, and renders the cube in 3D.

This tool is independent of the Rust solver in the parent directory.

## Requirements

- [Node.js](https://nodejs.org/) 18+

## Setup

```bash
cd visualizer
npm install
```

## Run

```bash
npm run dev
```

Open http://localhost:5173/

## Usage

- **State number** — Enter a hex (`0x1289fc6d12f36`) or decimal value and click **Apply**, or press Enter.
- **Load solved** — Resets to the solved reference state.
- **Slot grid** — Click any slot name to cycle its value 0→1→2→3→0. The state number updates automatically.
- **3D view** — Drag to orbit, scroll to zoom.

## State format

25 slots × 2 bits = 50 bits packed into a `u64` (same spec as `src/state.rs` in the solver):

| Slots | Pieces |
|-------|--------|
| 0–4 | Centers F, L, B, R, U |
| 5–12 | Corners FLD … FRU |
| 13–24 | Sides FD … RU |

Solved reference: `0x1289fc6d12f36`

Each slot value 0–3 selects a tile orientation variant (see `Mirror Axis Cube Encoding.drawio` in the repo root).

## 3MF model

The visualizer loads `public/Axis+Cube+Tile+Release.3mf` at runtime. Flat print-plate tiles (Z ≤ 2 mm) are filtered out; only the assembled cube preview region is used for geometry and calibration.

## Build

```bash
npm run build
npm run preview
```

Output is in `dist/`.
