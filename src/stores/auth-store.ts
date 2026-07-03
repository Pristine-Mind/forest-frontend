import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  can: (roles: Array<User["role"]>) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
      isAuthenticated: () => !!get().token,
      can: (roles) => {
        const user = get().user;
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: "forest-auth",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export type UserRole = User["role"];

export const WRITE_ROLES: Array<UserRole> = [
  "committee_officer",
  "admin",
];

export const ALL_ROLES: Array<UserRole> = [
  "committee_officer",
  "member",
  "sub_committee_member",
  "dfo_viewer",
  "admin",
];
