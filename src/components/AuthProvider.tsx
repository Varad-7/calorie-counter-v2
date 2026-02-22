"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthUser {
    userId: string;
    email: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => void;
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

    // Check for existing token on mount
    useEffect(() => {
        const stored = localStorage.getItem("auth_token");
        if (stored) {
            setToken(stored);
            // Verify token is still valid
            fetch("/api/auth/me", {
                headers: { Authorization: `Bearer ${stored}` },
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error("Invalid token");
                })
                .then((data) => {
                    setUser({ userId: data.id, email: data.email });
                })
                .catch(() => {
                    localStorage.removeItem("auth_token");
                    setToken(null);
                })
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

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

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
