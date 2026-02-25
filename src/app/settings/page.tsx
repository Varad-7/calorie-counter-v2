"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect } from "react";
import { User, Trash2, Edit3, Moon, Sun, Monitor, Bell, Shield, HelpCircle, Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AddProfileModal } from "@/components/AddProfileModal";
import { EditProfileModal } from "@/components/EditProfileModal";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { LogOut, CloudUpload, CloudDownload, ShieldAlert } from "lucide-react";
import Link from "next/link";

const ADMIN_EMAIL = "varadpatil5424@gmail.com";

type ThemeOption = "light" | "dark" | "system";

function ThemePicker() {
    const { theme, setTheme } = useTheme();

    const options: { value: ThemeOption; label: string; icon: React.ReactNode; preview: React.ReactNode }[] = [
        {
            value: "light",
            label: "Light",
            icon: <Sun className="w-5 h-5" />,
            preview: (
                <div className="w-full h-24 rounded-lg bg-white border border-gray-200 p-3 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200" />
                        <div className="h-2.5 w-16 bg-gray-800 rounded-full" />
                    </div>
                    <div className="flex gap-1.5">
                        <div className="h-2 w-10 bg-gray-300 rounded-full" />
                        <div className="h-2 w-14 bg-gray-300 rounded-full" />
                    </div>
                    <div className="flex gap-1.5 mt-auto">
                        <div className="h-4 flex-1 bg-gray-100 rounded-md border border-gray-200" />
                        <div className="h-4 flex-1 bg-gray-100 rounded-md border border-gray-200" />
                    </div>
                </div>
            ),
        },
        {
            value: "dark",
            label: "Dark",
            icon: <Moon className="w-5 h-5" />,
            preview: (
                <div className="w-full h-24 rounded-lg bg-zinc-900 border border-zinc-700 p-3 flex flex-col gap-2 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700" />
                        <div className="h-2.5 w-16 bg-zinc-100 rounded-full" />
                    </div>
                    <div className="flex gap-1.5">
                        <div className="h-2 w-10 bg-zinc-600 rounded-full" />
                        <div className="h-2 w-14 bg-zinc-600 rounded-full" />
                    </div>
                    <div className="flex gap-1.5 mt-auto">
                        <div className="h-4 flex-1 bg-zinc-800 rounded-md border border-zinc-700" />
                        <div className="h-4 flex-1 bg-zinc-800 rounded-md border border-zinc-700" />
                    </div>
                </div>
            ),
        },
        {
            value: "system",
            label: "System",
            icon: <Monitor className="w-5 h-5" />,
            preview: (
                <div className="w-full h-24 rounded-lg overflow-hidden flex">
                    <div className="flex-1 bg-white border-y border-l border-gray-200 p-3 flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                            <div className="h-2 w-8 bg-gray-800 rounded-full" />
                        </div>
                        <div className="h-1.5 w-8 bg-gray-300 rounded-full" />
                        <div className="h-3 flex-1 bg-gray-100 rounded-sm border border-gray-200 mt-auto" />
                    </div>
                    <div className="flex-1 bg-zinc-900 border-y border-r border-zinc-700 p-3 flex flex-col gap-2">
                        <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-zinc-700" />
                            <div className="h-2 w-8 bg-zinc-100 rounded-full" />
                        </div>
                        <div className="h-1.5 w-8 bg-zinc-600 rounded-full" />
                        <div className="h-3 flex-1 bg-zinc-800 rounded-sm border border-zinc-700 mt-auto" />
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {options.map((option) => {
                const isActive = theme === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={`
                            group relative flex flex-col items-center gap-2.5 p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer
                            ${isActive
                                ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                : "border-muted hover:border-muted-foreground/30 hover:bg-muted/50"
                            }
                        `}
                    >
                        {/* Selection indicator */}
                        <div className={`
                            absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                            ${isActive ? "bg-primary scale-100 opacity-100" : "bg-muted scale-75 opacity-0"}
                        `}>
                            <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
                        </div>

                        {/* Theme preview */}
                        <div className={`
                            w-full transition-all duration-300
                            ${isActive ? "scale-[1.02]" : "group-hover:scale-[1.01]"}
                        `}>
                            {option.preview}
                        </div>

                        {/* Label */}
                        <div className="flex items-center gap-1.5">
                            <span className={`transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                                {option.icon}
                            </span>
                            <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                                {option.label}
                            </span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

export default function SettingsPage() {
    const { profiles, deleteProfile, activeProfileId, setActiveProfile } = useStore();
    const [hydro, setHydro] = useState(false);

    useEffect(() => {
        setHydro(true);
    }, []);

    if (!hydro) return null;

    return (
        <main className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your family profiles and app preferences.</p>
            </header>

            {/* Appearance Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Appearance
                </h2>
                <Card>
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base">Theme</CardTitle>
                        <CardDescription>Choose how Family Health Tracker looks to you.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ThemePicker />
                    </CardContent>
                </Card>
            </section>

            {/* Profiles Section */}
            <section className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Family Profiles
                </h2>
                <div className="grid gap-4">
                    {profiles.map((profile) => (
                        <Card key={profile.id} className={activeProfileId === profile.id ? "border-primary/50" : ""}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold flex items-center gap-2">
                                        {profile.name}
                                        {activeProfileId === profile.id && (
                                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                                Active
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {profile.age} yrs • {profile.weight} kg • {profile.deficitAmount} kcal deficit
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-foreground"
                                        onClick={() => {
                                            setActiveProfile(profile.id);
                                            setTimeout(() => {
                                                document.getElementById('edit-profile-trigger')?.click();
                                            }, 0);
                                        }}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:bg-destructive/10"
                                        onClick={() => {
                                            if (confirm(`Are you sure you want to delete ${profile.name}?`)) {
                                                deleteProfile(profile.id);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {profiles.length === 0 && (
                        <p className="text-sm text-muted-foreground">No profiles found.</p>
                    )}
                    <Button
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => document.getElementById('add-profile-trigger')?.click()}
                    >
                        + Add New Profile
                    </Button>
                </div>
            </section>

            <section className="space-y-4 pt-4 pb-12">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-primary" />
                    Support & About
                </h2>
                <Card>
                    <CardContent className="p-0 divide-y">
                        <Button variant="ghost" className="w-full justify-start rounded-none h-auto p-4 font-normal">
                            <Shield className="w-4 h-4 mr-3 text-muted-foreground" />
                            Privacy Policy (Data stays on your device)
                        </Button>
                        <Button variant="ghost" className="w-full justify-start rounded-none h-auto p-4 font-normal">
                            <Bell className="w-4 h-4 mr-3 text-muted-foreground" />
                            Notification Settings
                        </Button>
                        <div className="p-4 flex items-center justify-center">
                            <p className="text-xs text-muted-foreground">Calorie Tracker V2.0.0</p>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <AccountSection />

            <AddProfileModal />
            <EditProfileModal />
        </main>
    );
}

function AccountSection() {
    const { user, isSyncing, logout, syncToCloud, syncFromCloud } = useAuth();
    const [syncMsg, setSyncMsg] = useState("");

    const handleUpload = async () => {
        setSyncMsg("");
        const msg = await syncToCloud();
        setSyncMsg(msg);
    };

    const handleDownload = async () => {
        setSyncMsg("");
        const msg = await syncFromCloud();
        setSyncMsg(msg);
    };

    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Account & Sync</h2>
            <Card>
                <CardContent className="p-4 space-y-3">
                    <p className="text-sm text-muted-foreground">Signed in as <span className="text-foreground font-medium">{user?.email}</span></p>
                    <div className="flex gap-2">
                        <Button onClick={handleUpload} disabled={isSyncing} variant="outline" className="flex-1">
                            <CloudUpload className="w-4 h-4 mr-2" />
                            {isSyncing ? "Syncing..." : "Upload"}
                        </Button>
                        <Button onClick={handleDownload} disabled={isSyncing} variant="outline" className="flex-1">
                            <CloudDownload className="w-4 h-4 mr-2" />
                            {isSyncing ? "Syncing..." : "Download"}
                        </Button>
                    </div>
                    <Button onClick={logout} variant="destructive" className="w-full">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                    {user?.email === ADMIN_EMAIL && (
                        <Link href="/admin" className="block">
                            <Button variant="outline" className="w-full border-violet-500/40 text-violet-400 hover:bg-violet-500/10 hover:text-violet-300">
                                <ShieldAlert className="w-4 h-4 mr-2" />
                                Admin Dashboard
                            </Button>
                        </Link>
                    )}
                    {syncMsg && <p className="text-xs text-center mt-1">{syncMsg}</p>}
                </CardContent>
            </Card>
        </section>
    );
}
