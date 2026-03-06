import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { OnboardingForm } from "@/components/auth/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="h-screen bg-slate-50 flex flex-col items-center justify-center p-4 md:p-6 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto space-y-6 md:space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-transform duration-500 group-hover:scale-105">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <span className="text-2xl md:text-3xl font-extrabold tracking-tighter">Slate</span>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">Let's set up your Slate</h1>
            <p className="text-sm md:text-base text-slate-500 font-medium">Personalize your learning and shopping experience.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/60 p-6 md:p-10 border border-slate-100">
          <OnboardingForm />
        </div>

        {/* Footer */}
        <p className="text-center text-xs md:text-sm text-slate-400">
          Need help? <Link href="#" className="text-primary hover:underline font-medium">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}
