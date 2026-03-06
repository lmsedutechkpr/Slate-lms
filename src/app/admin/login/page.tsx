import { Shield, Lock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
  return (
    <div className="flex h-screen items-center justify-center p-6 bg-black relative overflow-hidden selection:bg-white selection:text-black">
      {/* Abstract Gradient Background (Subtle) */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/[0.05] blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/[0.03] blur-[120px] rounded-full" />
      </div>

        {/* Back Button */}
        <Link 
          href="/" 
          className="absolute top-10 left-10 flex items-center space-x-3 text-white/60 hover:text-white transition-all duration-1000 group z-20"
        >
          <div className="h-10 w-10 rounded-full bg-white/[0.01] border border-white/[0.05] flex items-center justify-center transition-all duration-1000 group-hover:border-white active:scale-[0.995]">
            <ArrowLeft className="h-4 w-4 transition-all duration-700 group-hover:-translate-x-1" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-opacity duration-1000">Exit Portal</span>
        </Link>

          <div className="w-full max-w-md relative z-10 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-white text-black shadow-2xl transition-all duration-1000 hover:scale-[1.02] active:scale-[0.995]">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-white uppercase tracking-tighter">Slate Admin</h1>
                <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.5em] flex items-center justify-center space-x-2">
                  <Lock className="h-3 w-3" />
                  <span>Restricted Ecosystem</span>
                </p>
              </div>
            </div>

            <LoginForm />
          </div>

      {/* System Footer */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <div className="flex items-center space-x-2 text-[9px] font-bold uppercase tracking-[0.4em] text-white/5">
          <div className="h-1 w-1 rounded-full bg-white/10" />
          <span>Slate Authorization System</span>
        </div>
      </div>
    </div>
  );
}
