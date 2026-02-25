"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useAuth } from "@/components/AuthProvider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ActivityLevel, Gender } from "@/lib/calculations";

export function EditProfileModal() {
    const [open, setOpen] = useState(false);
    const { profiles, activeProfileId, updateProfile, logWeight, activeDateStr } = useStore();
    const { token } = useAuth();

    const [name, setName] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [age, setAge] = useState("");
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>("sedentary");
    const [deficit, setDeficit] = useState("");

    // Populate form fields whenever the modal opens or active profile changes
    useEffect(() => {
        if (open && activeProfileId) {
            const profile = profiles.find((p) => p.id === activeProfileId);
            if (profile) {
                setName(profile.name);
                setGender(profile.gender as Gender);
                setWeight(String(profile.weight));
                setHeight(String(profile.height));
                setAge(String(profile.age));
                setActivityLevel(profile.activityLevel as ActivityLevel);
                setDeficit(String(profile.deficitAmount));
            }
        }
    }, [open, activeProfileId, profiles]);

    const handleSave = async () => {
        if (!activeProfileId || !name || !weight || !height || !age || !deficit) return;

        const parsedWeight = parseFloat(weight);
        const updates = {
            name,
            gender,
            weight: parsedWeight,
            height: parseFloat(height),
            age: parseInt(age, 10),
            activityLevel,
            deficitAmount: parseInt(deficit, 10),
        };

        // Update local Zustand store immediately for a snappy UI
        updateProfile(activeProfileId, updates);

        // Persist to the database so changes survive a reload
        if (token) {
            try {
                await fetch(`/api/profiles/${activeProfileId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(updates),
                });
            } catch (err) {
                console.error("Failed to persist profile update:", err);
            }
        }

        // Also log the weight into history for the active date
        if (!isNaN(parsedWeight)) {
            logWeight(activeDateStr, activeProfileId, parsedWeight);
        }

        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button id="edit-profile-trigger" className="hidden" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-name" className="text-right">Name</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-gender" className="text-right">Gender</Label>
                        <Select value={gender} onValueChange={(val) => setGender(val as Gender)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-age" className="text-right">Age (yrs)</Label>
                        <Input id="edit-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-weight" className="text-right">Weight (kg)</Label>
                        <Input id="edit-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-height" className="text-right">Height (cm)</Label>
                        <Input id="edit-height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-activity" className="text-right">Activity</Label>
                        <Select value={activityLevel} onValueChange={(val) => setActivityLevel(val as ActivityLevel)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="sedentary">Sedentary</SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="moderate">Moderate</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="very_active">Very Active</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="edit-deficit" className="text-right">Deficit (kcal)</Label>
                        <Input id="edit-deficit" type="number" value={deficit} onChange={(e) => setDeficit(e.target.value)} className="col-span-3" placeholder="e.g. 500" />
                        <span className="col-span-4 text-xs text-muted-foreground ml-[104px]">
                            Target = Maintenance - Deficit. (Use 0 for maintenance).
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="w-full">Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
