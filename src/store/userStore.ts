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

  setAuth: (token: string, refreshToken: string, user: User | null, permissions: string[]) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      permissions: [],

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

      // ------------------------------
      // Logout
      // ------------------------------
      logout: () =>
        set({
          token: null,
          refreshToken: null,
          user: null,
          permissions: [],
        }),
    }),
    {
      name: "bbmedx-auth", // LocalStorage Key
    }
  )
);
