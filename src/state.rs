/// Raw 50-bit cube state packed into the low bits of a u64.
pub type RawState = u64;

pub const STATE_BITS: u32 = 50;
pub const SLOT_COUNT: u8 = 25;
pub const BITS_PER_SLOT: u32 = 2;

/// Solved cube appearance encoded as a 50-bit value.
/// TODO: populate with your solved state.
pub const SOLVED_STATE: State = State(0);

/// Scrambled starting state for solving.
/// TODO: populate with your scrambled state.
pub const START_STATE: State = State(0);

#[derive(Copy, Clone, Eq, PartialEq, Hash, Debug)]
pub struct State(pub RawState);

impl State {
    pub const MASK: RawState = (1 << STATE_BITS) - 1;

    pub fn raw(self) -> RawState {
        self.0 & Self::MASK
    }

    pub fn from_raw(raw: RawState) -> Self {
        Self(raw & Self::MASK)
    }

    /// Read the 2-bit value at `index` (0..25).
    pub fn get_slot(self, index: u8) -> u8 {
        assert!(index < SLOT_COUNT);
        let shift = index as u32 * BITS_PER_SLOT;
        ((self.raw() >> shift) & 0b11) as u8
    }

    /// Return a new state with slot `index` set to `value` (0..4).
    pub fn set_slot(self, index: u8, value: u8) -> Self {
        assert!(index < SLOT_COUNT);
        assert!(value < 4);
        let shift = index as u32 * BITS_PER_SLOT;
        let cleared = self.raw() & !(0b11 << shift);
        Self::from_raw(cleared | ((value as RawState) << shift))
    }

    /// Optional hook for rejecting impossible bit patterns.
    pub fn is_valid(self) -> bool {
        let _ = self;
        true
    }
}
