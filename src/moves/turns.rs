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

const UW_MIDDLE_CENTER_MAPPING: [u8; 4] = [0, 1, 2, 3];
const UW_MIDDLE_SIDE_MAPPING: [u8; 4] = [0, 1, 3, 2];
const UW_TURN_REMAPS: [SlotRemap; 17] = {
    let u = U_TURN_REMAPS;
    [
        u[0],
        u[1],
        u[2],
        u[3],
        u[4],
        u[5],
        u[6],
        u[7],
        u[8],
        SlotRemap::new(slot::F, slot::L, UW_MIDDLE_CENTER_MAPPING),
        SlotRemap::new(slot::L, slot::B, UW_MIDDLE_CENTER_MAPPING),
        SlotRemap::new(slot::B, slot::R, UW_MIDDLE_CENTER_MAPPING),
        SlotRemap::new(slot::R, slot::F, UW_MIDDLE_CENTER_MAPPING),
        SlotRemap::new(slot::FL, slot::BL, UW_MIDDLE_SIDE_MAPPING),
        SlotRemap::new(slot::BL, slot::BR, UW_MIDDLE_SIDE_MAPPING),
        SlotRemap::new(slot::BR, slot::FR, UW_MIDDLE_SIDE_MAPPING),
        SlotRemap::new(slot::FR, slot::FL, UW_MIDDLE_SIDE_MAPPING),
    ]
};

/// Clockwise quarter turn of the Uw (whole-cube) axis.
#[inline]
pub(crate) fn turn_uw(state: State) -> State {
    state.remap_batch(UW_TURN_REMAPS)
}

// const L_CENTER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const L_CORNER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const L_SIDE_MAPPING:   [u8; 4] = [-0, -1, -2, -3];
// const L_TURN_REMAPS: [SlotRemap; 9] = [
//     SlotRemap::new(slot::L, slot::L, L_CENTER_MAPPING),
//     SlotRemap::new(, L_CORNER_MAPPING),
//     SlotRemap::new(, L_CORNER_MAPPING),
//     SlotRemap::new(, L_CORNER_MAPPING),
//     SlotRemap::new(, L_CORNER_MAPPING),
//     SlotRemap::new(, L_SIDE_MAPPING),
//     SlotRemap::new(, L_SIDE_MAPPING),
//     SlotRemap::new(, L_SIDE_MAPPING),
//     SlotRemap::new(, L_SIDE_MAPPING),
// ];

/// Clockwise quarter turn of the L face.
#[inline]
pub(crate) fn turn_l(state: State) -> State {
    // state.remap_batch(L_TURN_REMAPS)
    state
}

// const R_CENTER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const R_CORNER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const R_SIDE_MAPPING:   [u8; 4] = [-0, -1, -2, -3];
// const R_TURN_REMAPS: [SlotRemap; 9] = [
//     SlotRemap::new(slot::R, slot::R, R_CENTER_MAPPING),
//     SlotRemap::new(, R_CORNER_MAPPING),
//     SlotRemap::new(, R_CORNER_MAPPING),
//     SlotRemap::new(, R_CORNER_MAPPING),
//     SlotRemap::new(, R_CORNER_MAPPING),
//     SlotRemap::new(, R_SIDE_MAPPING),
//     SlotRemap::new(, R_SIDE_MAPPING),
//     SlotRemap::new(, R_SIDE_MAPPING),
//     SlotRemap::new(, R_SIDE_MAPPING),
// ];

/// Clockwise quarter turn of the R face.
#[inline]
pub(crate) fn turn_r(state: State) -> State {
    // state.remap_batch(R_TURN_REMAPS)
    state
}

// const F_CENTER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const F_CORNER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const F_SIDE_MAPPING:   [u8; 4] = [-0, -1, -2, -3];
// const F_TURN_REMAPS: [SlotRemap; 9] = [
//     SlotRemap::new(slot::F, slot::F, F_CENTER_MAPPING),
//     SlotRemap::new(, F_CORNER_MAPPING),
//     SlotRemap::new(, F_CORNER_MAPPING),
//     SlotRemap::new(, F_CORNER_MAPPING),
//     SlotRemap::new(, F_CORNER_MAPPING),
//     SlotRemap::new(, F_SIDE_MAPPING),
//     SlotRemap::new(, F_SIDE_MAPPING),
//     SlotRemap::new(, F_SIDE_MAPPING),
//     SlotRemap::new(, F_SIDE_MAPPING),
// ];

/// Clockwise quarter turn of the F face.
#[inline]
pub(crate) fn turn_f(state: State) -> State {
    // state.remap_batch(F_TURN_REMAPS)
    state
}

// const B_CENTER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const B_CORNER_MAPPING: [u8; 4] = [-0, -1, -2, -3];
// const B_SIDE_MAPPING:   [u8; 4] = [-0, -1, -2, -3];
// const B_TURN_REMAPS: [SlotRemap; 9] = [
//     SlotRemap::new(slot::B, slot::B, B_CENTER_MAPPING),
//     SlotRemap::new(, B_CORNER_MAPPING),
//     SlotRemap::new(, B_CORNER_MAPPING),
//     SlotRemap::new(, B_CORNER_MAPPING),
//     SlotRemap::new(, B_CORNER_MAPPING),
//     SlotRemap::new(, B_SIDE_MAPPING),
//     SlotRemap::new(, B_SIDE_MAPPING),
//     SlotRemap::new(, B_SIDE_MAPPING),
//     SlotRemap::new(, B_SIDE_MAPPING),
// ];

/// Clockwise quarter turn of the B face.
#[inline]
pub(crate) fn turn_b(state: State) -> State {
    // state.remap_batch(B_TURN_REMAPS)
    state
}
