import React, { ReactNode } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

interface AuthLayoutProps {
  leftContent: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({ leftContent, children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden font-outfit">
      {/* LEFT — Dark branding panel */}
      <div className="hidden lg:flex w-1/2 bg-black flex-col justify-between p-12 relative">
        {/* Background pattern — subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px,
                              transparent 1px),
              linear-gradient(90deg,
                              rgba(255,255,255,0.5) 1px,
                              transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Slate
          </span>
        </div>

        {/* Middle: Content */}
        <div className="relative z-10">
          {leftContent}
        </div>

        {/* Bottom: Tagline */}
        <div className="relative z-10">
          <p className="text-gray-600 text-sm tracking-widest uppercase">
            Write your future
          </p>
        </div>
      </div>

      {/* RIGHT — Form side */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-8 sm:px-16 overflow-hidden relative">
        {/* Back to home — top right */}
        <div className="absolute top-6 right-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-gray-400 text-sm hover:text-gray-700 transition-all duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>

        {/* Form container — max width */}
        <div className="w-full max-w-sm mx-auto overflow-y-auto max-h-full py-8 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
