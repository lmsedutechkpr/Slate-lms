"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { FieldError } from "./FieldError";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  // Handle Google OAuth errors from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    const errorDesc = params.get("error_description");
    
    if (errorParam) {
      toast.error("Sign in failed", {
        description: decodeURIComponent(errorDesc ?? errorParam),
      });
    }
  }, []);

  function validateForm(): boolean {
    let valid = true;
    
    setEmailError("");
    setPasswordError("");
    
    if (!email.trim()) {
      setEmailError("Email address is required");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    }
    
    if (!password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      valid = false;
    }
    
    return valid;
  }

  async function handleResendVerification() {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim()
    });
    
    if (error) {
      toast.error("Could not resend email");
    } else {
      toast.success("Verification email sent!", {
        description: "Check your inbox."
      });
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
          toast.error("Incorrect email or password", {
            description: "Please check your credentials and try again.",
            icon: "🔐",
          });
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Email not verified", {
            description: "Please check your inbox and click the verification link.",
            action: {
              label: "Resend email",
              onClick: () => handleResendVerification()
            }
          });
        } else if (error.message.includes("Too many requests") || error.message.includes("rate limit")) {
          toast.error("Too many attempts", {
            description: "Please wait a few minutes before trying again.",
          });
        } else if (error.message.includes("User not found")) {
          toast.error("Account not found", {
            description: "No account exists with this email.",
            action: {
              label: "Create account",
              onClick: () => router.push("/signup")
            }
          });
        } else {
          toast.error("Sign in failed", {
            description: error.message,
          });
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", data.user.id)
          .single();
        
        const firstName = profile?.full_name?.split(" ")[0] ?? "back";
        
        toast.success(`Welcome back, ${firstName}!`, {
          description: "Redirecting to your dashboard...",
          duration: 2000,
        });
        
        await new Promise(r => setTimeout(r, 800));
        
        const roleRedirects: Record<string, string> = {
          student: "/dashboard",
          instructor: "/instructor/dashboard",
          vendor: "/vendor/dashboard",
          admin: "/admin/dashboard",
        };
        
        router.push(roleRedirects[profile?.role ?? "student"] ?? "/dashboard");
      }
    } catch (err) {
      toast.error("Something went wrong", {
        description: "Please try again or contact support.",
      });
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error("Google sign-in failed", {
          description: "Please try again or use email login.",
        });
      }
    } catch (error: any) {
      toast.error("Something went wrong", {
        description: "Google login failed. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError("Password is required");
    } else {
      setPasswordError("");
    }
  };

  const inputClass = (hasError: boolean) => cn(
    "w-full pl-10 pr-4 py-3 border rounded-xl text-sm outline-none transition-all duration-150",
    hasError
      ? "border-red-300 bg-red-50/50 text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-gray-900 font-bold text-3xl tracking-tight">
          Sign in
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Enter your email and password to continue
        </p>
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-150 mb-6 disabled:opacity-50"
      >
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
        Continue with Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-gray-400 text-xs">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-medium mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              placeholder="you@example.com"
              disabled={isLoading}
              className={inputClass(!!emailError)}
            />
          </div>
          <FieldError error={emailError} />
        </div>

        {/* Password field */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-gray-700 text-sm font-medium">Password</label>
            <Link
              href="/forgot-password"
              className="text-gray-400 text-xs hover:text-gray-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              onBlur={handlePasswordBlur}
              placeholder="••••••••"
              disabled={isLoading}
              className={inputClass(!!passwordError)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <FieldError error={passwordError} />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-gray-400 text-sm mt-6">
        New to Slate?{" "}
        <Link href="/signup" className="text-gray-900 font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
