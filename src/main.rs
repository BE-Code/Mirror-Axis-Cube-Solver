use axis_cube_solver::{probe_from_solved, solve, Move, SOLVED_STATE, START_STATE};
use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(name = "axis-cube-solver")]
#[command(about = "Minimum-move solver for a stickerless axis cube")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Solve from START_STATE to SOLVED_STATE
    Solve,
    /// Probe backward BFS growth from SOLVED_STATE
    Probe {
        /// Number of layers to expand
        #[arg(long, default_value_t = 12)]
        layers: u32,
    },
}

fn main() {
    let cli = Cli::parse();

    match cli.command {
        Commands::Solve => {
            if START_STATE == SOLVED_STATE {
                println!("START_STATE and SOLVED_STATE are both unset (0).");
                println!("Populate them in src/cases.rs before solving.");
                return;
            }

            match solve(START_STATE, SOLVED_STATE) {
                Some(result) => {
                    println!("Solution ({} moves):", result.moves.len());
                    print_moves(&result.moves);
                    println!();
                    println!(
                        "depth={} expanded={} visited={} max_frontier={}",
                        result.stats.depth,
                        result.stats.nodes_expanded,
                        result.stats.visited_count,
                        result.stats.max_frontier,
                    );
                }
                None => {
                    println!("No solution found.");
                }
            }
        }
        Commands::Probe { layers } => {
            let stats = probe_from_solved(layers);
            println!("Probe from SOLVED_STATE for up to {layers} layers:");
            println!("  depth reached: {}", stats.depth);
            println!("  visited:       {}", stats.visited_count);
            println!("  expanded:      {}", stats.nodes_expanded);
            println!("  max_frontier:  {}", stats.max_frontier);
        }
    }
}

fn print_moves(moves: &[Move]) {
    for (i, mov) in moves.iter().enumerate() {
        if i > 0 {
            print!(" ");
        }
        print!("{mov}");
    }
    println!();
}
