import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: number;
  username: string;
  name: string;
  email: string;
  role?: 'USER' | 'ADMIN';
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (accessToken: string, refreshToken: string | null, user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setAuth: (accessToken, refreshToken, user) =>
        set({ accessToken, refreshToken, user, isAuthenticated: true }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () =>
        set({ accessToken: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
