import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Fetch profile to determine redirect path
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (!profile.is_onboarded && profile.role !== "admin") {
            return NextResponse.redirect(`${origin}/onboarding`);
          }

          const roleToPath: Record<string, string> = {
            student: "/dashboard",
            instructor: "/instructor/dashboard",
            vendor: "/vendor/dashboard",
            admin: "/admin/dashboard",
          };

          return NextResponse.redirect(`${origin}${roleToPath[profile.role] || "/dashboard"}`);
        }
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth-code-exchange-failed`);
}
