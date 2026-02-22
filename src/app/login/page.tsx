"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Flame, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
    const { login, signup } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await signup(email, password);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-8">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                            <Leaf className="w-7 h-7 text-emerald-500" />
                        </div>
                        <Flame className="w-5 h-5 text-orange-500 -ml-3 -mt-4" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">Health Tracker</h1>
                    <p className="text-sm text-muted-foreground">
                        Track calories, fitness, and wellness goals
                    </p>
                </div>

                {/* Auth Card */}
                <Card>
                    <CardHeader className="text-center pb-4">
                        <CardTitle>{isLogin ? "Welcome Back" : "Create Account"}</CardTitle>
                        <CardDescription>
                            {isLogin
                                ? "Sign in to sync your data across devices"
                                : "Sign up to start tracking your health"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-500 text-center bg-red-500/10 rounded-lg p-2">
                                    {error}
                                </p>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base transition-all"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? "Sign In" : "Create Account"}
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin);
                                    setError("");
                                }}
                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {isLogin ? (
                                    <>Don&apos;t have an account? <span className="text-emerald-500 font-medium">Sign up</span></>
                                ) : (
                                    <>Already have an account? <span className="text-emerald-500 font-medium">Sign in</span></>
                                )}
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-xs text-center text-muted-foreground">
                    Your data is stored securely and synced across your devices.
                </p>
            </div>
        </div>
    );
}
