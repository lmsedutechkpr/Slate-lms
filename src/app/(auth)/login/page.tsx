import { LoginForm } from "@/components/auth/LoginForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginPage() {
  const leftContent = (
    <div>
      <h1 className="text-white font-bold text-5xl leading-tight tracking-tight">
        Welcome<br />
        <span className="text-gray-500">back to</span>
        <br />Slate.
      </h1>
      <p className="text-gray-400 text-base mt-6 max-w-xs leading-relaxed">
        Your courses, progress, and community are waiting for you.
      </p>
    </div>
  );

  return (
    <AuthLayout leftContent={leftContent}>
      <LoginForm />
    </AuthLayout>
  );
}
