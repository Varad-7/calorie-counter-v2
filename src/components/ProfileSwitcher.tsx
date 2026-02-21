"use client";

import { useStore } from "@/store/useStore";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, User, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ProfileSwitcher() {
    const { profiles, activeProfileId, setActiveProfile, deleteProfile } = useStore();

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 pt-2">
            <AnimatePresence>
                {profiles.map((profile) => (
                    <motion.div
                        key={profile.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card
                            className={`min-w-40 transition-colors border-2 relative group ${activeProfileId === profile.id
                                ? "border-electric-green bg-electric-green/10"
                                : "border-border hover:border-gray-500 cursor-pointer"
                                }`}
                            onClick={() => {
                                if (activeProfileId !== profile.id) setActiveProfile(profile.id);
                            }}
                        >
                            {/* Delete profile button (only visible on active profile or hover on desktop) */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Are you sure you want to delete ${profile.name}'s profile?`)) {
                                        deleteProfile(profile.id);
                                    }
                                }}
                                className={`absolute right-2 top-2 p-1 rounded-full text-muted-foreground hover:bg-red-500/20 hover:text-red-500 transition-opacity ${activeProfileId === profile.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <CardHeader className="p-4 pr-8">
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <User className="w-4 h-4" />
                                    <span className="truncate">{profile.name}</span>
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>

            <Card
                className="min-w-40 cursor-pointer border-dashed border-2 hover:bg-muted/50 flex items-center justify-center min-h-[72px]"
                onClick={() => {
                    // Trigger add profile modal (implemented in Dashboard or external modal)
                    document.getElementById('add-profile-trigger')?.click();
                }}
            >
                <span className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                    <PlusCircle className="w-4 h-4" />
                    Add Profile
                </span>
            </Card>
        </div>
    );
}
