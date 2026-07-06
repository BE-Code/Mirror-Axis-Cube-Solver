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

    /// Read `source`, apply `mapping`, write to `destination`.
    pub const fn remap_slot(self, source: u8, destination: u8, mapping: [u8; 4]) -> Self {
        self.set_slot(destination, mapping[self.get_slot(source) as usize])
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
            $f, $l, $b, $r, $u,
            $fld, $bld, $brd, $frd, $flu, $blu, $bru, $fru,
            $fd, $ld, $bd, $rd, $fl, $bl, $br, $fr, $fu, $lu, $bu, $ru,
        ])
    };
}
