"use client";

import Link from "next/link";
import { Navbar } from "@/components/shared/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  Video, 
  Radio, 
  ShoppingBag, 
  Sparkles, 
  Download, 
  Globe, 
  Star,
  CheckCircle2,
  Users,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  Zap,
  MousePointer2
} from "lucide-react";
import { useEffect, useState } from "react";
import { MacWindow } from "@/components/shared/MacWindow";

const stats = [
  { label: "Active Learners", value: 12000, suffix: "+" },
  { label: "Expert Courses", value: 450, suffix: "+" },
  { label: "Partner Brands", value: 85, suffix: "+" },
  { label: "Success Rate", value: 98, suffix: "%" },
];

const features = [
  {
    icon: Video,
    title: "Cinema-Grade Learning",
    description: "4K HDR lectures with interactive transcripts and chapter-based navigation.",
    size: "large"
  },
  {
    icon: Radio,
    title: "Live Workshops",
    description: "Bi-weekly interactive sessions with industry pioneers.",
    size: "small"
  },
  {
    icon: ShoppingBag,
    title: "Integrated Shop",
    description: "Get the exact gear used by your instructors in one click.",
    size: "small"
  },
  {
    icon: Sparkles,
    title: "Smart Roadmap",
    description: "AI that evolves with your progress, recommending what's next.",
    size: "medium"
  },
  {
    icon: Globe,
    title: "Bilingual Mastery",
    description: "Seamlessly switch between English and Tamil localized content.",
    size: "medium"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    }
  },
};

export default function LandingPage() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const intervals = stats.map((stat, index) => {
      const increment = Math.ceil(stat.value / 100);
      return setInterval(() => {
        setCounts(prev => {
          const next = [...prev];
          if (next[index] < stat.value) {
            next[index] = Math.min(next[index] + increment, stat.value);
          }
          return next;
        });
      }, 30);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-black selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Ambient Effects */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none overflow-hidden">
             <div className="absolute -top-[10%] left-[10%] w-[40%] h-[40%] bg-black/[0.02] blur-[120px] rounded-full" />
             <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-black/[0.01] blur-[100px] rounded-full" />
          </div>

          <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="outline" className="rounded-full border-black/[0.08] bg-black/[0.02] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-black/40">
                  <span className="mr-2 text-black">✦</span> Version 2.0 Now Live
                </Badge>
              </motion.div>
              
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className="text-6xl font-bold tracking-tight sm:text-8xl text-black leading-[0.95]"
                >
                  Write Your <br />
                  <span className="text-black/30">Future in Slate</span>
                </motion.h1>

              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg text-black/50 leading-relaxed font-medium max-w-xl"
              >
                A unified ecosystem for modern learners. Master high-impact skills with expert-led courses and professional gear.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row gap-4 pt-4"
              >
                <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full bg-black text-white hover:bg-black/90 transition-all active:scale-95 shadow-2xl shadow-black/10" asChild>
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold rounded-full border-black/[0.08] text-black hover:bg-black/5 transition-all active:scale-95" asChild>
                  <Link href="/courses">View Catalog</Link>
                </Button>
              </motion.div>
            </div>

            {/* Platform Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-24 max-w-6xl mx-auto"
            >
              <MacWindow title="Slate Desktop — Student Dashboard" className="shadow-[0_40px_120px_-20px_rgba(0,0,0,0.12)]">
                <div className="bg-white p-8 aspect-[16/10] sm:aspect-[16/9] overflow-hidden">
                  <div className="grid grid-cols-12 gap-8 h-full">
                    {/* Sidebar Mockup */}
                    <div className="col-span-3 space-y-6 border-r border-black/[0.03] pr-8 hidden sm:block">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-black/[0.05]" />
                        <div className="h-3 w-20 bg-black/[0.05] rounded-full" />
                      </div>
                      <div className="space-y-4 pt-4">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-black/[0.05]" />
                            <div className={`h-2 ${i % 2 === 0 ? 'w-16' : 'w-24'} bg-black/[0.03] rounded-full`} />
                          </div>
                        ))}
                      </div>
                      <div className="mt-12 pt-12 border-t border-black/[0.03] space-y-4">
                        <div className="h-10 w-10 bg-black/[0.05] rounded-full" />
                        <div className="h-2 w-16 bg-black/[0.05] rounded-full" />
                      </div>
                    </div>
                    {/* Content Mockup */}
                    <div className="col-span-12 sm:col-span-9 space-y-8">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-6 w-48 bg-black/5 rounded-lg" />
                          <div className="h-3 w-32 bg-black/[0.02] rounded-lg" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-10 w-10 bg-black/[0.03] rounded-full" />
                          <div className="h-10 w-10 bg-black/[0.03] rounded-full" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="h-40 bg-black/[0.02] rounded-3xl border border-black/[0.03] p-6 space-y-4">
                           <div className="h-4 w-8 bg-black/[0.05] rounded" />
                           <div className="h-2 w-24 bg-black/[0.03] rounded" />
                        </div>
                        <div className="h-40 bg-black/[0.02] rounded-3xl border border-black/[0.03] p-6 space-y-4">
                           <div className="h-4 w-8 bg-black/[0.05] rounded" />
                           <div className="h-2 w-24 bg-black/[0.03] rounded" />
                        </div>
                        <div className="h-40 bg-black/[0.02] rounded-3xl border border-black/[0.03] p-6 space-y-4 hidden lg:block">
                           <div className="h-4 w-8 bg-black/[0.05] rounded" />
                           <div className="h-2 w-24 bg-black/[0.03] rounded" />
                        </div>
                      </div>
                      <div className="h-48 bg-black/[0.01] rounded-[2.5rem] border border-black/[0.02] flex items-center justify-center">
                         <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-black/5" />
                            <div className="h-2 w-32 bg-black/[0.03] rounded-full" />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </MacWindow>
              
              {/* Floating Performance Indicator */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 hidden xl:block"
              >
                <div className="p-5 rounded-[2rem] border border-black/[0.05] shadow-2xl bg-white/80 backdrop-blur-2xl">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">Growth</p>
                      <p className="text-lg font-bold text-black">+240% Speed</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Brand Logos / Social Proof */}
        <section className="py-12 border-y border-black/[0.03] bg-[#FBFBFB]">
           <div className="container mx-auto px-4">
              <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125">
                 <div className="text-xl font-bold tracking-tighter">APPLE</div>
                 <div className="text-xl font-bold tracking-tighter">STRIPE</div>
                 <div className="text-xl font-bold tracking-tighter">VERCEL</div>
                 <div className="text-xl font-bold tracking-tighter">LINEAR</div>
                 <div className="text-xl font-bold tracking-tighter">RAYCAST</div>
              </div>
           </div>
        </section>

        {/* Bento Features Section */}
        <section id="features" className="py-32 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
              <h2 className="text-4xl font-bold tracking-tight sm:text-5xl text-black">
                Everything you need <br />
                <span className="text-black/30">to master your craft.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
              {/* Large Feature */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 row-span-1 rounded-[2.5rem] bg-[#F9F9F9] border border-black/[0.03] p-10 flex flex-col justify-between group transition-all duration-500 overflow-hidden relative"
              >
                <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <MousePointer2 className="h-6 w-6 text-black/20" />
                </div>
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-black/[0.05] flex items-center justify-center mb-8">
                  <Video className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-3">Cinema-Grade Learning</h3>
                  <p className="text-black/40 font-medium max-w-md">Experience lectures in 4K HDR with dynamic chaptering and AI-powered search across all course transcripts.</p>
                </div>
              </motion.div>

              {/* Small Feature */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-1 rounded-[2.5rem] bg-black p-10 flex flex-col justify-between transition-all duration-500"
              >
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                  <Radio className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Live Access</h3>
                  <p className="text-white/40 font-medium">Weekly real-time sessions.</p>
                </div>
              </motion.div>

              {/* Small Feature */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="col-span-1 rounded-[2.5rem] bg-[#F9F9F9] border border-black/[0.03] p-10 flex flex-col justify-between transition-all duration-500"
              >
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-black/[0.05] flex items-center justify-center mb-8">
                  <ShoppingBag className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-black mb-3">One-Click Gear</h3>
                  <p className="text-black/40 font-medium">Curated tools for your course.</p>
                </div>
              </motion.div>

              {/* Large Feature */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 row-span-1 rounded-[2.5rem] bg-[#F9F9F9] border border-black/[0.03] p-10 flex flex-col justify-between transition-all duration-500 overflow-hidden relative"
              >
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-black/[0.05] flex items-center justify-center mb-8">
                  <Globe className="h-6 w-6 text-black" />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                  <div className="max-w-md">
                    <h3 className="text-2xl font-bold text-black mb-3">Bilingual Core</h3>
                    <p className="text-black/40 font-medium">The first platform designed natively for both Tamil and English speakers. No translation lags, just pure content.</p>
                  </div>
                  <div className="flex -space-x-3">
                    <div className="h-12 w-12 rounded-full bg-black border-4 border-white flex items-center justify-center text-[10px] font-bold text-white">EN</div>
                    <div className="h-12 w-12 rounded-full bg-black/10 border-4 border-white flex items-center justify-center text-[10px] font-bold text-black">TA</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Minimal Stats */}
        <section className="py-32 bg-black text-white rounded-[3.5rem] mx-4 sm:mx-8 mb-32 overflow-hidden relative">
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
              {stats.map((stat, index) => (
                <div key={stat.label} className="space-y-4 group">
                  <div className="text-5xl sm:text-7xl font-bold tracking-tighter transition-transform duration-500 group-hover:scale-110">
                    {counts[index]}{stat.suffix}
                  </div>
                  <div className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works - Minimal List */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-20 items-start">
               <div className="md:w-1/2 space-y-6 md:sticky md:top-40">
                  <h2 className="text-5xl font-bold tracking-tight text-black">The Slate <br /> Methodology.</h2>
                  <p className="text-black/40 text-lg font-medium leading-relaxed">We stripped away the noise of traditional LMS to focus on what matters: clarity, speed, and outcomes.</p>
                  <Button variant="outline" className="rounded-full border-black/10 h-12 px-6 group" asChild>
                     <Link href="/about">Learn our Story <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                  </Button>
               </div>
               <div className="md:w-1/2 space-y-24">
                  {[
                    { step: "01", title: "Smart Onboarding", desc: "Our AI analyzes your goals and current skill level to build a custom-tailored path that evolves as you learn.", icon: Users },
                    { step: "02", title: "Focused Practice", desc: "Watch, do, and repeat. Our platform integrates coding sandboxes and design previews directly into the player.", icon: Zap },
                    { step: "03", title: "Professional Gear", desc: "Don't just learn the theory. Get access to the same professional tools and hardware used by industry leads.", icon: ShoppingBag },
                  ].map((item) => (
                    <div key={item.step} className="space-y-6">
                      <div className="text-sm font-bold text-black/20 tracking-widest">{item.step}</div>
                      <h3 className="text-3xl font-bold text-black">{item.title}</h3>
                      <p className="text-black/40 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </section>

        {/* Testimonials in MacWindows */}
        <section className="py-32 bg-[#F9F9F9] border-y border-black/[0.03]">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-bold tracking-tight text-black">Proven by the best.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: "Arun Kumar", role: "Software Engineer", quote: "The interface speed is incredible. It feels more like a native Mac app than a website.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arun" },
                { name: "Priya Sharma", role: "Product Designer", quote: "Finally, a platform that respects typography and white space. It makes learning a joy.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" },
                { name: "James Wilson", role: "Content Creator", quote: "The integrated shop feature saved me hours of research on camera gear.", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                >
                  <MacWindow className="h-full border-black/[0.03] shadow-lg group hover:shadow-2xl transition-all duration-500">
                    <div className="p-8 space-y-6">
                      <div className="flex space-x-1 text-black/10">
                        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-current text-black" />)}
                      </div>
                      <p className="text-lg font-bold text-black leading-relaxed">"{t.quote}"</p>
                      <div className="flex items-center space-x-4 pt-6 border-t border-black/[0.03]">
                        <img src={t.avatar} alt={t.name} className="h-10 w-10 rounded-full grayscale hover:grayscale-0 transition-all duration-500" />
                        <div>
                          <p className="font-bold text-black text-sm">{t.name}</p>
                          <p className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </MacWindow>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Massive Final CTA */}
        <section className="py-48 bg-white overflow-hidden relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-[0.02] select-none">
             <div className="text-[20vw] font-black leading-none tracking-tighter">SLATE</div>
          </div>
          
          <div className="container relative mx-auto px-4 text-center space-y-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-6xl font-bold tracking-tight sm:text-9xl text-black leading-none"
            >
              Ready to write?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-xl text-black/40 font-medium max-w-2xl mx-auto"
            >
              Join 12,000+ ambitious individuals already writing their future on Slate.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="pt-8"
            >
              <Button size="lg" className="h-20 px-16 text-2xl font-bold rounded-full bg-black text-white hover:bg-black/90 transition-all active:scale-95 shadow-3xl shadow-black/20 group" asChild>
                <Link href="/signup">Get Started Free <ArrowRight className="ml-4 h-8 w-8 transition-transform group-hover:translate-x-2" /></Link>
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Ultra Minimal Footer */}
      <footer className="bg-white text-black py-20 border-t border-black/[0.03]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <Link href="/" className="flex items-center space-x-3 text-black">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tighter">Slate</span>
              </Link>
              <p className="text-black/30 font-medium text-base max-w-xs leading-relaxed">
                The unified engine for modern learning and commerce. Crafted with precision for the next generation of builders.
              </p>
            </div>
            
            <div className="space-y-6">
              <h4 className="text-black font-bold text-[10px] uppercase tracking-[0.2em]">Platform</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Features</Link></li>
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Curriculum</Link></li>
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-black font-bold text-[10px] uppercase tracking-[0.2em]">Company</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">About</Link></li>
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-black font-bold text-[10px] uppercase tracking-[0.2em]">Legal</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Privacy</Link></li>
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Terms</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-black font-bold text-[10px] uppercase tracking-[0.2em]">Social</h4>
              <ul className="space-y-3 text-sm font-bold">
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">Twitter</Link></li>
                <li><Link href="#" className="text-black/30 hover:text-black transition-colors">GitHub</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-32 pt-12 border-t border-black/[0.03] flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.25em] text-black/20">
            <p>© 2026 Slate Learning Systems. Made with focus.</p>
            <div className="flex gap-10">
               <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Secure
               </div>
               <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Systems Nominal
               </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
