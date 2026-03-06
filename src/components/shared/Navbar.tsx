"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { GraduationCap, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Features", href: "#features" },
  { name: "Courses", href: "/courses" },
  { name: "Shop", href: "/shop" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, clearUser } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/onboarding");
  if (isAuthPage) return null;

  return (
    <nav className={cn(
      "fixed top-0 z-50 w-full transition-all duration-300",
      scrolled ? "py-4" : "py-6"
    )}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn(
          "mx-auto flex h-14 max-w-5xl items-center justify-between px-6 transition-all duration-300 rounded-full border border-black/[0.05]",
          scrolled 
            ? "bg-white/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]" 
            : "bg-transparent border-transparent"
        )}>
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 transition-all duration-1000 active:scale-[0.995] group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black transition-all duration-1000 group-hover:scale-[1.02]">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-black transition-opacity duration-1000 group-hover:opacity-70">Slate</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex md:items-center md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-[13px] font-medium text-black/50 transition-colors hover:text-black"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="hidden md:flex md:items-center md:space-x-4">
              {user ? (
                <Button variant="ghost" size="sm" className="rounded-full text-black/60 font-medium h-9 px-5 hover:bg-black/5 active:scale-[0.995] transition-all duration-700" onClick={() => clearUser()}>
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="text-black font-medium h-9 px-5 hover:bg-black/5 rounded-full active:scale-[0.995] transition-all duration-700" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button size="sm" className="bg-black text-white font-medium h-9 px-5 hover:bg-black/80 rounded-full shadow-lg shadow-black/10 transition-all active:scale-[0.995] duration-700" asChild>
                    <Link href="/signup">Sign up</Link>
                  </Button>
                </>
              )}
            </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-black/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="container absolute left-0 right-0 top-20 z-40 mx-auto px-4 md:hidden"
        >
          <div className="flex flex-col space-y-4 rounded-3xl border border-black/[0.05] bg-white/90 p-6 shadow-2xl backdrop-blur-xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-lg font-medium text-black/60 hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex flex-col space-y-2 pt-4 border-t border-black/[0.05]">
              {user ? (
                <Button variant="outline" className="rounded-full" onClick={() => clearUser()}>
                  Log out
                </Button>
              ) : (
                <>
                  <Button variant="ghost" className="justify-start rounded-full" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button className="justify-start rounded-full bg-black text-white" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
