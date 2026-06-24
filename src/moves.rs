use crate::state::State;

/// Face of the cube (for move pruning).
#[derive(Copy, Clone, Eq, PartialEq, Debug)]
pub enum Face {
    U,
    Uw,
    L,
    R,
    F,
    B,
}

/// Quarter-turn metric: 18 face turns.
/// Naming: `U` = clockwise quarter, `U2` = half, `U3` = counter-clockwise quarter.
#[repr(u8)]
#[derive(Copy, Clone, Eq, PartialEq, Hash, Debug)]
pub enum Move {
    U = 0,
    U2,
    U3,
    Uw,
    Uw2,
    Uw3,
    L,
    L2,
    L3,
    R,
    R2,
    R3,
    F,
    F2,
    F3,
    B,
    B2,
    B3,
}

impl Move {
    pub const ALL: [Move; 18] = [
        Move::U,
        Move::U2,
        Move::U3,
        Move::Uw,
        Move::Uw2,
        Move::Uw3,
        Move::L,
        Move::L2,
        Move::L3,
        Move::R,
        Move::R2,
        Move::R3,
        Move::F,
        Move::F2,
        Move::F3,
        Move::B,
        Move::B2,
        Move::B3,
    ];

    pub fn face(self) -> Face {
        match self {
            Move::U | Move::U2 | Move::U3 => Face::U,
            Move::Uw | Move::Uw2 | Move::Uw3 => Face::Uw,
            Move::L | Move::L2 | Move::L3 => Face::L,
            Move::R | Move::R2 | Move::R3 => Face::R,
            Move::F | Move::F2 | Move::F3 => Face::F,
            Move::B | Move::B2 | Move::B3 => Face::B,
        }
    }

    pub fn inverse(self) -> Move {
        match self {
            Move::U => Move::U3,
            Move::U2 => Move::U2,
            Move::U3 => Move::U,
            Move::Uw => Move::Uw3,
            Move::Uw2 => Move::Uw2,
            Move::Uw3 => Move::Uw,
            Move::L => Move::L3,
            Move::L2 => Move::L2,
            Move::L3 => Move::L,
            Move::R => Move::R3,
            Move::R2 => Move::R2,
            Move::R3 => Move::R,
            Move::F => Move::F3,
            Move::F2 => Move::F2,
            Move::F3 => Move::F,
            Move::B => Move::B3,
            Move::B2 => Move::B2,
            Move::B3 => Move::B,
        }
    }
}

impl std::fmt::Display for Move {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let s = match self {
            Move::U => "U",
            Move::U2 => "U2",
            Move::U3 => "U3",
            Move::Uw => "Uw",
            Move::Uw2 => "Uw2",
            Move::Uw3 => "Uw3",
            Move::L => "L",
            Move::L2 => "L2",
            Move::L3 => "L3",
            Move::R => "R",
            Move::R2 => "R2",
            Move::R3 => "R3",
            Move::F => "F",
            Move::F2 => "F2",
            Move::F3 => "F3",
            Move::B => "B",
            Move::B2 => "B2",
            Move::B3 => "B3",
        };
        write!(f, "{s}")
    }
}

fn is_opposite(face_a: Face, face_b: Face) -> bool {
    matches!(
        (face_a, face_b),
        (Face::U, Face::Uw)
            | (Face::Uw, Face::U)
            | (Face::L, Face::R)
            | (Face::R, Face::L)
            | (Face::F, Face::B)
            | (Face::B, Face::F)
    )
}

/// Prune redundant moves: no same face twice, no opposite face out of order.
pub fn is_move_allowed(prev: Option<Move>, mov: Move) -> bool {
    let Some(prev) = prev else {
        return true;
    };

    let prev_face = prev.face();
    let mov_face = mov.face();

    if prev_face == mov_face {
        return false;
    }

    // Only allow opposite face when previous face is the "later" one in fixed order U < Uw < L < R < F < B.
    if is_opposite(prev_face, mov_face) && face_order(prev_face) < face_order(mov_face) {
        return false;
    }

    true
}

fn face_order(face: Face) -> u8 {
    match face {
        Face::U => 0,
        Face::Uw => 1,
        Face::L => 2,
        Face::R => 3,
        Face::F => 4,
        Face::B => 5,
    }
}

/// Apply a quarter-turn move to the cube state.
///
/// TODO: implement axis cube move logic here.
pub fn apply_move(state: State, mov: Move) -> State {
    let _ = mov;
    state
}

/// Apply the inverse of a move (backward search).
pub fn apply_inverse(state: State, mov: Move) -> State {
    apply_move(state, mov.inverse())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn move_inverse_roundtrip() {
        for mov in Move::ALL {
            assert_eq!(mov.inverse().inverse(), mov);
        }
    }

    #[test]
    #[ignore = "enable once apply_move is implemented"]
    fn apply_move_inverse_returns_original() {
        let state = State::from_raw(0x12345);
        for mov in Move::ALL {
            let next = apply_move(state, mov);
            assert_eq!(apply_inverse(next, mov), state);
        }
    }

    #[test]
    fn pruning_rejects_same_face() {
        assert!(!is_move_allowed(Some(Move::R), Move::R));
        assert!(!is_move_allowed(Some(Move::R2), Move::R3));
    }

    #[test]
    fn pruning_rejects_opposite_out_of_order() {
        assert!(!is_move_allowed(Some(Move::F), Move::B));
        assert!(is_move_allowed(Some(Move::B), Move::F));
    }
}
