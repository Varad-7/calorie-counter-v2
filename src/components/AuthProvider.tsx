"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useStore } from "@/store/useStore";

interface AuthUser {
    userId: string;
    email: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    isSyncing: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
    syncToCloud: () => Promise<string>;
    syncFromCloud: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);

    // Build the sync payload from the current Zustand store state
    const buildSyncPayload = useCallback(() => {
        const state = useStore.getState();

        // Transform water: Record<date, Record<profileId, glasses>> -> Record<"profileId_date", glasses>
        const waterLogs: Record<string, number> = {};
        for (const [date, profileWater] of Object.entries(state.water || {})) {
            for (const [profileId, glasses] of Object.entries(profileWater)) {
                waterLogs[`${profileId}_${date}`] = glasses;
            }
        }

        // Transform weight history to array
        const weightEntries: { profileId: string; date: string; weight: number }[] = [];
        for (const [profileId, dates] of Object.entries(state.weightHistory || {})) {
            for (const [date, weight] of Object.entries(dates)) {
                weightEntries.push({ profileId, date, weight });
            }
        }

        // Transform logs: flatten nested items.{slot} into foods[] and items.gym into activities[]
        // The server POST /api/sync expects { foods: [...], activities: [...] } per log entry
        const serializedLogs: Record<string, Record<string, unknown>> = {};
        for (const [date, profileLogs] of Object.entries(state.logs || {})) {
            serializedLogs[date] = {};
            for (const [profileId, log] of Object.entries(profileLogs)) {
                const items = log.items || { breakfast: [], lunch: [], snacks: [], dinner: [], gym: [] };
                const foods: { slot: string; foodId: string; name: string; calories: number; quantity: number }[] = [];
                for (const slot of ["breakfast", "lunch", "snacks", "dinner"] as const) {
                    const slotItems = (items as Record<string, unknown>)[slot] as { foodId?: string; name: string; calories: number; quantity?: number }[] || [];
                    for (const item of slotItems) {
                        foods.push({ slot, foodId: item.foodId || item.name, name: item.name, calories: item.calories, quantity: item.quantity || 1 });
                    }
                }
                const activities = (items.gym || []).map((a: { activityId?: string; name: string; caloriesBurned: number; duration?: number; pace?: number; gradient?: number; sets?: number; reps?: number; weight?: number }) => ({
                    activityId: a.activityId || a.name,
                    name: a.name,
                    caloriesBurned: a.caloriesBurned,
                    duration: a.duration,
                    pace: a.pace,
                    gradient: a.gradient,
                    sets: a.sets,
                    reps: a.reps,
                    weight: a.weight,
                }));
                serializedLogs[date][profileId] = {
                    breakfast: log.breakfast,
                    lunch: log.lunch,
                    snacks: log.snacks,
                    dinner: log.dinner,
                    gym: log.gym,
                    foods,
                    activities,
                };
            }
        }

        return { profiles: state.profiles, logs: serializedLogs, recipes: state.recipes || [], waterLogs, weightEntries };
    }, []);

    // Push current local state up to the cloud
    const pushToCloud = useCallback(async (authToken: string) => {
        try {
            const payload = buildSyncPayload();
            await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
                body: JSON.stringify(payload),
            });
        } catch (err) {
            console.error("Failed to push to cloud:", err);
        }
    }, [buildSyncPayload]);

    // Pull data from cloud and hydrate localStorage/Zustand
    const pullFromCloud = useCallback(async (authToken: string) => {
        try {
            const res = await fetch("/api/sync/pull", {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            if (!res.ok) return;
            const data = await res.json();

            // Only hydrate if there's actual data on the server
            if (data.profiles && data.profiles.length > 0) {
                // Get current Zustand state
                const currentState = useStore.getState();

                // Merge: server data takes priority, but keep local-only data
                const mergedProfiles = data.profiles.length > 0 ? data.profiles : currentState.profiles;

                // Merge logs: server + local (server wins on conflicts)
                const mergedLogs = { ...currentState.logs };
                for (const [date, profileLogs] of Object.entries(data.logs || {})) {
                    if (!mergedLogs[date]) mergedLogs[date] = {};
                    for (const [profileId, log] of Object.entries(profileLogs as Record<string, unknown>)) {
                        mergedLogs[date][profileId] = log as typeof mergedLogs[string][string];
                    }
                }

                // Merge water
                const mergedWater = { ...currentState.water };
                for (const [date, profileWater] of Object.entries(data.water || {})) {
                    if (!mergedWater[date]) mergedWater[date] = {};
                    for (const [profileId, glasses] of Object.entries(profileWater as Record<string, number>)) {
                        mergedWater[date][profileId] = glasses;
                    }
                }

                // Merge weight history
                const mergedWeight = { ...currentState.weightHistory };
                for (const [profileId, dates] of Object.entries(data.weightHistory || {})) {
                    if (!mergedWeight[profileId]) mergedWeight[profileId] = {};
                    for (const [date, weight] of Object.entries(dates as Record<string, number>)) {
                        mergedWeight[profileId][date] = weight;
                    }
                }

                // Merge recipes (by id, server wins)
                const recipeMap = new Map<string, typeof data.recipes[0]>();
                for (const r of currentState.recipes || []) recipeMap.set(r.id, r);
                for (const r of data.recipes || []) recipeMap.set(r.id, r);
                const mergedRecipes = Array.from(recipeMap.values());

                // Apply to store
                useStore.setState({
                    profiles: mergedProfiles,
                    activeProfileId: currentState.activeProfileId || mergedProfiles[0]?.id || null,
                    logs: mergedLogs,
                    recipes: mergedRecipes,
                    water: mergedWater,
                    weightHistory: mergedWeight,
                });
            }
        } catch (err) {
            console.error("Failed to pull from cloud:", err);
        }
    }, []);

    // Check for existing token on mount
    useEffect(() => {
        const stored = localStorage.getItem("auth_token");
        if (stored) {
            setToken(stored);
            fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${stored}` },
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error("Invalid token");
                })
                .then(async (data) => {
                    setUser({ userId: data.id, email: data.email });
                    // First push local data up, then pull server data down (full two-way sync)
                    await pushToCloud(stored);
                    await pullFromCloud(stored);
                })
                .catch(() => {
                    localStorage.removeItem("auth_token");
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [pullFromCloud, pushToCloud]);

    const login = async (email: string, password: string) => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser({ userId: data.userId, email: data.email });
        // Full two-way sync on login: push local data first, then pull server data
        await pushToCloud(data.token);
        await pullFromCloud(data.token);
    };

    const signup = async (email: string, password: string) => {
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        localStorage.setItem("auth_token", data.token);
        setToken(data.token);
        setUser({ userId: data.userId, email: data.email });
    };

    const logout = () => {
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
    };

    const syncToCloud = async (): Promise<string> => {
        if (!token) return "❌ Not logged in";
        setIsSyncing(true);
        try {
            const payload = buildSyncPayload();
            const res = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload),
            });

            if (res.ok) return "✅ Data synced to cloud!";
            const err = await res.json();
            return `❌ ${err.error}`;
        } catch {
            return "❌ Sync failed — check your connection";
        } finally {
            setIsSyncing(false);
        }
    };

    const syncFromCloud = async (): Promise<string> => {
        if (!token) return "❌ Not logged in";
        setIsSyncing(true);
        try {
            await pullFromCloud(token);
            return "✅ Data downloaded from cloud!";
        } catch {
            return "❌ Failed to download data";
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, isSyncing, login, signup, logout, syncToCloud, syncFromCloud }}>
            {children}
        </AuthContext.Provider>
    );
}
