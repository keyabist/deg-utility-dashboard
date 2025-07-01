"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth";

export default function SignUp() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#181F36] rounded-2xl border border-slate-400 p-8 flex flex-col items-center" style={{ boxShadow: '0 0 0 1px #232B45' }}>
      <div className="text-left w-full mb-8">
        <h1 className="text-white text-xl font-bold mb-1">Sign Up</h1>
        <p className="text-slate-300 text-sm mb-4">Enter your information to create an account</p>
      </div>
      <form className="w-full space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first-name" className="text-slate-300 text-sm font-normal">First name</Label>
            <Input
              id="first-name"
              placeholder="Max"
              required
              className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
              onChange={(e) => {
                setFirstName(e.target.value);
              }}
              value={firstName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last-name" className="text-slate-300 text-sm font-normal">Last name</Label>
            <Input
              id="last-name"
              placeholder="Robinson"
              required
              className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
              onChange={(e) => {
                setLastName(e.target.value);
              }}
              value={lastName}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-300 text-sm font-normal">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            value={email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-300 text-sm font-normal">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Password"
            className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password_confirmation" className="text-slate-300 text-sm font-normal">Confirm Password</Label>
          <Input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            autoComplete="new-password"
            placeholder="Confirm Password"
            className="bg-transparent border border-slate-400 text-white placeholder:text-slate-400 rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image" className="text-slate-300 text-sm font-normal">Profile Image (optional)</Label>
          <div className="flex items-end gap-4">
            {imagePreview && (
              <div className="relative w-16 h-16 rounded-sm overflow-hidden">
                <Image
                  src={imagePreview}
                  alt="Profile preview"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
            )}
            <div className="flex items-center gap-2 w-full">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-transparent border border-slate-400 text-white rounded-lg h-12 focus:border-slate-300 focus:ring-slate-400"
              />
              {imagePreview && (
                <X
                  className="cursor-pointer"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                />
              )}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full bg-[#7B2FF2] hover:bg-[#5F1AB8] text-white font-medium py-3 rounded-lg h-12 transition-colors"
          disabled={loading}
          onClick={(e) => {
            e.preventDefault();
            setLoading(true);
            signUp({
              email,
              password,
            }).then((res) => {
              setLoading(false);
              router.push("/utility");
            }).catch((err) => {
              setLoading(false);
              toast.error(err);
            })
          }}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Create an account"
          )}
        </Button>
        <div className="w-full flex justify-center mt-4">
          <span className="text-slate-300 text-sm">Already have an account?{' '}
            <button
              type="button"
              className="text-[#7B2FF2] hover:underline ml-1"
              onClick={() => router.push('/auth?tab=login')}
            >
              Log in
            </button>
          </span>
        </div>
      </form>
      <div className="flex justify-center w-full border-t border-slate-600 py-4 mt-8">
        <p className="text-center text-xs text-neutral-500">
          Secured by <span className="text-orange-400">better-auth.</span>
        </p>
      </div>
    </div>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}