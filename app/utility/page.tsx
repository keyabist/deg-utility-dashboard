"use client";
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import UtilityDashboard from "./components/utility-dashboard"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const AUTH_COOKIE_VALUE = '2f8a1b7c-utility-auth';

function Page() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = Cookies.get('utility-auth');
      if (isAuth !== AUTH_COOKIE_VALUE) {
        router.replace('/auth');
      }
    }
  }, [router]);
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-100 to-blue-200">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <p className="ml-4 text-xl text-gray-700">Loading Utility Data...</p>
        </div>
      }
    >
      <UtilityDashboard />
    </Suspense>
  )
}

export default Page;