import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  /** App username (`users.username`), if set. */
  username: string | null;
  /** Public referral id (`users.userId`, e.g. FWY…). */
  publicUserId: string | null;
  role: string;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
};

/**
 * Client-only auth display state. Short-lived access JWT is kept in sessionStorage; refresh JWT
 * is stored in an httpOnly cookie via `POST /api/auth/session` (`establishBrowserSession`).
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
