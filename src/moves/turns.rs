use crate::state::{slot, SlotRemap, State};

const U_CENTER_MAPPING: [u8; 4] = [3, 0, 1, 2];
const U_CORNER_MAPPING: [u8; 4] = [0, 2, 1, 3];
const U_SIDE_MAPPING: [u8; 4] = [0, 1, 3, 2];

const U_TURN_REMAPS: [SlotRemap; 9] = [
    SlotRemap::new(slot::U, slot::U, U_CENTER_MAPPING),
    SlotRemap::new(slot::FLU, slot::BLU, U_CORNER_MAPPING),
    SlotRemap::new(slot::BLU, slot::BRU, U_CORNER_MAPPING),
    SlotRemap::new(slot::BRU, slot::FRU, U_CORNER_MAPPING),
    SlotRemap::new(slot::FRU, slot::FLU, U_CORNER_MAPPING),
    SlotRemap::new(slot::FU, slot::LU, U_SIDE_MAPPING),
    SlotRemap::new(slot::LU, slot::BU, U_SIDE_MAPPING),
    SlotRemap::new(slot::BU, slot::RU, U_SIDE_MAPPING),
    SlotRemap::new(slot::RU, slot::FU, U_SIDE_MAPPING),
];

/// Clockwise quarter turn of the U face.
#[inline]
pub(crate) fn turn_u(state: State) -> State {
    state.remap_batch(U_TURN_REMAPS)
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
