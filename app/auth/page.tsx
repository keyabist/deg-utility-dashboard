// app/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SignIn from "@/components/signin";
import SignUp from "@/components/signout";


export default function Home() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return (
    <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center">
      <div className="w-full max-w-md">
        {tab === "create" ? <SignUp /> : <SignIn />}
      </div>
    </div>
  );
}
