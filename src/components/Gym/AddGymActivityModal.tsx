"use client";

import { useState } from "react";
import { useStore, LoggedActivity } from "@/store/useStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Flame } from "lucide-react";
import { GYM_ACTIVITIES, GymActivityRef, calculateCardioCalories, calculateStrengthCalories } from "@/lib/gymDatabase";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
    dateStr: string;
    profileId: string;
    weight: number;
}

export function AddGymActivityModal({ dateStr, profileId, weight }: Props) {
    const { addGymActivity } = useStore();
    const [open, setOpen] = useState(false);

    // Form State
    const [selectedActivityId, setSelectedActivityId] = useState<string>("");
    const [duration, setDuration] = useState<string>("");
    const [pace, setPace] = useState<string>(""); // Speed (km/h)
    const [gradient, setGradient] = useState<string>(""); // Incline (%)
    const [sets, setSets] = useState<string>("");
    const [reps, setReps] = useState<string>("");
    const [activityWeight, setActivityWeight] = useState<string>(""); // Weight (kg)

    const selectedRef = GYM_ACTIVITIES.find(a => a.id === selectedActivityId);

    // Group activities by category
    const groupedActivities = GYM_ACTIVITIES.reduce((acc, activity) => {
        if (!acc[activity.category]) acc[activity.category] = [];
        acc[activity.category].push(activity);
        return acc;
    }, {} as Record<string, typeof GYM_ACTIVITIES>);

    const handleAdd = () => {
        if (!selectedRef) return;

        let calories = 0;
        const durNum = parseInt(duration) || 0;
        const paceNum = parseFloat(pace) || 0;
        const gradNum = parseFloat(gradient) || 0;
        const setsNum = parseInt(sets) || 0;
        const repsNum = parseInt(reps) || 0;
        const weightNum = parseFloat(activityWeight) || 0;

        if (selectedRef.type === "cardio") {
            calories = calculateCardioCalories(selectedRef.baseMET, weight, durNum);
        } else {
            calories = calculateStrengthCalories(selectedRef.baseMET, weight, setsNum, repsNum);
        }

        if (calories <= 0) return; // Basic validation

        const activity: Omit<LoggedActivity, 'id'> = {
            activityId: selectedRef.id,
            name: selectedRef.name,
            caloriesBurned: calories,
            duration: durNum > 0 ? durNum : undefined,
            pace: paceNum > 0 ? paceNum : undefined,
            gradient: gradNum > 0 ? gradNum : undefined,
            sets: setsNum > 0 ? setsNum : undefined,
            reps: repsNum > 0 ? repsNum : undefined,
            weight: weightNum > 0 ? weightNum : undefined,
        };

        addGymActivity(dateStr, profileId, activity);

        // Reset and close
        setSelectedActivityId("");
        setDuration("");
        setPace("");
        setGradient("");
        setSets("");
        setReps("");
        setActivityWeight("");
        setOpen(false);
    };

    // Calculate live estimate for UI
    let liveEstimate = 0;
    if (selectedRef) {
        if (selectedRef.type === "cardio" && parseInt(duration)) {
            liveEstimate = calculateCardioCalories(selectedRef.baseMET, weight, parseInt(duration));
        } else if (selectedRef.type === "strength" && parseInt(sets)) {
            liveEstimate = calculateStrengthCalories(selectedRef.baseMET, weight, parseInt(sets), parseInt(reps) || 10); // default 10 reps for estimate if empty
        }
    }

    const isValid = selectedRef && (liveEstimate > 0);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-6 text-lg rounded-xl shadow-lg border border-red-500/50">
                    <Plus className="w-5 h-5 mr-2" />
                    Log Workout
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-black text-red-50 border-red-900 shadow-2xl shadow-red-900/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Flame className="w-5 h-5 text-red-500" />
                        Log Gym Activity
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Activity Selector */}
                    <div className="space-y-2">
                        <Label className="text-red-400">Select Activity</Label>
                        <Select value={selectedActivityId} onValueChange={setSelectedActivityId}>
                            <SelectTrigger className="w-full bg-red-950/20 border-red-900/50 focus:ring-red-500 text-red-50">
                                <SelectValue placeholder="Choose an exercise..." />
                            </SelectTrigger>
                            <SelectContent className="max-h-64 bg-black border-red-900/50 text-red-50">
                                {Object.entries(groupedActivities).map(([category, activities]) => (
                                    <SelectGroup key={category}>
                                        <SelectLabel className="text-red-600 font-bold bg-red-950/20 sticky top-0 px-3 py-2 z-10 border-b border-red-900/30">
                                            {category}
                                        </SelectLabel>
                                        {activities.map((activity) => (
                                            <SelectItem key={activity.id} value={activity.id} className="focus:bg-red-900/40 focus:text-red-50 ml-2">
                                                {activity.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Dynamic Inputs based on type */}
                    {selectedRef && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {selectedRef.type === "cardio" ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration" className="text-red-400">Duration (Minutes) *</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            min="1"
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            placeholder="e.g. 30"
                                            className="bg-red-950/20 border-red-900/50 focus-visible:ring-red-500"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="pace" className="text-red-400 border-b border-red-900/30 pb-1">Speed (km/h)</Label>
                                            <Input
                                                id="pace"
                                                type="number"
                                                step="0.1"
                                                min="0"
                                                value={pace}
                                                onChange={(e) => setPace(e.target.value)}
                                                placeholder="e.g. 8.5"
                                                className="bg-red-950/20 border-red-900/50 focus-visible:ring-red-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="gradient" className="text-red-400 border-b border-red-900/30 pb-1">Gradient (%)</Label>
                                            <Input
                                                id="gradient"
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={gradient}
                                                onChange={(e) => setGradient(e.target.value)}
                                                placeholder="e.g. 2.0"
                                                className="bg-red-950/20 border-red-900/50 focus-visible:ring-red-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-red-500/70 mt-1">Calorie estimate is based on Duration. Speed & Gradient are logged for tracking.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sets" className="text-red-400 border-b border-red-900/30 pb-1 flex justify-between">
                                                <span>Sets *</span>
                                            </Label>
                                            <Input
                                                id="sets"
                                                type="number"
                                                min="1"
                                                value={sets}
                                                onChange={(e) => setSets(e.target.value)}
                                                placeholder="e.g. 3"
                                                className="bg-red-950/20 border-red-900/50 focus-visible:ring-red-500"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="reps" className="text-red-400 border-b border-red-900/30 pb-1">Reps *</Label>
                                            <Input
                                                id="reps"
                                                type="number"
                                                min="1"
                                                value={reps}
                                                onChange={(e) => setReps(e.target.value)}
                                                placeholder="e.g. 10"
                                                className="bg-red-950/20 border-red-900/50 focus-visible:ring-red-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2 border-t border-red-900/30">
                                        <Label htmlFor="activityWeight" className="text-red-400">Weight Used (kg) <span className="text-xs text-red-500/60 font-normal ml-1">Optional</span></Label>
                                        <Input
                                            id="activityWeight"
                                            type="number"
                                            step="0.5"
                                            min="0"
                                            value={activityWeight}
                                            onChange={(e) => setActivityWeight(e.target.value)}
                                            placeholder="e.g. 60"
                                            className="bg-red-950/20 border-red-900/50 focus-visible:ring-red-500"
                                        />
                                        <p className="text-xs text-red-500/70 mt-1">Leave empty for bodyweight exercises.</p>
                                    </div>
                                </div>
                            )}

                            {/* Live Estimate */}
                            <div className="mt-6 pt-4 border-t border-red-900/30 flex items-end justify-between">
                                <span className="text-sm font-medium text-red-400">Estimated Burn:</span>
                                <span className="text-3xl font-black text-red-500">{liveEstimate} <span className="text-sm font-medium text-red-400">kcal</span></span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="mt-2">
                    <Button
                        type="button"
                        onClick={handleAdd}
                        disabled={!isValid}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold disabled:bg-red-950 disabled:text-red-500/50 disabled:border-red-900/50 transition-colors border border-transparent"
                    >
                        Save Activity
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
