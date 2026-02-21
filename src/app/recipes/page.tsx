"use client";

import { useStore, Recipe, LoggedFood } from "@/store/useStore";
import { useState, useEffect } from "react";
import { Utensils, Trash2, Plus, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { getAllFoods } from "@/lib/foodDatabase";

export default function RecipesPage() {
    const { recipes, removeRecipe, addRecipe, customFoods } = useStore();
    const [hydro, setHydro] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // New Recipe State
    const [recipeName, setRecipeName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [ingredients, setIngredients] = useState<LoggedFood[]>([]);

    useEffect(() => {
        setHydro(true);
    }, []);

    if (!hydro) return null;

    const allFoods = getAllFoods(customFoods);
    const filteredFoods = allFoods.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10);

    const totalCalories = ingredients.reduce((sum, item) => sum + (item.calories * item.quantity), 0);

    const handleCreateRecipe = () => {
        if (!recipeName || ingredients.length === 0) return;

        addRecipe({
            name: recipeName,
            ingredients,
            totalCalories
        });

        setRecipeName("");
        setIngredients([]);
        setIsAdding(false);
    };

    const handleAddIngredient = (food: any) => {
        setIngredients(prev => {
            const existing = prev.find(i => i.foodId === food.id);
            if (existing) {
                return prev.map(i => i.foodId === food.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, {
                id: Math.random().toString(36).substr(2, 9),
                foodId: food.id,
                name: food.name,
                calories: food.calories,
                quantity: 1
            }];
        });
    };

    const handleRemoveIngredient = (id: string) => {
        setIngredients(prev => prev.filter(i => i.id !== id));
    };

    return (
        <main className="w-full max-w-2xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Saved Meals</h1>
                    <p className="text-muted-foreground">Bundle foods into a single tap-to-log meal.</p>
                </div>

                <Dialog open={isAdding} onOpenChange={setIsAdding}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Create Meal</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] h-[90vh] sm:h-[80vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="px-6 py-4 border-b shrink-0">
                            <DialogTitle>Create a Saved Meal</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="recipe-name">Meal Name</Label>
                                <Input
                                    id="recipe-name"
                                    autoFocus
                                    placeholder="e.g. Morning Protein Shake"
                                    value={recipeName}
                                    onChange={e => setRecipeName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Ingredients</Label>
                                {ingredients.length > 0 ? (
                                    <div className="space-y-2 border rounded-xl p-3 bg-muted/20">
                                        {ingredients.map(ing => (
                                            <div key={ing.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 bg-background border rounded-lg gap-2">
                                                <div className="flex items-center gap-2 font-medium">
                                                    {ing.quantity > 1 && (
                                                        <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">x{ing.quantity}</span>
                                                    )}
                                                    <span className="text-sm">{ing.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                                    <span className="text-xs text-muted-foreground font-semibold bg-muted px-2 py-0.5 rounded-full">
                                                        {ing.calories * ing.quantity} kcal
                                                    </span>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveIngredient(ing.id)}>
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2 border-t mt-2 flex justify-between items-center px-1">
                                            <span className="text-sm text-muted-foreground font-medium">Total Calories:</span>
                                            <span className="font-bold text-primary">{totalCalories} kcal</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground border-2 border-dashed p-4 rounded-xl text-center">
                                        No ingredients added yet. Search below to add foods!
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2 pb-4">
                                <Label>Add Foods</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search database or custom foods..."
                                        className="pl-9 bg-muted/50"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="border rounded-xl mt-2 overflow-hidden shadow-sm divide-y">
                                    {filteredFoods.length > 0 ? filteredFoods.map(food => (
                                        <button
                                            key={food.id}
                                            className="w-full flex items-center justify-between p-3 text-left hover:bg-muted transition-colors"
                                            onClick={() => handleAddIngredient(food)}
                                        >
                                            <div>
                                                <div className="font-medium text-sm flex items-center gap-2">
                                                    {food.name}
                                                    {food.id.startsWith('custom_') && (
                                                        <span className="text-[10px] font-semibold text-primary/80 bg-primary/10 px-1.5 py-0.5 rounded-full">Custom</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-0.5">{food.servingSize}</div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                    {food.calories} kcal
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground opacity-50" />
                                            </div>
                                        </button>
                                    )) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">No matching foods found.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t shrink-0 bg-background">
                            <Button className="w-full sm:w-auto" disabled={!recipeName || ingredients.length === 0} onClick={handleCreateRecipe}>
                                Save Meal
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                {recipes?.map((recipe) => (
                    <Card key={recipe.id} className="relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="destructive"
                                size="icon"
                                className="w-8 h-8 rounded-full shadow-md"
                                onClick={() => removeRecipe(recipe.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Utensils className="w-4 h-4 text-primary" />
                                {recipe.name}
                            </CardTitle>
                            <CardDescription className="flex gap-2 font-medium">
                                <span className="text-primary">{recipe.totalCalories} kcal</span>
                                <span>•</span>
                                <span>{recipe.ingredients.length} item{recipe.ingredients.length !== 1 && 's'}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-1">
                                {recipe.ingredients.map(ing => (
                                    <span key={ing.id} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md border">
                                        {ing.quantity > 1 ? `${ing.quantity}x ` : ''}{ing.name}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!recipes || recipes.length === 0) && (
                    <div className="col-span-full border-2 border-dashed p-8 rounded-2xl flex flex-col items-center justify-center text-center text-muted-foreground bg-muted/10">
                        <Utensils className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="font-semibold text-foreground mb-1">No Saved Meals</h3>
                        <p className="text-sm max-w-[200px]">Create a bundle of foods to log them with a single tap from the dashboard.</p>
                    </div>
                )}
            </section>
        </main>
    );
}
