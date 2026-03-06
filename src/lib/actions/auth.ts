"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SignupValues } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export async function adminSignup(values: SignupValues) {
  const supabase = createAdminClient();
  
  // Create user via admin client to bypass rate limits
  const { data, error } = await supabase.auth.admin.createUser({
    email: values.email.trim().toLowerCase(),
    password: values.password,
    email_confirm: true, // Auto-confirm to bypass email rate limits
    user_metadata: {
      full_name: values.full_name,
      role: values.role,
    },
  });

  if (error) {
    console.error("Admin Signup Error:", error);
    return { error: error.message };
  }

  return { success: true, user: data.user };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
