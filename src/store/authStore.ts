import { create } from 'zustand';
import { AuthState, Profile, UserRole } from '@/types';

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  clearUser: () => set({ user: null, isLoading: false }),
  getRedirectPath: () => {
    const { user } = get();
    if (!user) return '/login';
    if (!user.is_onboarded && user.role !== 'admin') return '/onboarding';

    const roleToPath: Record<UserRole, string> = {
      student: '/dashboard',
      instructor: '/instructor/dashboard',
      vendor: '/vendor/dashboard',
      admin: '/admin/dashboard',
    };

    return roleToPath[user.role] || '/dashboard';
  },
}));
