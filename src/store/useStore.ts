import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityLevel, Gender } from '@/lib/calculations';
import { FoodItem } from '@/lib/foodDatabase';

export interface Profile {
    id: string;
    name: string;
    gender: Gender;
    weight: number; // kg
    height: number; // cm
    age: number;
    activityLevel: ActivityLevel;
    deficitAmount: number; // calories to subtract from maintenance
}

export interface LoggedFood {
    id: string; // unique instance id for removal
    foodId: string;
    name: string;
    calories: number;
    quantity: number;
}

export interface LoggedActivity {
    id: string; // unique instance id for removal
    activityId: string; // corresponds to a predefined gym activity
    name: string;
    caloriesBurned: number;
    duration?: number; // minutes
    pace?: number;     // e.g., speed or mph
    gradient?: number; // incline percentage
    sets?: number;
    reps?: number;
    weight?: number;   // lbs or kg used
}

export interface DayLog {
    breakfast: number;
    lunch: number;
    snacks: number;
    dinner: number;
    gym?: number;
    items?: {
        breakfast: LoggedFood[];
        lunch: LoggedFood[];
        snacks: LoggedFood[];
        dinner: LoggedFood[];
        gym: LoggedActivity[];
    };
}

export interface AppState {
    profiles: Profile[];
    activeProfileId: string | null;
    activeDateStr: string; // The selected date format YYYY-MM-DD
    logs: Record<string, Record<string, DayLog>>; // date (YYYY-MM-DD) -> profileId -> DayLog
    customFoods: FoodItem[];

    // Actions
    addProfile: (profile: Omit<Profile, 'id'>) => void;
    updateProfile: (id: string, updates: Partial<Profile>) => void;
    deleteProfile: (id: string) => void;
    setActiveProfile: (id: string) => void;
    setActiveDate: (dateStr: string) => void;
    updateLog: (date: string, profileId: string, slot: keyof Omit<DayLog, 'items' | 'gym'>, calories: number) => void;
    addFoodItem: (date: string, profileId: string, slot: keyof Omit<DayLog, 'items' | 'gym'>, food: Omit<LoggedFood, 'id' | 'quantity'>) => void;
    removeFoodItem: (date: string, profileId: string, slot: keyof Omit<DayLog, 'items' | 'gym'>, itemId: string) => void;
    addGymActivity: (date: string, profileId: string, activity: Omit<LoggedActivity, 'id'>) => void;
    removeGymActivity: (date: string, profileId: string, activityId: string) => void;
    addCustomFood: (food: Omit<FoodItem, 'id'>) => void;
    removeCustomFood: (foodId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            profiles: [],
            activeProfileId: null,
            activeDateStr: getTodayStr(),
            logs: {},
            customFoods: [],

            addProfile: (profileData) =>
                set((state) => {
                    const id = generateId();
                    const newProfile = { ...profileData, id };
                    return {
                        profiles: [...state.profiles, newProfile],
                        activeProfileId: state.activeProfileId || id, // set as active if it's the first
                    };
                }),

            updateProfile: (id, updates) =>
                set((state) => ({
                    profiles: state.profiles.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                })),

            deleteProfile: (id) =>
                set((state) => ({
                    profiles: state.profiles.filter((p) => p.id !== id),
                    activeProfileId: state.activeProfileId === id ? state.profiles[0]?.id || null : state.activeProfileId,
                })),

            setActiveProfile: (id) =>
                set(() => ({
                    activeProfileId: id,
                })),

            setActiveDate: (dateStr) =>
                set(() => ({
                    activeDateStr: dateStr,
                })),

            updateLog: (date, profileId, slot, calories) =>
                set((state) => {
                    const dateLogs = state.logs[date] || {};
                    const profileLog = dateLogs[profileId] || {
                        breakfast: 0,
                        lunch: 0,
                        snacks: 0,
                        dinner: 0,
                        gym: 0,
                        items: { breakfast: [], lunch: [], snacks: [], dinner: [], gym: [] }
                    };

                    return {
                        logs: {
                            ...state.logs,
                            [date]: {
                                ...dateLogs,
                                [profileId]: {
                                    ...profileLog,
                                    [slot]: calories,
                                },
                            },
                        },
                    };
                }),

            addFoodItem: (date, profileId, slot, food) =>
                set((state) => {
                    const dateLogs = state.logs[date] || {};
                    const currentProfileLog = dateLogs[profileId] || {
                        breakfast: 0, lunch: 0, snacks: 0, dinner: 0, gym: 0,
                    };

                    const items = currentProfileLog.items || { breakfast: [], lunch: [], snacks: [], dinner: [], gym: [] };
                    const rawSlotItems = (items as any)[slot] || [];

                    // Recover and consolidate legacy corrupted items
                    const consolidatedMap = new Map<string, LoggedFood>();
                    for (const item of rawSlotItems) {
                        const qty = item.quantity || 1;
                        // use name as fallback if foodId is messed up
                        const key = item.foodId || item.name;
                        if (consolidatedMap.has(key)) {
                            const existing = consolidatedMap.get(key)!;
                            existing.quantity = (existing.quantity || 1) + qty;
                        } else {
                            consolidatedMap.set(key, { ...item, quantity: qty });
                        }
                    }

                    const slotItems = Array.from(consolidatedMap.values());
                    const matchKey = food.foodId || food.name;
                    const existingItemIndex = slotItems.findIndex(i => (i.foodId || i.name) === matchKey);

                    let newSlotItems;
                    if (existingItemIndex >= 0) {
                        newSlotItems = [...slotItems];
                        newSlotItems[existingItemIndex] = {
                            ...newSlotItems[existingItemIndex],
                            quantity: (newSlotItems[existingItemIndex].quantity || 1) + 1
                        };
                    } else {
                        const newItem: LoggedFood = { ...food, id: generateId(), quantity: 1 };
                        newSlotItems = [...slotItems, newItem];
                    }

                    return {
                        logs: {
                            ...state.logs,
                            [date]: {
                                ...dateLogs,
                                [profileId]: {
                                    ...currentProfileLog,
                                    [slot]: currentProfileLog[slot] + food.calories,
                                    items: {
                                        ...items,
                                        [slot]: newSlotItems
                                    }
                                }
                            }
                        }
                    };
                }),

            removeFoodItem: (date, profileId, slot, itemId) =>
                set((state) => {
                    const dateLogs = state.logs[date] || {};
                    const currentProfileLog = dateLogs[profileId];
                    if (!currentProfileLog || !currentProfileLog.items) return state;

                    const items = currentProfileLog.items;
                    const slotItems: LoggedFood[] = (items as any)[slot] || [];

                    // Identify all chunks of this food that match the ID, foodId, or name
                    const itemsToRemove = slotItems.filter((i) => i.id === itemId || i.foodId === itemId || i.name === itemId);

                    if (itemsToRemove.length === 0) return state;

                    // Ensure ALL instances of this loosely matched item are purged
                    const newSlotItems = slotItems.filter((i) => i.id !== itemId && i.foodId !== itemId && i.name !== itemId);

                    // Sum the calories of all removed chunks to ensure math stays perfectly accurate
                    const totalCaloriesRemoved = itemsToRemove.reduce((sum, item) => {
                        const qty = item.quantity || 1;
                        const cals = Number(item.calories) || 0;
                        return sum + (cals * qty);
                    }, 0);

                    let newTotal = currentProfileLog[slot] - totalCaloriesRemoved;
                    if (isNaN(newTotal) || newTotal < 0) newTotal = 0;

                    return {
                        logs: {
                            ...state.logs,
                            [date]: {
                                ...dateLogs,
                                [profileId]: {
                                    ...currentProfileLog,
                                    [slot]: newTotal,
                                    items: {
                                        ...items,
                                        [slot]: newSlotItems
                                    }
                                }
                            }
                        }
                    };
                }),

            addGymActivity: (date, profileId, activity) =>
                set((state) => {
                    const dateLogs = state.logs[date] || {};
                    const currentProfileLog = dateLogs[profileId] || {
                        breakfast: 0, lunch: 0, snacks: 0, dinner: 0, gym: 0,
                    };

                    const items = currentProfileLog.items || { breakfast: [], lunch: [], snacks: [], dinner: [], gym: [] };
                    const gymItems = items.gym || [];

                    const newActivity: LoggedActivity = { ...activity, id: generateId() };
                    const newGymItems = [...gymItems, newActivity];
                    const currentGymCalories = currentProfileLog.gym || 0;

                    return {
                        logs: {
                            ...state.logs,
                            [date]: {
                                ...dateLogs,
                                [profileId]: {
                                    ...currentProfileLog,
                                    gym: currentGymCalories + activity.caloriesBurned,
                                    items: {
                                        ...items,
                                        gym: newGymItems,
                                    }
                                }
                            }
                        }
                    };
                }),

            removeGymActivity: (date, profileId, activityId) =>
                set((state) => {
                    const dateLogs = state.logs[date] || {};
                    const currentProfileLog = dateLogs[profileId];
                    if (!currentProfileLog || !currentProfileLog.items || !currentProfileLog.items.gym) return state;

                    const items = currentProfileLog.items;
                    const gymItems = items.gym;

                    const activityToRemove = gymItems.find(a => a.id === activityId);
                    if (!activityToRemove) return state;

                    const newGymItems = gymItems.filter(a => a.id !== activityId);
                    let newGymTotal = (currentProfileLog.gym || 0) - activityToRemove.caloriesBurned;
                    if (isNaN(newGymTotal) || newGymTotal < 0) newGymTotal = 0;

                    return {
                        logs: {
                            ...state.logs,
                            [date]: {
                                ...dateLogs,
                                [profileId]: {
                                    ...currentProfileLog,
                                    gym: newGymTotal,
                                    items: {
                                        ...items,
                                        gym: newGymItems
                                    }
                                }
                            }
                        }
                    };
                }),

            addCustomFood: (foodData) =>
                set((state) => {
                    const id = 'custom_' + generateId();
                    const newFood = { ...foodData, id } as import('@/lib/foodDatabase').FoodItem;
                    return { customFoods: [...state.customFoods, newFood] };
                }),

            removeCustomFood: (foodId) =>
                set((state) => ({
                    customFoods: state.customFoods.filter((f) => f.id !== foodId),
                })),
        }),
        {
            name: 'health-tracker-storage',
        }
    )
);
