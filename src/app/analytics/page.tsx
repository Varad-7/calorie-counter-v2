"use client";

import { useStore } from "@/store/useStore";
import { useState, useEffect, useMemo } from "react";
import { ComposedChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from "recharts";
import { TrendingUp, Target, Scale, Flame, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BMIMeter } from "@/components/BMIMeter";

function getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dates.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
    }
    return dates;
}

export default function AnalyticsPage() {
    const { profiles, activeProfileId, logs, weightHistory } = useStore();
    const [hydro, setHydro] = useState(false);

    useEffect(() => {
        setHydro(true);
    }, []);

    const profile = profiles.find(p => p.id === activeProfileId);

    const calorieData = useMemo(() => {
        if (!profile) return [];
        const days = getLast7Days();
        const maintenance = profile.gender === 'male'
            ? 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
            : 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;

        const multipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9 };
        const tdee = maintenance * multipliers[profile.activityLevel];
        const target = tdee - profile.deficitAmount;

        return days.map(date => {
            const dayLog = logs[date]?.[profile.id];
            const consumed = dayLog ? (dayLog.breakfast + dayLog.lunch + dayLog.snacks + dayLog.dinner) : 0;
            const burned = dayLog?.gym || 0;
            const net = consumed - burned;

            const parts = date.split('-');
            const shortDate = `${parts[1]}/${parts[2]}`;

            return {
                date: shortDate,
                fullDate: date,
                consumed: Math.round(consumed),
                net: Math.round(net),
                target: Math.round(target),
                burned: Math.round(burned),
            };
        });
    }, [profile, logs]);

    const weightData = useMemo(() => {
        if (!profile) return [];

        // Sort all weight entries by date
        const profileWeights = weightHistory[profile.id] || {};
        const dates = Object.keys(profileWeights).sort();

        return dates.map(date => {
            const parts = date.split('-');
            return {
                date: `${parts[1]}/${parts[2]}`,
                weight: profileWeights[date],
            };
        }).slice(-14); // Show last 14 logged weights
    }, [profile, weightHistory]);


    if (!hydro) return null;

    if (!profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <Activity className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-xl font-semibold">Select a Profile First</h2>
                <p className="text-muted-foreground mt-2">Go to the home screen to select or create a profile to view analytics.</p>
            </div>
        );
    }

    const avgConsumed = calorieData.reduce((acc, curr) => acc + curr.consumed, 0) / 7;
    const avgNet = calorieData.reduce((acc, curr) => acc + curr.net, 0) / 7;
    const isMeetingDeficit = avgNet <= calorieData[0]?.target;

    return (
        <main className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">Detailed insights for {profile.name}</p>
            </header>

            {/* High level stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-primary">
                            <Flame className="w-4 h-4" />
                            <span className="text-sm font-medium">Avg Consumed</span>
                        </div>
                        <div className="text-2xl font-bold">{Math.round(avgConsumed)} <span className="text-sm font-normal text-muted-foreground">kcal</span></div>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-green-500">
                            <Target className="w-4 h-4" />
                            <span className="text-sm font-medium">Avg Net</span>
                        </div>
                        <div className="text-2xl font-bold">{Math.round(avgNet)} <span className="text-sm font-normal text-muted-foreground">kcal</span></div>
                    </CardContent>
                </Card>

                <Card className="bg-orange-500/5 border-orange-500/20">
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-orange-500">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-sm font-medium">Goal Status</span>
                        </div>
                        <div className="text-lg font-bold leading-tight mt-1">
                            {isMeetingDeficit ? "On Track 🎯" : "Over Target ⚠️"}
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-500/5 border-purple-500/20">
                    <CardContent className="p-4 flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-purple-500">
                            <Scale className="w-4 h-4" />
                            <span className="text-sm font-medium">Current Weight</span>
                        </div>
                        <div className="text-2xl font-bold">{profile.weight} <span className="text-sm font-normal text-muted-foreground">kg</span></div>
                    </CardContent>
                </Card>
            </div>

            <BMIMeter weight={profile.weight} height={profile.height} />

            <Tabs defaultValue="calories" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="calories">Caloric Trends (7 Days)</TabsTrigger>
                    <TabsTrigger value="weight">Weight History</TabsTrigger>
                </TabsList>

                <TabsContent value="calories">
                    <Card>
                        <CardHeader>
                            <CardTitle>Net Calories vs Target</CardTitle>
                            <CardDescription>Your net intake compared to your daily goal limit.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart data={calorieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
                                        <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: '1px solid rgba(128,128,128,0.3)', backgroundColor: 'rgba(20,20,20,0.95)', color: '#fff' }}
                                            itemStyle={{ color: '#e5e5e5' }}
                                            labelStyle={{ color: '#a3a3a3' }}
                                        />
                                        <Legend iconType="circle" />
                                        <Area
                                            type="monotone"
                                            dataKey="net"
                                            name="Net Calories"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorNet)"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="target"
                                            name="Target Goal"
                                            stroke="#ef4444"
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={false}
                                        />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Intake & Activity Breakdown</CardTitle>
                            <CardDescription>Calories consumed vs calories burned through exercise.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={calorieData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
                                        <YAxis axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid rgba(128,128,128,0.3)', backgroundColor: 'rgba(20,20,20,0.95)', color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                                            itemStyle={{ color: '#e5e5e5' }}
                                            labelStyle={{ color: '#a3a3a3' }}
                                        />
                                        <Legend iconType="circle" />
                                        <Bar dataKey="consumed" name="Consumed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="burned" name="Burned (Gym)" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="weight">
                    <Card>
                        <CardHeader>
                            <CardTitle>Weight Progression</CardTitle>
                            <CardDescription>Track your weight changes over your last logged entries.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {weightData.length < 2 ? (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                                    Not enough weight data to show a trend. Log your weight in the profile editor!
                                </div>
                            ) : (
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={weightData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.2)" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
                                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tickMargin={10} fontSize={12} stroke="#888" />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '8px', border: '1px solid rgba(128,128,128,0.3)', backgroundColor: 'rgba(20,20,20,0.95)', color: '#fff' }}
                                                itemStyle={{ color: '#e5e5e5' }}
                                                labelStyle={{ color: '#a3a3a3' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="weight"
                                                name="Weight (kg)"
                                                stroke="#8b5cf6"
                                                strokeWidth={4}
                                                dot={{ r: 6, fill: "#8b5cf6", strokeWidth: 2, stroke: '#1a1a1a' }}
                                                activeDot={{ r: 8 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </main>
    );
}
