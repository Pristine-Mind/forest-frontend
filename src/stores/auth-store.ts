import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/lib/api";

interface AuthState {
  token: string | null;
  user: User | null;
  userId: number | null;
  userRole: User["role"] | null;
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
      userId: null,
      userRole: null,
      setAuth: (token, user) => set({ 
        token, 
        user,
        userId: user.id,
        userRole: user.role,
      }),
      clearAuth: () => set({ 
        token: null, 
        user: null,
        userId: null,
        userRole: null,
      }),
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

// Roles that can approve/authorize operations
export const APPROVAL_ROLES: Array<UserRole> = [
  "committee_chair",
];

// Roles that can write/modify data
export const WRITE_ROLES: Array<UserRole> = [
  "committee_chair",
  "admin",
  "staff",
  "secretary",
];

// All available roles in the system
export const ALL_ROLES: Array<UserRole> = [
  "committee_chair",
  "member",
  "sub_committee_member",
  "dfo_viewer",
  "admin",
  "staff",
  "secretary",
];

// Bank Transaction Permissions
// Full access: committee chair and admin (can create, update, delete)
export const BANK_TRANSACTION_FULL_ACCESS_ROLES: Array<UserRole> = [
  "committee_chair",
  "admin",
  "staff",
  "secretary",
];

// Write access: can create and update but NOT delete
export const BANK_TRANSACTION_WRITE_ROLES: Array<UserRole> = [
  "committee_chair",
  "admin",
  "staff",
  "secretary",
];

// Delete access: only committee chair and admin
export const BANK_TRANSACTION_DELETE_ROLES: Array<UserRole> = [
  "committee_chair",
  "admin",
];
