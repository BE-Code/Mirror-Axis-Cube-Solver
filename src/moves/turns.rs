use crate::state::{slot, State};

const U_CENTER_MAPPING: [u8; 4] = [3, 0, 1, 2];
const U_CORNER_MAPPING: [u8; 4] = [0, 2, 1, 3];
// const U_SIDE_MAPPING: [u8; 4] = [-0, -1, -2, -3];

/// Clockwise quarter turn of the U face.
pub(crate) fn turn_u(state: State) -> State {
    state
        .remap_slot(slot::U, slot::U, U_CENTER_MAPPING)
        .remap_slot(slot::FLU, slot::BLU, U_CORNER_MAPPING)

    // blu, bru, fru
}

// const UW_CENTER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const UW_CORNER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const UW_SIDE_MAPPING:   [u8; 4] = [-0, -1, -2, -3];

/// Clockwise quarter turn of the Uw (whole-cube) axis.
pub(crate) fn turn_uw(state: State) -> State {
    let _ = state;
    state
}

/// Clockwise quarter turn of the L face.
pub(crate) fn turn_l(state: State) -> State {
    let _ = state;
    state
}

/// Clockwise quarter turn of the R face.
pub(crate) fn turn_r(state: State) -> State {
    let _ = state;
    state
}

/// Clockwise quarter turn of the F face.
pub(crate) fn turn_f(state: State) -> State {
    let _ = state;
    state
}

/// Clockwise quarter turn of the B face.
pub(crate) fn turn_b(state: State) -> State {
    let _ = state;
    state
}
