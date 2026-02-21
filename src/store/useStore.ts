import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ActivityLevel, Gender } from '@/lib/calculations';

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

export interface DayLog {
    breakfast: number;
    lunch: number;
    snacks: number;
    dinner: number;
    items?: {
        breakfast: LoggedFood[];
        lunch: LoggedFood[];
        snacks: LoggedFood[];
        dinner: LoggedFood[];
    };
}

export interface AppState {
    profiles: Profile[];
    activeProfileId: string | null;
    logs: Record<string, Record<string, DayLog>>; // date (YYYY-MM-DD) -> profileId -> DayLog

    // Actions
    addProfile: (profile: Omit<Profile, 'id'>) => void;
    updateProfile: (id: string, updates: Partial<Profile>) => void;
    deleteProfile: (id: string) => void;
    setActiveProfile: (id: string) => void;
    updateLog: (date: string, profileId: string, slot: keyof Omit<DayLog, 'items'>, calories: number) => void;
    addFoodItem: (date: string, profileId: string, slot: keyof Omit<DayLog, 'items'>, food: Omit<LoggedFood, 'id' | 'quantity'>) => void;
    removeFoodItem: (date: string, profileId: string, slot: keyof Omit<DayLog, 'items'>, itemId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            profiles: [],
            activeProfileId: null,
            logs: {},

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

            updateLog: (date, profileId, slot, calories) =>
                set((state) => {
                    const dateLogs = state.logs[date] || {};
                    const profileLog = dateLogs[profileId] || {
                        breakfast: 0,
                        lunch: 0,
                        snacks: 0,
                        dinner: 0,
                        items: { breakfast: [], lunch: [], snacks: [], dinner: [] }
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
                        breakfast: 0, lunch: 0, snacks: 0, dinner: 0,
                    };

                    const items = currentProfileLog.items || { breakfast: [], lunch: [], snacks: [], dinner: [] };
                    const rawSlotItems = items[slot] || [];

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
                    const slotItems = items[slot] || [];

                    // Identify all chunks of this food that match the ID, foodId, or name
                    const itemsToRemove = slotItems.filter(i => i.id === itemId || i.foodId === itemId || i.name === itemId);

                    if (itemsToRemove.length === 0) return state;

                    // Ensure ALL instances of this loosely matched item are purged
                    const newSlotItems = slotItems.filter(i => i.id !== itemId && i.foodId !== itemId && i.name !== itemId);

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
        }),
        {
            name: 'health-tracker-storage',
        }
    )
);
