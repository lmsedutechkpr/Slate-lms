"use client";

import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GoogleOAuthButton() {
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || "Something went wrong with Google login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-150 mb-6 disabled:opacity-50"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path
            fill="#4285F4"
            d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
          />
          <path
            fill="#34A853"
            d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
          />
          <path
            fill="#FBBC05"
            d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a9.006 9.006 0 000 8.088l3.007-2.332z"
          />
          <path
            fill="#EA4335"
            d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.956L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          />
        </svg>
      )}
      {isLoading ? "Connecting..." : "Continue with Google"}
    </button>
  );
}
