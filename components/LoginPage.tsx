"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Hardcoded credentials
  const USER = "admin@utility.com";
  const PWD = "password123";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === USER && password === PWD) {
      setError("");
      router.push("/utility");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-700 rounded-2xl border border-slate-600 p-8 shadow-2xl">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-600 rounded-full mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-white text-xl font-medium mb-1">Utility</h1>
          <h2 className="text-white text-lg font-normal">Administration Portal</h2>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300 text-sm font-normal">
              Email ID
            </Label>
            <Input
              id="email"
              type="email"
              className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-400 focus:ring-slate-400"
              placeholder=""
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-300 text-sm font-normal">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-400 focus:ring-slate-400"
              placeholder=""
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          {/* Forgot Password Link */}
          <div className="text-right">
            <a href="#" className="text-slate-300 text-sm hover:text-white transition-colors">
              Forgot Password?
            </a>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg h-12 transition-colors"
          >
            Sign In
          </Button>

          {/* Sign Up Button */}
          <Button
            type="button"
            variant="secondary"
            className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 rounded-lg h-12 border-0 transition-colors"
          >
            New User? Sign Up
          </Button>
        </form>
      </div>
    </div>
  )
}