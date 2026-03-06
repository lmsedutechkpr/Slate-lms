"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types";

// Single client instance — never recreated
const supabase = createClient();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading, clearUser } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
          if (session?.user) {
            const { data: profile, error } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
              
              if (profile) {
                setUser(profile as Profile);
              } else {
                // No profile yet — session is still valid, don't clear it.
                // Onboarding will create the profile via upsert.
                setLoading(false);
              }
        } else {
          clearUser();
        }
      } catch (error) {
        console.error("Auth init error:", error);
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
            
          if (profile) {
            setUser(profile as Profile);
          } else {
            // Profile row may not exist yet (DB trigger delay after signup).
            // Retry once after a short wait rather than clearing the session.
            await new Promise(res => setTimeout(res, 1500));
            const { data: retryProfile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();
            if (retryProfile) {
              setUser(retryProfile as Profile);
            }
            // If still no profile, leave user as null but keep session alive.
            // The onboarding page will handle profile creation via upsert.
          }
        } else {
          clearUser();
        }
      });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading, clearUser]);

  return <>{children}</>;
}
