import React from "react";
import { cn } from "@/lib/utils";

interface MacWindowProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  showTrafficLights?: boolean;
}

export function MacWindow({ 
  children, 
  className, 
  title,
  showTrafficLights = true 
}: MacWindowProps) {
  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border border-black/[0.05] bg-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.1)] transition-all duration-500",
      className
    )}>
      {/* Title Bar */}
      <div className="flex items-center justify-between border-b border-black/[0.03] bg-[#FBFBFB] px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {showTrafficLights && (
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-[#FF5F56]/90 border border-black/[0.05]" />
              <div className="h-3 w-3 rounded-full bg-[#FFBD2E]/90 border border-black/[0.05]" />
              <div className="h-3 w-3 rounded-full bg-[#27C93F]/90 border border-black/[0.05]" />
            </div>
          )}
        </div>
        {title && (
          <span className="absolute left-1/2 -translate-x-1/2 text-[10px] font-medium text-black/30 uppercase tracking-[0.2em] select-none">
            {title}
          </span>
        )}
        <div className="w-12" /> {/* Spacer */}
      </div>
      
      {/* Content */}
      <div className="relative bg-white">
        {children}
      </div>
    </div>
  );
}
