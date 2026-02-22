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
                    // Auto-pull from cloud on app load
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
    }, [pullFromCloud]);

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
        // Auto-pull data after login
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
            const state = useStore.getState();

            // Transform water from Record<date, Record<profileId, glasses>>
            // to Record<"profileId_date", glasses> for the API
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

            const res = await fetch("/api/sync", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    profiles: state.profiles,
                    logs: state.logs,
                    recipes: state.recipes,
                    waterLogs,
                    weightEntries,
                }),
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
