export type ActivityType = "cardio" | "strength";

export interface GymActivityRef {
    id: string;
    name: string;
    type: ActivityType;
    category: string;
    baseMET: number; // Metabolic Equivalent of Task
}

export const GYM_ACTIVITIES: GymActivityRef[] = [
    // Cardio
    { id: "inc-treadmill", name: "Inclined Treadmill Walking", type: "cardio", category: "Cardio", baseMET: 6.0 },
    { id: "running", name: "Running", type: "cardio", category: "Cardio", baseMET: 9.8 },
    { id: "elliptical", name: "Elliptical Machine", type: "cardio", category: "Cardio", baseMET: 5.0 },
    { id: "stat-bike", name: "Stationary Bike (Upright/Recumbent)", type: "cardio", category: "Cardio", baseMET: 7.0 },
    { id: "stair-climber", name: "Stair Climber / StairMaster", type: "cardio", category: "Cardio", baseMET: 9.0 },

    // Back & Lats
    { id: "lat-pulldown", name: "Lat Pulldown Machine (Wide/Close)", type: "strength", category: "Back & Lats", baseMET: 5.0 },
    { id: "seated-row", name: "Seated Cable Row", type: "strength", category: "Back & Lats", baseMET: 5.0 },
    { id: "straight-arm", name: "Straight-Arm Cable Pulldown", type: "strength", category: "Back & Lats", baseMET: 4.5 },
    { id: "ast-pullup", name: "Assisted Pull-up Machine", type: "strength", category: "Back & Lats", baseMET: 5.0 },
    { id: "tbar-row", name: "T-Bar Row Machine (Chest-supported)", type: "strength", category: "Back & Lats", baseMET: 6.0 },
    { id: "back-ext", name: "Machine Back Extension", type: "strength", category: "Back & Lats", baseMET: 4.0 },

    // Biceps & Triceps
    { id: "cable-bicep", name: "Cable Bicep Curl (Straight/Rope)", type: "strength", category: "Biceps & Triceps", baseMET: 4.0 },
    { id: "alt-db-curl", name: "Alternate Dumbbell Curls", type: "strength", category: "Biceps & Triceps", baseMET: 4.0 },
    { id: "ez-bar-curl", name: "E-Z Bar Curls", type: "strength", category: "Biceps & Triceps", baseMET: 4.0 },
    { id: "preacher-curl", name: "Preacher Curl Machine", type: "strength", category: "Biceps & Triceps", baseMET: 3.5 },
    { id: "high-pull-curl", name: "High-Pulley Cable Curl", type: "strength", category: "Biceps & Triceps", baseMET: 4.0 },
    { id: "cable-tricep", name: "Cable Tricep Pushdown (Rope/V-Bar)", type: "strength", category: "Biceps & Triceps", baseMET: 4.0 },
    { id: "tricep-ext", name: "Tricep Extension Machine", type: "strength", category: "Biceps & Triceps", baseMET: 3.5 },
    { id: "ast-dip", name: "Assisted Dip Machine", type: "strength", category: "Biceps & Triceps", baseMET: 4.5 },

    // Shoulders
    { id: "mach-shoulder", name: "Machine Shoulder Press", type: "strength", category: "Shoulders", baseMET: 4.5 },
    { id: "db-shoulder", name: "Dumbbell Shoulder Press", type: "strength", category: "Shoulders", baseMET: 5.0 },
    { id: "bb-shoulder", name: "Barbell Shoulder Press", type: "strength", category: "Shoulders", baseMET: 5.0 },
    { id: "cable-lat-raise", name: "Cable Lateral Raise", type: "strength", category: "Shoulders", baseMET: 4.0 },
    { id: "rev-pec-deck", name: "Reverse Pec Deck (Rear Delt Fly)", type: "strength", category: "Shoulders", baseMET: 4.0 },
    { id: "cable-face-pull", name: "Cable Face Pulls", type: "strength", category: "Shoulders", baseMET: 4.0 },
    { id: "smith-ohp", name: "Smith Machine Overhead Press", type: "strength", category: "Shoulders", baseMET: 5.0 },

    // Chest
    { id: "mach-chest", name: "Machine Chest Press (Flat/Incline)", type: "strength", category: "Chest", baseMET: 5.0 },
    { id: "pec-deck", name: "Pec Deck / Butterfly Machine", type: "strength", category: "Chest", baseMET: 4.5 },
    { id: "cable-cross", name: "Cable Crossover (High/Low)", type: "strength", category: "Chest", baseMET: 5.0 },
    { id: "smith-bench", name: "Smith Machine Bench Press", type: "strength", category: "Chest", baseMET: 6.0 },

    // Legs
    { id: "leg-press", name: "Leg Press Machine", type: "strength", category: "Legs", baseMET: 6.0 },
    { id: "leg-ext", name: "Leg Extension Machine", type: "strength", category: "Legs", baseMET: 5.0 },
    { id: "seated-leg-curl", name: "Seated Leg Curl Machine", type: "strength", category: "Legs", baseMET: 5.0 },
    { id: "lying-leg-curl", name: "Lying Leg Curl Machine", type: "strength", category: "Legs", baseMET: 5.0 },
    { id: "calf-raise", name: "Calf Raise Machine (Standing/Seated)", type: "strength", category: "Legs", baseMET: 4.0 },
    { id: "hip-abductor", name: "Hip Abductor Machine (Outer Thigh)", type: "strength", category: "Legs", baseMET: 4.0 },
    { id: "hip-adductor", name: "Hip Adductor Machine (Inner Thigh)", type: "strength", category: "Legs", baseMET: 4.0 },

    // Abs & Core
    { id: "cable-crunch", name: "Cable Crunch", type: "strength", category: "Abs & Core", baseMET: 4.0 },
    { id: "ab-crunch-mach", name: "Ab Crunch Machine", type: "strength", category: "Abs & Core", baseMET: 4.0 },
    { id: "captains-chair", name: "Captain's Chair Leg Raise", type: "strength", category: "Abs & Core", baseMET: 4.5 },
];

export function calculateCardioCalories(met: number, weightKg: number, durationMinutes: number): number {
    return Math.round(met * weightKg * (durationMinutes / 60));
}

// Rough estimate for strength: 
// 1 rep = ~4 seconds of work
// 1 set = (reps * 4 seconds) + ~60 seconds rest
export function calculateStrengthCalories(met: number, weightKg: number, sets: number, reps: number): number {
    const activeSecondsPerRep = 4;
    const restSecondsPerSet = 60;

    // Total active work time
    const totalActiveSeconds = sets * reps * activeSecondsPerRep;
    // Total rest time (assume rest after every set except the last one, or just average it out)
    const totalRestSeconds = sets * restSecondsPerSet;

    const totalMinutes = (totalActiveSeconds + totalRestSeconds) / 60;

    // Calculate burned calories
    return Math.round(met * weightKg * (totalMinutes / 60));
}
