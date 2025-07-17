"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandInput, CommandList, CommandItem, CommandEmpty } from "@/components/ui/command";
import { useEffect, useRef } from "react";
import { useSimplifiedUtilDataStore } from "@/app/utility/lib/stores/utility-store";
import Cookies from 'js-cookie';

export default function SignIn() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [city, setCity] = useState("");
    const [cityQuery, setCityQuery] = useState("");
    const [citySuggestions, setCitySuggestions] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState<any | null>(null);
    const [cityBounds, setCityBounds] = useState<{
      latMin: number;
      latMax: number;
      lonMin: number;
      lonMax: number;
    } | null>(null);
    const cityFetchTimeout = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const fetchAndStore = useSimplifiedUtilDataStore(state => state.fetchAndStore);
    const setCitySelection = useSimplifiedUtilDataStore(state => state.setCitySelection);

    // Hardcoded credentials
    const USER = "admin@utility.com";
    const PWD = "password123";
    const AUTH_COOKIE_VALUE = '2f8a1b7c-utility-auth';

    // Fetch city suggestions from Nominatim
    useEffect(() => {
        if (!cityQuery) {
            setCitySuggestions([]);
            return;
        }
        if (cityFetchTimeout.current) clearTimeout(cityFetchTimeout.current);
        cityFetchTimeout.current = setTimeout(() => {
            fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(cityQuery)}&format=json&addressdetails=1&limit=5`)
                .then(res => res.json())
                .then(data => {
                    setCitySuggestions(data);
                });
        }, 300);
    }, [cityQuery]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        if (!selectedCity) {
            setError("Please select a city from the suggestions");
            setLoading(false);
            return;
        }
        if (email === USER && password === PWD) {
            setError("");
            // Set authentication cookie to a hardcoded random string
            Cookies.set('utility-auth', AUTH_COOKIE_VALUE, { expires: 1 });
            // Call fetchAndStore with cityBounds after successful login
            if (cityBounds) {
                // Try to extract city and state from selectedCity.address
                let cityName = selectedCity?.address?.city || selectedCity?.address?.town || selectedCity?.address?.village || selectedCity?.address?.municipality || selectedCity?.address?.county || selectedCity?.address?.state || "";
                let stateName = selectedCity?.address?.state || selectedCity?.address?.region || "";
                setCitySelection({ cityBounds, cityName, stateName });
                fetchAndStore(cityBounds, cityName, stateName);
            }
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
            <form className="w-full space-y-6" onSubmit={handleLogin} autoComplete="off">
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
                {/* City Field with Autocomplete */}
                <div className="space-y-2">
                    <Label htmlFor="city" className="text-slate-300 text-sm font-normal">
                        City
                    </Label>
                    <Command className="bg-slate-600 border-slate-500 rounded-lg">
                        <CommandInput
                            id="city"
                            value={cityQuery}
                            onValueChange={(val: string) => {
                                setCityQuery(val);
                                setCity(val);
                                setSelectedCity(null);
                            }}
                            placeholder="Enter city, state, country"
                            className="bg-slate-600 text-white placeholder:text-slate-400 rounded-lg h-12"
                            autoComplete="off"
                        />
                        {/* Only show suggestions if a city is not selected */}
                        {!selectedCity && (
                            <CommandList>
                                {citySuggestions.length === 0 && cityQuery && (
                                    <CommandEmpty>No results found.</CommandEmpty>
                                )}
                                {citySuggestions.map((suggestion: any) => {
                                    const display = `${suggestion.display_name}`;
                                    return (
                                        <CommandItem
                                            key={suggestion.place_id}
                                            value={display}
                                            onSelect={() => {
                                                setCity(display);
                                                setCityQuery(display);
                                                setSelectedCity(suggestion);
                                                setCitySuggestions([]);
                                                // Extract bounding box from suggestion
                                                if (suggestion.boundingbox && suggestion.boundingbox.length === 4) {
                                                  setCityBounds({
                                                    latMin: parseFloat(suggestion.boundingbox[0]),
                                                    latMax: parseFloat(suggestion.boundingbox[1]),
                                                    lonMin: parseFloat(suggestion.boundingbox[2]),
                                                    lonMax: parseFloat(suggestion.boundingbox[3]),
                                                  });
                                                } else {
                                                  setCityBounds(null);
                                                }
                                            }}
                                            className="cursor-pointer hover:bg-slate-500"
                                        >
                                            {display}
                                        </CommandItem>
                                    );
                                })}
                            </CommandList>
                        )}
                    </Command>
                    {selectedCity && cityBounds && (
                        <div className="text-xs text-slate-300 mt-1">
                            Selected: {selectedCity.display_name}<br />
                            Bounding Box: [
                            {cityBounds.latMin}, {cityBounds.latMax}, {cityBounds.lonMin}, {cityBounds.lonMax}
                            ]
                        </div>
                    )}
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