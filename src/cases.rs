//! Named cube states for solving and tests.
//!
//! Slot layout (see `Mirror Axis Cube Encoding.drawio`):
//! - 0–4:   Centers F, L, B, R, U
//! - 5–12:  Corners FLD, BLD, BRD, FRD, FLU, BLU, BRU, FRU
//! - 13–24: Sides FD, LD, BD, RD, FL, BL, BR, FR, FU, LU, BU, RU

use crate::state::State;

pub const SOLVED: State = State::from_raw(0)
    // Centers
    .set_slot(0, 2) // F
    .set_slot(1, 1) // L
    .set_slot(2, 3) // B
    .set_slot(3, 0) // R
    .set_slot(4, 3) // U
    // Corners
    .set_slot(5, 3) // FLD
    .set_slot(6, 2) // BLD
    .set_slot(7, 0) // BRD
    .set_slot(8, 1) // FRD
    .set_slot(9, 0) // FLU
    .set_slot(10, 1) // BLU
    .set_slot(11, 3) // BRU
    .set_slot(12, 2) // FRU
    // Sides
    .set_slot(13, 1) // FD
    .set_slot(14, 0) // LD
    .set_slot(15, 3) // BD
    .set_slot(16, 3) // RD
    .set_slot(17, 3) // FL
    .set_slot(18, 1) // BL
    .set_slot(19, 2) // BR
    .set_slot(20, 0) // FR
    .set_slot(21, 2) // FU
    .set_slot(22, 2) // LU
    .set_slot(23, 0) // BU
    .set_slot(24, 1); // RU

pub const EXAMPLE_SCRAMBLE: State = State::from_raw(0)
    // Centers
    .set_slot(0, 2) // F
    .set_slot(1, 1) // L
    .set_slot(2, 3) // B
    .set_slot(3, 0) // R
    .set_slot(4, 3) // U
    // Corners
    .set_slot(5, 3) // FLD
    .set_slot(6, 2) // BLD
    .set_slot(7, 0) // BRD
    .set_slot(8, 1) // FRD
    .set_slot(9, 0) // FLU
    .set_slot(10, 1) // BLU
    .set_slot(11, 3) // BRU
    .set_slot(12, 2) // FRU
    // Sides
    .set_slot(13, 1) // FD
    .set_slot(14, 0) // LD
    .set_slot(15, 3) // BD
    .set_slot(16, 3) // RD
    .set_slot(17, 3) // FL
    .set_slot(18, 1) // BL
    .set_slot(19, 2) // BR
    .set_slot(20, 0) // FR
    .set_slot(21, 2) // FU
    .set_slot(22, 2) // LU
    .set_slot(23, 0) // BU
    .set_slot(24, 1); // RU

/// Active start state for the solver — change this to switch cases.
pub const START_STATE: State = EXAMPLE_SCRAMBLE;

/// Active goal state for the solver.
pub const SOLVED_STATE: State = SOLVED;
