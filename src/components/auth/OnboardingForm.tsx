"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { onboardingSchema, OnboardingValues } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const INTERESTS = [
  "Technology", "Design", "Business", "Science", "Arts", "Music",
  "Languages", "Health", "Finance", "Photography", "Marketing", "Cooking"
];

const LANGUAGES = [
  { id: "en", label: "English", flag: "🇬🇧" },
  { id: "ta", label: "தமிழ் (Tamil)", flag: "🇮🇳" }
];

export function OnboardingForm() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, setUser, getRedirectPath } = useAuthStore();
  const supabase = createClient();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      interests: [],
      preferred_language: "en",
      bio: "",
    },
  });

  const selectedInterests = form.watch("interests");
  const selectedLanguage = form.watch("preferred_language");

  const nextStep = async () => {
    if (step === 1) {
      const isValid = await form.trigger("interests");
      if (!isValid) return;
    }
    if (step === 2) {
      const isValid = await form.trigger("preferred_language");
      if (!isValid) return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const toggleInterest = (interest: string) => {
    const current = [...selectedInterests];
    const index = current.indexOf(interest);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(interest);
    }
    form.setValue("interests", current, { shouldValidate: true });
  };

    const onSubmit = async (values: OnboardingValues) => {
      try {
        setIsLoading(true);

        // Always resolve the user ID from the auth session to avoid store race conditions
        let userId = user?.id;
        if (!userId) {
          const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
          if (authError || !supabaseUser) {
            toast.error("Session expired. Please sign in again.");
            router.push("/login");
            return;
          }
          userId = supabaseUser.id;
        }

        // UPDATE only the onboarding fields — never overwrite email/full_name/role
        const { data, error } = await supabase
          .from("profiles")
          .update({
            interests: values.interests,
            preferred_language: values.preferred_language,
            bio: values.bio,
            is_onboarded: true,
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) throw error;

        setUser(data);
        toast.success("Welcome to Slate! Your profile is ready.");

        const redirectPath =
          data.role === "instructor" ? "/instructor/dashboard" :
          data.role === "vendor" ? "/vendor/dashboard" :
          data.role === "admin" ? "/admin/dashboard" :
          "/dashboard";

        router.push(redirectPath);
      } catch (error: any) {
        toast.error(error.message || "Failed to complete onboarding");
      } finally {
        setIsLoading(false);
      }
    };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 md:space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <span>Step {step} of 3</span>
          <span>{Math.round((step / 3) * 100)}% Complete</span>
        </div>
        <Progress value={(step / 3) * 100} className="h-1.5 md:h-2" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-[300px] md:min-h-[360px] flex flex-col justify-between">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">What do you want to learn?</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">Select at least one interest to personalize your experience.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                  {INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        "p-2.5 md:p-3.5 rounded-xl border-2 text-xs md:text-sm font-bold transition-all duration-300 text-center active:scale-95",
                        selectedInterests.includes(interest)
                          ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                          : "bg-white border-muted hover:border-primary/40 text-muted-foreground"
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
                {form.formState.errors.interests && (
                  <p className="text-xs text-destructive font-medium text-center">
                    {form.formState.errors.interests.message}
                  </p>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Choose your language</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">We'll show you content in your preferred language.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 md:gap-5 px-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      type="button"
                      onClick={() => form.setValue("preferred_language", lang.id as any)}
                      className={cn(
                        "flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl border-2 transition-all duration-300 active:scale-[0.98] space-y-2",
                        selectedLanguage === lang.id
                          ? "border-primary bg-primary/[0.03] shadow-md"
                          : "border-muted hover:border-primary/30"
                      )}
                    >
                      <span className="text-4xl md:text-5xl">{lang.flag}</span>
                      <span className="text-sm md:text-base font-bold tracking-tight">{lang.label}</span>
                      {selectedLanguage === lang.id && (
                        <div className="h-4 w-4 rounded-full bg-primary flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ x: 10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -10, opacity: 0 }}
                className="space-y-4 md:space-y-6"
              >
                <div className="space-y-1 text-center">
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">Tell us about yourself</h2>
                  <p className="text-xs md:text-sm text-muted-foreground">This helps instructors and other learners get to know you.</p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="bio" className="text-[10px] font-bold uppercase tracking-wider text-black/30 ml-1">Bio (Optional)</Label>
                    <Textarea
                      id="bio"
                      placeholder="I'm learning because..."
                      className="min-h-[100px] md:min-h-[120px] resize-none rounded-xl border-slate-200 focus:ring-primary/20 text-sm md:text-base placeholder:text-black/20 p-4"
                      {...form.register("bio")}
                    />
                    <p className="text-right text-[10px] font-bold text-black/20 uppercase tracking-widest">
                      {form.watch("bio")?.length || 0} / 200
                    </p>
                  </div>
                  
                  <div className="bg-primary/[0.03] p-3 md:p-4 rounded-xl border border-primary/10 flex items-start space-x-3">
                    <div className="p-2 rounded-lg bg-primary text-white mt-0.5">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight text-primary">Ready to start?</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        You'll have full access to our course library and learning shop.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-4 md:pt-6 mt-4 md:mt-6 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1 || isLoading}
            className={cn("h-10 md:h-12 px-4 md:px-6 rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest text-black/40", step === 1 && "opacity-0 pointer-events-none")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>

          {step === 3 ? (
            <div className="flex items-center space-x-2 md:space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onSubmit(form.getValues())}
                disabled={isLoading}
                className="h-10 md:h-12 px-4 md:px-6 rounded-xl font-bold text-xs md:text-sm uppercase tracking-widest text-black/40"
              >
                Skip
              </Button>
              <Button type="submit" disabled={isLoading} className="h-10 md:h-12 px-6 md:px-8 rounded-xl font-bold bg-black text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-95 text-xs md:text-sm uppercase tracking-widest">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>Finish Setup <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </div>
          ) : (
            <Button type="button" onClick={nextStep} className="h-10 md:h-12 px-6 md:px-10 rounded-xl font-bold bg-black text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] active:scale-95 text-xs md:text-sm uppercase tracking-widest">
              Next Step <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
