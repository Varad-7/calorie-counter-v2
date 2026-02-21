"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ActivityLevel, Gender } from "@/lib/calculations";

export function AddProfileModal() {
    const [open, setOpen] = useState(false);
    const { addProfile } = useStore();

    const [name, setName] = useState("");
    const [gender, setGender] = useState<Gender>("male");
    const [weight, setWeight] = useState("");
    const [height, setHeight] = useState("");
    const [age, setAge] = useState("");
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>("sedentary");
    const [deficit, setDeficit] = useState("");

    const handleSave = () => {
        if (!name || !weight || !height || !age || !deficit) return;

        addProfile({
            name,
            gender,
            weight: parseFloat(weight),
            height: parseFloat(height),
            age: parseInt(age, 10),
            activityLevel,
            deficitAmount: parseInt(deficit, 10),
        });

        // Reset form
        setName("");
        setWeight("");
        setHeight("");
        setAge("");
        setDeficit("");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button id="add-profile-trigger" className="hidden" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Family Member</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">Gender</Label>
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
                        <Label htmlFor="age" className="text-right">Age (yrs)</Label>
                        <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="weight" className="text-right">Weight (kg)</Label>
                        <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="height" className="text-right">Height (cm)</Label>
                        <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="activity" className="text-right">Activity</Label>
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
                        <Label htmlFor="deficit" className="text-right">Deficit (kcal)</Label>
                        <Input id="deficit" type="number" value={deficit} onChange={(e) => setDeficit(e.target.value)} className="col-span-3" placeholder="e.g. 500" />
                        <span className="col-span-4 text-xs text-muted-foreground ml-[104px]">
                            Target = Maintenance - Deficit. (Use 0 for maintenance).
                        </span>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} className="w-full">Save Profile</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
