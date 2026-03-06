import { SignupForm } from "@/components/auth/SignupForm";
import AuthLayout from "@/components/auth/AuthLayout";
import { GraduationCap, BookOpen, ShoppingBag } from "lucide-react";

export default function SignupPage() {
  const leftContent = (
    <div>
      <h1 className="text-white font-bold text-5xl leading-tight tracking-tight">
        Start your<br />
        <span className="text-gray-500">Journey</span>
        <br />Today..
      </h1>
      
      {/* Three feature rows */}
      <div className="mt-10 space-y-3">
        {[
          {
            icon: GraduationCap,
            title: "Learn",
            desc: "Access 500+ courses",
          },
          {
            icon: BookOpen,
            title: "Teach",
            desc: "Share your expertise",
          },
          {
            icon: ShoppingBag,
            title: "Sell",
            desc: "Reach learners worldwide",
          },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <item.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">{item.title}</p>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <SignupForm />
    </AuthLayout>
  );
}
