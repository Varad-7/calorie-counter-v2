"use client";

import { useStore } from "@/store/useStore";
import { User, PlusCircle, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function ProfileSwitcher() {
    const { profiles, activeProfileId, setActiveProfile, deleteProfile } = useStore();

    // Map active ID to string as Select expects strings
    const activeValue = activeProfileId || "";

    const handleValueChange = (val: string) => {
        if (val === "add_new") {
            // Document query selector click to trigger the global Add Profile modal 
            // without needing to prop drill state
            document.getElementById('add-profile-trigger')?.click();
            return;
        }

        // Handle deletion via a special value pattern "delete_ID"
        if (val.startsWith("delete_")) {
            const idToDelete = val.replace("delete_", "");
            const profileName = profiles.find(p => p.id === idToDelete)?.name;
            if (confirm(`Are you sure you want to delete ${profileName}'s profile?`)) {
                deleteProfile(idToDelete);
            }
            return;
        }

        setActiveProfile(val);
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <Select value={activeValue} onValueChange={handleValueChange}>
                <SelectTrigger className="w-full bg-muted/20 border-muted">
                    <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Family Members</SelectLabel>
                        {profiles.map((profile) => (
                            <div key={profile.id} className="relative group flex items-center pr-8">
                                <SelectItem value={profile.id} className="cursor-pointer w-full">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span>{profile.name}</span>
                                    </div>
                                </SelectItem>

                                {/* Delete button overlay that appears on hover */}
                                <button
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm hover:bg-red-500/10 cursor-pointer z-10"
                                    onClick={(e) => {
                                        // Prevent event bubbling so it doesn't trigger the SelectItem click
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleValueChange(`delete_${profile.id}`);
                                    }}
                                    title="Delete Profile"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </SelectGroup>

                    <div className="h-px bg-border my-1 mx-2" />

                    <SelectGroup>
                        <SelectItem value="add_new" className="cursor-pointer text-electric-green font-medium focus:text-electric-green focus:bg-electric-green/10">
                            <div className="flex items-center gap-2">
                                <PlusCircle className="w-4 h-4" />
                                <span>Add Profile</span>
                            </div>
                        </SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}
