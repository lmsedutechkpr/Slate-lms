"use client";

import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag, LogOut, Clock, Users, LayoutDashboard, Settings, AlertCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function VendorDashboardPage() {
  const { user, clearUser } = useAuthStore();
  const supabase = createClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearUser();
      toast.success("Successfully logged out");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const isApproved = user?.approval_status === "approved";

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center p-12 bg-white rounded-3xl shadow-xl space-y-8"
        >
          <div className="mx-auto w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center relative">
            <Clock className="h-12 w-12 animate-pulse" />
            <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-white border-4 border-amber-100 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Account Under Review</h2>
            <p className="text-slate-500 leading-relaxed max-w-md mx-auto">
              ⏳ Your vendor account is under review. We'll notify you via email once approved by our admin team. This usually takes 24-48 hours.
            </p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button className="w-full h-12 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" asChild>
              <a href="/">Back to Home</a>
            </Button>
            <Button variant="ghost" className="w-full h-12 text-slate-500 font-medium" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Welcome, Vendor {user?.full_name}!</h1>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3">Approved Vendor</Badge>
              <p className="text-muted-foreground text-sm">Manage your Slate shop and product listings.</p>
            </div>
          </div>
          <Button variant="outline" className="border-slate-200 h-11 px-6 font-semibold" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Products Listed", val: "0", icon: ShoppingBag, color: "bg-blue-500" },
            { label: "Total Sales", val: "$0.00", icon: LayoutDashboard, color: "bg-emerald-500" },
            { label: "Total Customers", val: "0", icon: Users, color: "bg-indigo-500" },
            { label: "Store Rating", val: "N/A", icon: Settings, color: "bg-amber-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-none shadow-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10 text-emerald-600`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="text-2xl font-bold">{stat.val}</div>
                <div className="text-slate-500 text-sm font-medium uppercase tracking-wider mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-none shadow-xl bg-white overflow-hidden">
          <div className="bg-emerald-600 h-2 w-full" />
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingBag className="h-6 w-6 text-emerald-600" />
              <span>Slate Vendor Portal</span>
            </CardTitle>
            <CardDescription>
              Your specialized shop dashboard is being set up.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4 border-t border-slate-50">
            <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
              <LayoutDashboard className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-900 font-semibold">Ready to list your products?</p>
              <p className="text-slate-500 text-sm max-w-xs">Our specialized vendor tools and shop management will be available in Module 4.</p>
            </div>
            <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => toast.info("Shop management coming soon!")}>
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
