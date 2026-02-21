export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/**
 * Calculates BMR using the Mifflin-St Jeor equation.
 * @param gender 'male' or 'female'
 * @param weightKg Weight in kilograms
 * @param heightCm Height in centimeters
 * @param ageYears Age in years
 */
export function calculateBMR(gender: Gender, weightKg: number, heightCm: number, ageYears: number): number {
  let bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears);
  if (gender === 'male') {
    bmr += 5;
  } else {
    bmr -= 161;
  }
  return Math.round(bmr);
}

/**
 * Calculates Maintenance calories based on BMR and Activity Level.
 */
export function calculateMaintenance(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculates Target calories based on Maintenance and Deficit.
 */
export function calculateTargetCalories(maintenance: number, deficitAmount: number): number {
  return maintenance - deficitAmount;
}
