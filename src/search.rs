use crate::moves::{apply_inverse, apply_move, is_move_allowed, Move};
use crate::state::{State, SOLVED_STATE};
use rayon::prelude::*;
use rustc_hash::{FxHashMap, FxHashSet};

#[derive(Debug, Clone)]
pub struct SearchStats {
    pub nodes_expanded: u64,
    pub max_frontier: usize,
    pub depth: u32,
    pub visited_count: usize,
}

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub moves: Vec<Move>,
    pub stats: SearchStats,
}

/// Balanced bidirectional BFS with per-layer Rayon parallelism.
pub fn solve(start: State, goal: State) -> Option<SearchResult> {
    if start == goal {
        return Some(SearchResult {
            moves: Vec::new(),
            stats: SearchStats {
                nodes_expanded: 0,
                max_frontier: 1,
                depth: 0,
                visited_count: 1,
            },
        });
    }

    let mut visited_fwd: FxHashSet<State> = FxHashSet::default();
    let mut visited_bwd: FxHashSet<State> = FxHashSet::default();
    let mut incoming_fwd: FxHashMap<State, Move> = FxHashMap::default();
    let mut incoming_bwd: FxHashMap<State, Move> = FxHashMap::default();
    let mut depth_fwd: FxHashMap<State, u32> = FxHashMap::default();
    let mut depth_bwd: FxHashMap<State, u32> = FxHashMap::default();

    visited_fwd.insert(start);
    visited_bwd.insert(goal);
    depth_fwd.insert(start, 0);
    depth_bwd.insert(goal, 0);

    let mut frontier_fwd = vec![start];
    let mut frontier_bwd = vec![goal];
    let mut level_fwd: u32 = 0;
    let mut level_bwd: u32 = 0;
    let mut nodes_expanded: u64 = 0;
    let mut max_frontier = 1usize;
    let mut best_meeting: Option<(State, u32)> = None;

    while !frontier_fwd.is_empty() && !frontier_bwd.is_empty() {
        if let Some((_, best_depth)) = best_meeting {
            if level_fwd + level_bwd >= best_depth {
                break;
            }
        }

        let expand_forward = frontier_fwd.len() <= frontier_bwd.len();

        if expand_forward {
            let (candidates, expanded) =
                expand_layer(&frontier_fwd, &incoming_fwd, &visited_fwd, true);
            nodes_expanded += expanded;
            frontier_fwd = merge_layer(
                candidates,
                level_fwd + 1,
                &mut visited_fwd,
                &mut incoming_fwd,
                &mut depth_fwd,
                &visited_bwd,
                &depth_bwd,
                &mut best_meeting,
            );
            max_frontier = max_frontier.max(frontier_fwd.len());
            level_fwd += 1;
        } else {
            let (candidates, expanded) =
                expand_layer(&frontier_bwd, &incoming_bwd, &visited_bwd, false);
            nodes_expanded += expanded;
            frontier_bwd = merge_layer(
                candidates,
                level_bwd + 1,
                &mut visited_bwd,
                &mut incoming_bwd,
                &mut depth_bwd,
                &visited_fwd,
                &depth_fwd,
                &mut best_meeting,
            );
            max_frontier = max_frontier.max(frontier_bwd.len());
            level_bwd += 1;
        }
    }

    let (meet, total_depth) = best_meeting?;
    let moves = reconstruct_path(meet, start, goal, &incoming_fwd, &incoming_bwd);

    Some(SearchResult {
        moves,
        stats: SearchStats {
            nodes_expanded,
            max_frontier,
            depth: total_depth,
            visited_count: visited_fwd.len() + visited_bwd.len(),
        },
    })
}

/// Backward BFS from solved for `layers` depths; useful for estimating state-space growth.
pub fn probe_from_solved(layers: u32) -> SearchStats {
    probe_from_state(SOLVED_STATE, layers)
}

pub fn probe_from_state(start: State, layers: u32) -> SearchStats {
    let mut visited: FxHashSet<State> = FxHashSet::default();
    let mut incoming: FxHashMap<State, Move> = FxHashMap::default();
    let mut depths: FxHashMap<State, u32> = FxHashMap::default();

    visited.insert(start);
    depths.insert(start, 0);
    let mut frontier = vec![start];
    let mut nodes_expanded: u64 = 0;
    let mut max_frontier = 1usize;

    for layer in 1..=layers {
        if frontier.is_empty() {
            break;
        }

        let (candidates, expanded) = expand_layer(&frontier, &incoming, &visited, false);
        nodes_expanded += expanded;
        frontier = merge_layer(
            candidates,
            layer,
            &mut visited,
            &mut incoming,
            &mut depths,
            &FxHashSet::default(),
            &FxHashMap::default(),
            &mut None,
        );
        max_frontier = max_frontier.max(frontier.len());
    }

    SearchStats {
        nodes_expanded,
        max_frontier,
        depth: *depths.values().max().unwrap_or(&0),
        visited_count: visited.len(),
    }
}

fn expand_layer(
    frontier: &[State],
    incoming: &FxHashMap<State, Move>,
    visited: &FxHashSet<State>,
    forward: bool,
) -> (Vec<(State, Move)>, u64) {
    let candidates: Vec<(State, Move)> = frontier
        .par_iter()
        .map(|&state| {
            let prev = incoming.get(&state).copied();
            let mut local = Vec::with_capacity(12);
            for mov in Move::ALL {
                if !is_move_allowed(prev, mov) {
                    continue;
                }
                let next = if forward {
                    apply_move(state, mov)
                } else {
                    apply_inverse(state, mov)
                };
                if visited.contains(&next) {
                    continue;
                }
                local.push((next, mov));
            }
            local
        })
        .flatten()
        .collect();

    (candidates, candidates.len() as u64)
}

fn merge_layer(
    candidates: Vec<(State, Move)>,
    depth: u32,
    visited: &mut FxHashSet<State>,
    incoming: &mut FxHashMap<State, Move>,
    depths: &mut FxHashMap<State, u32>,
    other_visited: &FxHashSet<State>,
    other_depths: &FxHashMap<State, u32>,
    best_meeting: &mut Option<(State, u32)>,
) -> Vec<State> {
    let mut next_frontier = Vec::new();

    for (state, mov) in candidates {
        if !visited.insert(state) {
            continue;
        }
        incoming.insert(state, mov);
        depths.insert(state, depth);
        next_frontier.push(state);

        if other_visited.contains(&state) {
            let total = depth + other_depths[&state];
            update_best_meeting(best_meeting, state, total);
        }
    }

    next_frontier
}

fn update_best_meeting(best: &mut Option<(State, u32)>, state: State, depth: u32) {
    match *best {
        Some((_, d)) if depth >= d => {}
        _ => *best = Some((state, depth)),
    }
}

fn reconstruct_path(
    meet: State,
    start: State,
    goal: State,
    incoming_fwd: &FxHashMap<State, Move>,
    incoming_bwd: &FxHashMap<State, Move>,
) -> Vec<Move> {
    let mut fwd_moves = Vec::new();
    let mut state = meet;
    while state != start {
        let mov = incoming_fwd[&state];
        fwd_moves.push(mov);
        state = apply_inverse(state, mov);
    }
    fwd_moves.reverse();

    let mut bwd_moves = Vec::new();
    let mut state = meet;
    while state != goal {
        let mov = incoming_bwd[&state];
        bwd_moves.push(mov);
        state = apply_move(state, mov);
    }

    fwd_moves.extend(bwd_moves);
    fwd_moves
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::state::START_STATE;

    #[test]
    fn solve_trivial_when_start_equals_goal() {
        let result = solve(START_STATE, START_STATE).unwrap();
        assert!(result.moves.is_empty());
    }
}
