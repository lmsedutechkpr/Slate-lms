"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  GraduationCap, 
  BookOpen, 
  ShoppingBag, 
  Clock, 
  UserPlus, 
  Lock, 
  Mail, 
  User 
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "./FieldError";

export function SignupForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"student" | "instructor" | "vendor">("student");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [termsError, setTermsError] = useState("");

  const router = useRouter();
  const supabase = createClient();

  function validateForm(): boolean {
    let valid = true;
    
    setNameError("");
    setEmailError("");
    setPasswordError("");
    setConfirmError("");
    setTermsError("");
    
    if (!fullName.trim()) {
      setNameError("Full name is required");
      valid = false;
    } else if (fullName.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      valid = false;
    }
    
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
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Include at least one uppercase letter");
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      setPasswordError("Include at least one number");
      valid = false;
    }
    
    if (!confirmPassword) {
      setConfirmError("Please confirm your password");
      valid = false;
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
      valid = false;
    }
    
    if (!agreedToTerms) {
      setTermsError("You must agree to the terms to continue");
      valid = false;
    }
    
    return valid;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below", {
        description: "Check all fields and try again.",
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    const loadingToast = toast.loading("Creating your account...");
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
          }
        }
      });
      
      toast.dismiss(loadingToast);
      
      if (error) {
        if (error.message.includes("already registered") || error.message.includes("User already exists")) {
          setEmailError("An account with this email already exists");
          toast.error("Email already in use", {
            description: "Sign in instead?",
            action: {
              label: "Sign in",
              onClick: () => router.push("/login")
            },
            duration: 6000,
          });
        } else if (error.message.includes("Password should")) {
          setPasswordError(error.message);
          toast.error("Password too weak", {
            description: error.message,
          });
        } else if (error.message.includes("rate limit")) {
          toast.error("Too many attempts", {
            description: "Please wait before trying again.",
          });
        } else {
          toast.error("Account creation failed", {
            description: error.message,
          });
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Update profile with role
        await supabase
          .from("profiles")
          .update({
            role: selectedRole,
            full_name: fullName.trim(),
            approval_status: selectedRole === "student" ? "approved" : "pending",
            is_onboarded: selectedRole !== "student"
          })
          .eq("id", data.user.id);
        
        if (selectedRole === "student") {
          toast.success("Account created!", {
            description: "Welcome to Slate. Setting up your profile...",
            duration: 3000,
          });
          await new Promise(r => setTimeout(r, 1000));
          router.push("/onboarding");
        } else if (selectedRole === "instructor") {
          toast.success("Instructor account created!", {
            description: "Your account is pending admin approval.",
            duration: 4000,
          });
          await new Promise(r => setTimeout(r, 1200));
          router.push("/instructor/dashboard");
        } else if (selectedRole === "vendor") {
          toast.success("Vendor account created!", {
            description: "Your account is pending admin approval.",
            duration: 4000,
          });
          await new Promise(r => setTimeout(r, 1200));
          router.push("/vendor/dashboard");
        }
      } else if (data.session === null) {
        toast.success("Check your email!", {
          description: "We sent a confirmation link to " + email,
          duration: 8000,
          icon: "📧",
        });
        setIsLoading(false);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      toast.error("Something went wrong", {
        description: "Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleNameBlur = () => {
    if (!fullName.trim()) {
      setNameError("Full name is required");
    } else if (fullName.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
    } else {
      setNameError("");
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
    } else if (password.length < 8) {
      setPasswordError("Must be at least 8 characters");
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError("Include an uppercase letter");
    } else if (!/[0-9]/.test(password)) {
      setPasswordError("Include a number");
    } else {
      setPasswordError("");
    }
  };
  
  const handleConfirmBlur = () => {
    if (!confirmPassword) {
      setConfirmError("Please confirm your password");
    } else if (password !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
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
          description: "Please try again or use email signup.",
        });
      }
    } catch (error: any) {
      toast.error("Something went wrong", {
        description: "Google login failed. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const inputStyle = (hasError: boolean) => cn(
    "w-full px-4 py-2.5 border rounded-xl text-sm transition-all duration-150 outline-none",
    hasError
      ? "border-red-300 bg-red-50/50 text-red-900 placeholder:text-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5"
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-gray-900 font-bold text-3xl tracking-tight">
          Create account
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Join Slate and start your journey
        </p>
      </div>

      {/* Role selector */}
      <div className="mb-5">
        <p className="text-gray-700 text-sm font-medium mb-2">I want to...</p>
        <div className="grid grid-cols-3 gap-2">
          {/* Learn card */}
          <button
            type="button"
            onClick={() => setSelectedRole("student")}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-150 cursor-pointer",
              selectedRole === "student"
                ? "border-black bg-gray-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg mb-1.5 flex items-center justify-center",
                selectedRole === "student" ? "bg-black" : "bg-gray-100"
              )}
            >
              <GraduationCap
                className={cn(
                  "w-4 h-4",
                  selectedRole === "student" ? "text-white" : "text-gray-500"
                )}
              />
            </div>
            <span className="text-gray-900 text-xs font-semibold">Learn</span>
            <span className="text-gray-400 text-[10px]">Take courses</span>
          </button>

          {/* Teach card */}
          <button
            type="button"
            onClick={() => setSelectedRole("instructor")}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-150 cursor-pointer",
              selectedRole === "instructor"
                ? "border-black bg-gray-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg mb-1.5 flex items-center justify-center",
                selectedRole === "instructor" ? "bg-black" : "bg-gray-100"
              )}
            >
              <BookOpen
                className={cn(
                  "w-4 h-4",
                  selectedRole === "instructor" ? "text-white" : "text-gray-500"
                )}
              />
            </div>
            <span className="text-gray-900 text-xs font-semibold">Teach</span>
            <span className="text-gray-400 text-[10px]">Create courses</span>
          </button>

          {/* Sell card */}
          <button
            type="button"
            onClick={() => setSelectedRole("vendor")}
            className={cn(
              "flex flex-col items-center py-3 px-2 rounded-xl border-2 transition-all duration-150 cursor-pointer",
              selectedRole === "vendor"
                ? "border-black bg-gray-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg mb-1.5 flex items-center justify-center",
                selectedRole === "vendor" ? "bg-black" : "bg-gray-100"
              )}
            >
              <ShoppingBag
                className={cn(
                  "w-4 h-4",
                  selectedRole === "vendor" ? "text-white" : "text-gray-500"
                )}
              />
            </div>
            <span className="text-gray-900 text-xs font-semibold">Sell</span>
            <span className="text-gray-400 text-[10px]">List products</span>
          </button>
        </div>

        {/* Approval notice */}
        {(selectedRole === "instructor" || selectedRole === "vendor") && (
          <div className="mt-2 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-amber-700 text-xs">
              Requires admin approval before going live.
            </p>
          </div>
        )}
      </div>

      {/* Google OAuth — only for students */}
      {selectedRole === "student" && (
        <>
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full border border-gray-200 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 mb-4 transition-all duration-150"
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
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-gray-400 text-xs">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          {/* Full name */}
          <div>
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (nameError) setNameError("");
              }}
              onBlur={handleNameBlur}
              disabled={isLoading}
              className={inputStyle(!!nameError)}
            />
            <FieldError error={nameError} />
          </div>

          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              onBlur={handleEmailBlur}
              disabled={isLoading}
              className={inputStyle(!!emailError)}
            />
            <FieldError error={emailError} />
          </div>

          {/* Password + Confirm */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  onBlur={handlePasswordBlur}
                  disabled={isLoading}
                  className={inputStyle(!!passwordError)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError error={passwordError} />
            </div>

            <div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (confirmError) setConfirmError("");
                  }}
                  onBlur={handleConfirmBlur}
                  disabled={isLoading}
                  className={inputStyle(!!confirmError)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError error={confirmError} />
            </div>
          </div>
        </div>

        {/* Terms checkbox */}
        <div className="flex items-start gap-2.5 mt-4 mb-5">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => {
              setAgreedToTerms(checked as boolean);
              if (termsError) setTermsError("");
            }}
            disabled={isLoading}
            className="mt-0.5 flex-shrink-0"
          />
          <label
            htmlFor="terms"
            className="text-gray-500 text-xs leading-relaxed cursor-pointer"
          >
            I agree to Slate's{" "}
            <Link href="/terms" className="text-gray-900 underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-gray-900 underline">
              Privacy Policy
            </Link>
          </label>
        </div>
        <FieldError error={termsError} />

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {isLoading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-gray-400 text-sm mt-4">
        Have an account?{" "}
        <Link href="/login" className="text-gray-900 font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
