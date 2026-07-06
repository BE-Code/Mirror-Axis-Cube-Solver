//! Named cube states for solving and tests.

use crate::state::State;

pub const SOLVED: State = crate::state! {
    F: 2,
    L: 1,
    B: 3,
    R: 0,
    U: 3,
    FLD: 3,
    BLD: 2,
    BRD: 0,
    FRD: 1,
    FLU: 0,
    BLU: 1,
    BRU: 3,
    FRU: 2,
    FD: 1,
    LD: 0,
    BD: 3,
    RD: 3,
    FL: 3,
    BL: 1,
    BR: 2,
    FR: 0,
    FU: 2,
    LU: 2,
    BU: 0,
    RU: 1,
};

pub const EXAMPLE_SCRAMBLE: State = crate::state! {
    F: 2,
    L: 1,
    B: 3,
    R: 0,
    U: 3,
    FLD: 3,
    BLD: 2,
    BRD: 0,
    FRD: 1,
    FLU: 0,
    BLU: 1,
    BRU: 3,
    FRU: 2,
    FD: 1,
    LD: 0,
    BD: 3,
    RD: 3,
    FL: 3,
    BL: 1,
    BR: 2,
    FR: 0,
    FU: 2,
    LU: 2,
    BU: 0,
    RU: 1,
};

/// Active start state for the solver — change this to switch cases.
pub const START_STATE: State = EXAMPLE_SCRAMBLE;

/// Active goal state for the solver.
pub const SOLVED_STATE: State = SOLVED;
