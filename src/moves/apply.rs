use crate::moves::{Face, Move};
use crate::state::State;

use super::turns::{turn_b, turn_f, turn_l, turn_r, turn_u, turn_uw};

/// Apply a quarter-turn move to the cube state.
#[inline]
pub fn apply_move(state: State, mov: Move) -> State {
    let face = mov.face();
    match quarter_count(mov) {
        1 => apply_quarter_turn(state, face),
        2 => apply_quarter_turn(apply_quarter_turn(state, face), face),
        _ => apply_quarter_turn(
            apply_quarter_turn(apply_quarter_turn(state, face), face),
            face,
        ),
    }
}

/// Apply the inverse of a move (backward search).
pub fn apply_inverse(state: State, mov: Move) -> State {
    apply_move(state, mov.inverse())
}

fn quarter_count(mov: Move) -> u8 {
    match mov {
        Move::U | Move::Uw | Move::L | Move::R | Move::F | Move::B => 1,
        Move::U2 | Move::Uw2 | Move::L2 | Move::R2 | Move::F2 | Move::B2 => 2,
        Move::U3 | Move::Uw3 | Move::L3 | Move::R3 | Move::F3 | Move::B3 => 3,
    }
}

#[inline]
fn apply_quarter_turn(state: State, face: Face) -> State {
    match face {
        Face::U => turn_u(state),
        Face::Uw => turn_uw(state),
        Face::L => turn_l(state),
        Face::R => turn_r(state),
        Face::F => turn_f(state),
        Face::B => turn_b(state),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::moves::Move;

    #[test]
    #[ignore = "enable once turn functions are implemented"]
    fn apply_move_inverse_returns_original() {
        let state = State::from_raw(0x12345);
        for mov in Move::ALL {
            let next = apply_move(state, mov);
            assert_eq!(apply_inverse(next, mov), state);
        }
    }
}
