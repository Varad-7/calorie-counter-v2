"use client";

import { useState } from "react";
import { useStore } from "@/store/useStore";
import { FoodCategory } from "@/lib/foodDatabase";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

export function AddCustomFoodModal() {
    const { addCustomFood } = useStore();
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [calories, setCalories] = useState("");
    const [servingSize, setServingSize] = useState("");
    const [category, setCategory] = useState<FoodCategory>("Breakfast");

    const handleSubmit = () => {
        const cal = parseInt(calories, 10);
        if (!name.trim() || isNaN(cal) || cal <= 0) return;

        addCustomFood({
            name: name.trim(),
            calories: cal,
            servingSize: servingSize.trim() || "1 Serving",
            category,
        });

        // Reset form
        setName("");
        setCalories("");
        setServingSize("");
        setCategory("Breakfast");
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 gap-1.5 text-xs font-semibold border-dashed border-electric-green/40 hover:border-electric-green hover:bg-electric-green/10 transition-all"
                >
                    <Plus className="w-3.5 h-3.5 text-electric-green" />
                    New Food
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="bg-electric-green/20 p-1.5 rounded-lg">
                            <Plus className="w-4 h-4 text-electric-green" />
                        </div>
                        Add Custom Food
                    </DialogTitle>
                    <DialogDescription>
                        Create a food item that will be permanently available in your food list.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Food Name */}
                    <div className="space-y-2">
                        <Label htmlFor="food-name" className="text-sm font-medium">
                            Food Name
                        </Label>
                        <Input
                            id="food-name"
                            placeholder="e.g. Protein Shake"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    {/* Calories */}
                    <div className="space-y-2">
                        <Label htmlFor="food-calories" className="text-sm font-medium">
                            Calories (kcal)
                        </Label>
                        <Input
                            id="food-calories"
                            type="number"
                            min="1"
                            placeholder="e.g. 150"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    {/* Serving Size */}
                    <div className="space-y-2">
                        <Label htmlFor="food-serving" className="text-sm font-medium">
                            Serving Size <span className="text-muted-foreground">(optional)</span>
                        </Label>
                        <Input
                            id="food-serving"
                            placeholder="e.g. 1 Scoop"
                            value={servingSize}
                            onChange={(e) => setServingSize(e.target.value)}
                            className="h-10"
                        />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Meal Category</Label>
                        <Select value={category} onValueChange={(v) => setCategory(v as FoodCategory)}>
                            <SelectTrigger className="w-full h-10">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Breakfast">🌅 Breakfast</SelectItem>
                                <SelectItem value="Lunch">🍽️ Lunch</SelectItem>
                                <SelectItem value="Snacks">🍎 Snacks</SelectItem>
                                <SelectItem value="Dinner">🌙 Dinner</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!name.trim() || !calories || parseInt(calories, 10) <= 0}
                        className="bg-electric-green text-black hover:bg-electric-green/90 font-semibold"
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Food
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
