"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Hardcoded credentials
    const USER = "admin@utility.com";
    const PWD = "password123";

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (email === USER && password === PWD) {
            setError("");
            router.push("/utility");
        } else {
            setError("Invalid email or password");
        }
        setLoading(false);
    };

    return (
        <div className="w-full max-w-md bg-[#181F36] rounded-2xl border border-slate-400 p-8 flex flex-col items-center" style={{ boxShadow: '0 0 0 1px #232B45' }}>
            {/* Logo and Title */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-transparent rounded-full mb-4 border-2 border-slate-200">
                    <Zap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-white text-xl font-bold mb-1">Utility</h1>
                <h2 className="text-white text-lg font-semibold">Administration Portal</h2>
            </div>
            {/* Form */}
            <form className="w-full space-y-6" onSubmit={handleLogin}>
                {/* Email Field */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300 text-sm font-normal">
                        Email ID
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
                        placeholder=""
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                {/* Password Field */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-slate-300 text-sm font-normal">
                            Password
                        </Label>
                        <a href="#" className="text-slate-300 text-xs hover:text-white transition-colors">Forgot Password?</a>
                    </div>
                    <Input
                        id="password"
                        type="password"
                        className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
                        placeholder=""
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                {error && (
                    <div className="text-red-400 text-sm text-center">{error}</div>
                )}
                <Button
                    type="submit"
                    className="w-full bg-[#7B2FF2] hover:bg-[#5F1AB8] text-white font-medium py-3 rounded-lg h-12 transition-colors"
                    disabled={loading}
                >
                    {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <span>Sign In</span>
                    )}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    className="w-full bg-[#232B45] hover:bg-[#232B45]/80 text-white font-medium py-3 rounded-lg h-12 border-0 transition-colors"
                    onClick={() => router.push("/auth?tab=create")}
                >
                    New User? Sign Up
                </Button>
            </form>
        </div>
    );
}