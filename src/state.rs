/// Raw 50-bit cube state packed into the low bits of a u64.
pub type RawState = u64;

pub const STATE_BITS: u32 = 50;
pub const SLOT_COUNT: u8 = 25;
pub const BITS_PER_SLOT: u32 = 2;

/// Named slot indices (see `cases` module docs for layout).
pub mod slot {
    pub const F: u8 = 0;
    pub const L: u8 = 1;
    pub const B: u8 = 2;
    pub const R: u8 = 3;
    pub const U: u8 = 4;
    pub const FLD: u8 = 5;
    pub const BLD: u8 = 6;
    pub const BRD: u8 = 7;
    pub const FRD: u8 = 8;
    pub const FLU: u8 = 9;
    pub const BLU: u8 = 10;
    pub const BRU: u8 = 11;
    pub const FRU: u8 = 12;
    pub const FD: u8 = 13;
    pub const LD: u8 = 14;
    pub const BD: u8 = 15;
    pub const RD: u8 = 16;
    pub const FL: u8 = 17;
    pub const BL: u8 = 18;
    pub const BR: u8 = 19;
    pub const FR: u8 = 20;
    pub const FU: u8 = 21;
    pub const LU: u8 = 22;
    pub const BU: u8 = 23;
    pub const RU: u8 = 24;
}

#[derive(Copy, Clone, Eq, PartialEq, Hash, Debug)]
pub struct SlotRemap {
    pub source: u8,
    pub destination: u8,
    pub mapping: [u8; 4],
}

impl SlotRemap {
    pub const fn new(source: u8, destination: u8, mapping: [u8; 4]) -> Self {
        Self {
            source,
            destination,
            mapping,
        }
    }
}

#[derive(Copy, Clone, Eq, PartialEq, Hash, Debug)]
pub struct State(pub RawState);

impl State {
    pub const MASK: RawState = (1 << STATE_BITS) - 1;

    pub const fn raw(self) -> RawState {
        self.0 & Self::MASK
    }

    pub const fn from_raw(raw: RawState) -> Self {
        Self(raw & Self::MASK)
    }

    /// Build a state from all 25 slot values in layout order (see `slot` constants).
    pub const fn from_slots(slots: [u8; SLOT_COUNT as usize]) -> Self {
        let mut raw: RawState = 0;
        let mut i = 0usize;
        while i < SLOT_COUNT as usize {
            assert!(slots[i] < 4);
            let shift = i as u32 * BITS_PER_SLOT;
            raw |= (slots[i] as RawState) << shift;
            i += 1;
        }
        Self::from_raw(raw)
    }

    /// Read the 2-bit value at `index` (0..25).
    pub const fn get_slot(self, index: u8) -> u8 {
        assert!(index < SLOT_COUNT);
        let shift = index as u32 * BITS_PER_SLOT;
        ((self.raw() >> shift) & 0b11) as u8
    }

    /// Return a new state with slot `index` set to `value` (0..3).
    pub const fn set_slot(self, index: u8, value: u8) -> Self {
        assert!(index < SLOT_COUNT);
        assert!(value < 4);
        let shift = index as u32 * BITS_PER_SLOT;
        let cleared = self.raw() & !(0b11 << shift);
        Self::from_raw(cleared | ((value as RawState) << shift))
    }

    /// Apply remaps in one pass: every read uses the input state, then affected
    /// destination slots are patched in the packed `u64`.
    #[inline]
    pub const fn remap_batch<const N: usize>(self, remaps: [SlotRemap; N]) -> Self {
        let original = self.raw();
        let mut result = original;
        let mut i = 0usize;
        while i < N {
            let remap = remaps[i];
            let src_shift = remap.source as u32 * BITS_PER_SLOT;
            let src_val = ((original >> src_shift) & 0b11) as usize;
            let mapped = remap.mapping[src_val] as RawState;
            let dst_shift = remap.destination as u32 * BITS_PER_SLOT;
            result = (result & !(0b11 << dst_shift)) | (mapped << dst_shift);
            i += 1;
        }
        Self::from_raw(result)
    }

    /// Optional hook for rejecting impossible bit patterns.
    pub fn is_valid(self) -> bool {
        let _ = self;
        true
    }
}

pub use crate::cases::{SOLVED_STATE, START_STATE};

/// Named-parameter state constructor for const contexts.
///
/// ```ignore
/// state! {
///     F: 2, L: 1, B: 3, R: 0, U: 3,
///     FLD: 3, BLD: 2, BRD: 0, FRD: 1, FLU: 0, BLU: 1, BRU: 3, FRU: 2,
///     FD: 1, LD: 0, BD: 3, RD: 3, FL: 3, BL: 1, BR: 2, FR: 0, FU: 2, LU: 2, BU: 0, RU: 1,
/// }
/// ```
#[macro_export]
macro_rules! state {
    (
        F: $f:expr,
        L: $l:expr,
        B: $b:expr,
        R: $r:expr,
        U: $u:expr,
        FLD: $fld:expr,
        BLD: $bld:expr,
        BRD: $brd:expr,
        FRD: $frd:expr,
        FLU: $flu:expr,
        BLU: $blu:expr,
        BRU: $bru:expr,
        FRU: $fru:expr,
        FD: $fd:expr,
        LD: $ld:expr,
        BD: $bd:expr,
        RD: $rd:expr,
        FL: $fl:expr,
        BL: $bl:expr,
        BR: $br:expr,
        FR: $fr:expr,
        FU: $fu:expr,
        LU: $lu:expr,
        BU: $bu:expr,
        RU: $ru:expr $(,)?
    ) => {
        $crate::state::State::from_slots([
            $f, $l, $b, $r, $u, $fld, $bld, $brd, $frd, $flu, $blu, $bru, $fru, $fd, $ld, $bd, $rd,
            $fl, $bl, $br, $fr, $fu, $lu, $bu, $ru,
        ])
    };
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn remap_batch_reads_all_sources_from_original() {
        const CORNER_MAPPING: [u8; 4] = [0, 2, 1, 3];
        const REMAPS: [SlotRemap; 4] = [
            SlotRemap {
                source: slot::FLU,
                destination: slot::BLU,
                mapping: CORNER_MAPPING,
            },
            SlotRemap {
                source: slot::BLU,
                destination: slot::BRU,
                mapping: CORNER_MAPPING,
            },
            SlotRemap {
                source: slot::BRU,
                destination: slot::FRU,
                mapping: CORNER_MAPPING,
            },
            SlotRemap {
                source: slot::FRU,
                destination: slot::FLU,
                mapping: CORNER_MAPPING,
            },
        ];

        let mut slots = [0u8; SLOT_COUNT as usize];
        slots[slot::FLU as usize] = 0;
        slots[slot::BLU as usize] = 1;
        slots[slot::BRU as usize] = 2;
        slots[slot::FRU as usize] = 3;
        let state = State::from_slots(slots);
        let next = state.remap_batch(REMAPS);

        assert_eq!(next.get_slot(slot::BLU), CORNER_MAPPING[0]);
        assert_eq!(next.get_slot(slot::BRU), CORNER_MAPPING[1]);
        assert_eq!(next.get_slot(slot::FRU), CORNER_MAPPING[2]);
        assert_eq!(next.get_slot(slot::FLU), CORNER_MAPPING[3]);
    }
}
