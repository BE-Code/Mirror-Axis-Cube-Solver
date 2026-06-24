# Mirror Axis Cube Solver

Minimum-move solver for a colorless **Mirror Axis Cube**. It searches for a shortest sequence of face turns using **bidirectional BFS**: one search expands from the scrambled state and another from the solved state until they meet in the middle.

## Requirements

- [Rust](https://www.rust-lang.org/) (stable toolchain via [rustup](https://rustup.rs/))

On macOS, install Rust with:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then load Cargo into your current shell (new terminals usually pick this up automatically from `~/.cargo/env`):

```bash
source "$HOME/.cargo/env"
```

Verify the install:

```bash
rustc --version
cargo --version
```

## Build and run

```bash
cargo build
cargo run -- solve
cargo run -- probe --layers 12
```

Release builds are faster for longer searches:

```bash
cargo run --release -- solve
```

## Commands

### `solve`

Runs bidirectional BFS from `START_STATE` to `SOLVED_STATE`. On success, prints:

- The move sequence (shortest path found)
- Search stats: depth, nodes expanded, visited count, max frontier size

### `probe`

Runs a backward BFS from `SOLVED_STATE` for a fixed number of layers. Useful for estimating how the reachable state space grows before committing to a full solve.

```bash
cargo run -- probe --layers 12
```

## How the search works

1. **Bidirectional BFS** — Frontiers grow from start and goal simultaneously. The side with the smaller frontier expands next, keeping memory use more balanced.
2. **Meeting point** — When a state is reached from both directions, the search records it and stops once no shorter meeting is possible.
3. **Path reconstruction** — Moves from the start meeting point and inverse moves from the goal meeting point are stitched together.
4. **Parallelism** — Each BFS layer is expanded in parallel with [Rayon](https://github.com/rayon-rs/rayon).
