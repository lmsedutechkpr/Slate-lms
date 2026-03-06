import { Spinner } from "@/components/ui/spinner";

export function LoadingSpinner({ fullPage = false, size = "md" }: { fullPage?: boolean; size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (fullPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className={cn("text-primary", sizeClasses[size])} />
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center py-4">
      <Spinner className={cn("text-primary", sizeClasses[size])} />
    </div>
  );
}

import { cn } from "@/lib/utils";
