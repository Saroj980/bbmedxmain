import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface UserState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  permissions: string[];
  hydrated: boolean;

  setAuth: (token: string, refreshToken: string, user: User | null, permissions: string[]) => void;
  setUser: (user: User | null) => void;
  logout: () => void;
  setHydrated: (val: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      permissions: [],
      hydrated: false,

      // ------------------------------
      // Save Auth Data
      // ------------------------------
      setAuth: (token, refreshToken, user, permissions) =>
        set({
          token,
          refreshToken,
          user,
          permissions,
        }),
      setUser: (user) => set({ user }),

      // ------------------------------
      // Logout
      // ------------------------------
      logout: () => {
        // Clear cookies
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        document.cookie = "role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

        set({
          token: null,
          refreshToken: null,
          user: null,
          permissions: [],
        });
      },

      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "bbmedx-auth", // LocalStorage Key
      onRehydrateStorage: (state) => {
        return () => state.setHydrated(true);
      },
    }
  )
);
