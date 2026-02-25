"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import {
    Users, Utensils, CalendarDays, Dumbbell, ChefHat,
    Droplets, TrendingUp, RefreshCw, ShieldAlert, ArrowUpRight,
    UserCheck
} from "lucide-react";

interface Totals {
    totalUsers: number;
    totalProfiles: number;
    totalDayLogs: number;
    totalFoodEntries: number;
    totalGymEntries: number;
    totalRecipes: number;
    totalWaterLogs: number;
    newUsersLast7Days: number;
}

interface UserStat {
    id: string;
    email: string;
    createdAt: string;
    profileCount: number;
    dayLogCount: number;
    foodCount: number;
    gymCount: number;
    recipeCount: number;
    totalCaloriesLogged: number;
    lastActive: string | null;
}

interface AdminData {
    totals: Totals;
    userStats: UserStat[];
    signupsByDay: Record<string, number>;
}

function MiniBarChart({ data }: { data: Record<string, number> }) {
    const entries = Object.entries(data);
    const max = Math.max(...entries.map(([, v]) => v), 1);
    return (
        <div className="flex items-end gap-1 h-16 w-full">
            {entries.map(([date, count]) => {
                const height = Math.max((count / max) * 100, count > 0 ? 8 : 2);
                const label = date.slice(5); // MM-DD
                return (
                    <div key={date} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div
                            className="w-full rounded-t-sm transition-all duration-500 bg-gradient-to-t from-violet-600 to-violet-400 hover:from-violet-500 hover:to-violet-300 cursor-pointer"
                            style={{ height: `${height}%` }}
                        />
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10 border border-zinc-700">
                            {label}: {count}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    color,
}: {
    icon: React.ElementType;
    label: string;
    value: number | string;
    sub?: string;
    color: string;
}) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-3 hover:border-zinc-700 transition-colors">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-3xl font-bold tracking-tight">{value}</p>
                <p className="text-sm text-zinc-400 mt-0.5">{label}</p>
                {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminPage() {
    const { user, token, isLoading } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<AdminData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortCol, setSortCol] = useState<keyof UserStat>("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [search, setSearch] = useState("");

    const fetchStats = useCallback(async () => {
        if (!token) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/stats", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 403) {
                setError("forbidden");
                return;
            }
            if (!res.ok) throw new Error("Failed");
            setData(await res.json());
        } catch {
            setError("Failed to load admin data.");
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!isLoading && !user) router.push("/login");
    }, [isLoading, user, router]);

    useEffect(() => {
        if (token) fetchStats();
    }, [token, fetchStats]);

    const handleSort = (col: keyof UserStat) => {
        if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortCol(col); setSortDir("desc"); }
    };

    if (isLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
                    <p className="text-sm">Loading admin data…</p>
                </div>
            </div>
        );
    }

    if (error === "forbidden") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950">
                <div className="text-center space-y-4">
                    <ShieldAlert className="w-16 h-16 text-red-500 mx-auto" />
                    <h1 className="text-2xl font-bold text-white">Access Denied</h1>
                    <p className="text-zinc-400">This page is only accessible to admins.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-red-400">
                {error}
            </div>
        );
    }

    if (!data) return null;

    const { totals, userStats, signupsByDay } = data;

    const filtered = userStats.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
        const av = a[sortCol] ?? "";
        const bv = b[sortCol] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
        return sortDir === "asc" ? cmp : -cmp;
    });

    const SortIcon = ({ col }: { col: keyof UserStat }) => (
        <span className={`ml-1 text-xs ${sortCol === col ? "text-violet-400" : "text-zinc-600"}`}>
            {sortCol === col ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
    );

    const colBtn = (col: keyof UserStat, label: string) => (
        <button onClick={() => handleSort(col)} className="flex items-center hover:text-white transition-colors">
            {label}<SortIcon col={col} />
        </button>
    );

    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            {/* Header */}
            <div className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none">Admin Dashboard</h1>
                            <p className="text-xs text-zinc-500 mt-0.5">Family Health Tracker</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchStats}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition-colors"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Refresh
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Total Users" value={totals.totalUsers}
                        sub={`+${totals.newUsersLast7Days} this week`} color="bg-violet-600/20 text-violet-400" />
                    <StatCard icon={UserCheck} label="Profiles" value={totals.totalProfiles}
                        sub={`${(totals.totalProfiles / Math.max(totals.totalUsers, 1)).toFixed(1)} avg/user`} color="bg-blue-600/20 text-blue-400" />
                    <StatCard icon={CalendarDays} label="Day Logs" value={totals.totalDayLogs}
                        color="bg-emerald-600/20 text-emerald-400" />
                    <StatCard icon={Utensils} label="Food Entries" value={totals.totalFoodEntries}
                        color="bg-orange-600/20 text-orange-400" />
                    <StatCard icon={Dumbbell} label="Gym Activities" value={totals.totalGymEntries}
                        color="bg-red-600/20 text-red-400" />
                    <StatCard icon={ChefHat} label="Recipes" value={totals.totalRecipes}
                        color="bg-yellow-600/20 text-yellow-400" />
                    <StatCard icon={Droplets} label="Water Logs" value={totals.totalWaterLogs}
                        color="bg-cyan-600/20 text-cyan-400" />
                    <StatCard icon={TrendingUp} label="New Users (7d)" value={totals.newUsersLast7Days}
                        color="bg-pink-600/20 text-pink-400" />
                </div>

                {/* Signups Chart */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="font-semibold text-white">Signups — Last 14 Days</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Hover bars to see exact count</p>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                            <ArrowUpRight className="w-3.5 h-3.5 text-violet-400" />
                            {totals.newUsersLast7Days} this week
                        </div>
                    </div>
                    <MiniBarChart data={signupsByDay} />
                    <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-zinc-600">{Object.keys(signupsByDay)[0]?.slice(5)}</span>
                        <span className="text-[10px] text-zinc-600">{Object.keys(signupsByDay).at(-1)?.slice(5)}</span>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                            <h2 className="font-semibold text-white">All Users</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">{totals.totalUsers} registered accounts</p>
                        </div>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by email…"
                            className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-violet-500 w-56 transition-colors"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                                    <th className="text-left px-6 py-3">{colBtn("email", "Email")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("profileCount", "Profiles")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("dayLogCount", "Days Logged")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("foodCount", "Foods")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("gymCount", "Gym")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("totalCaloriesLogged", "Total kcal")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("lastActive", "Last Active")}</th>
                                    <th className="text-center px-4 py-3">{colBtn("createdAt", "Joined")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60">
                                {sorted.length === 0 && (
                                    <tr><td colSpan={8} className="text-center py-12 text-zinc-500">No users found</td></tr>
                                )}
                                {sorted.map((u, i) => (
                                    <tr key={u.id} className="hover:bg-zinc-800/50 transition-colors group">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                    {u.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{u.email}</p>
                                                    <p className="text-[10px] text-zinc-500">#{i + 1} · {u.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/40 text-blue-400 text-xs font-medium">
                                                {u.profileCount}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-zinc-300">{u.dayLogCount}</td>
                                        <td className="px-4 py-3.5 text-center text-zinc-300">{u.foodCount}</td>
                                        <td className="px-4 py-3.5 text-center text-zinc-300">{u.gymCount}</td>
                                        <td className="px-4 py-3.5 text-center">
                                            <span className="text-emerald-400 font-medium">
                                                {u.totalCaloriesLogged.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-zinc-400 text-xs">
                                            {u.lastActive ?? <span className="text-zinc-600">—</span>}
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-zinc-500 text-xs">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
