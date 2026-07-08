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

// const _CENTER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const _CORNER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const _SIDE_MAPPING:   [u8; 4] = [-0, -1, -2, -3];
// const _TURN_REMAPS: [SlotRemap; 9] = [
//     SlotRemap::new(, _CENTER_MAPPING),
//     SlotRemap::new(, _CORNER_MAPPING),
//     SlotRemap::new(, _SIDE_MAPPING),
// ];

/// Clockwise quarter turn of the Uw (whole-cube) axis.
#[inline]
pub(crate) fn turn_uw(state: State) -> State {
    // state.remap_batch(UW_TURN_REMAPS)
    state
}

/// Clockwise quarter turn of the L face.
#[inline]
pub(crate) fn turn_l(state: State) -> State {
    // state.remap_batch(L_TURN_REMAPS)
    state
}

/// Clockwise quarter turn of the R face.
#[inline]
pub(crate) fn turn_r(state: State) -> State {
    // state.remap_batch(R_TURN_REMAPS)
    state
}

/// Clockwise quarter turn of the F face.
#[inline]
pub(crate) fn turn_f(state: State) -> State {
    // state.remap_batch(F_TURN_REMAPS)
    state
}

/// Clockwise quarter turn of the B face.
#[inline]
pub(crate) fn turn_b(state: State) -> State {
    // state.remap_batch(B_TURN_REMAPS)
    state
}
