import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type AuthState = {
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
};

/**
 * Client-only auth display state. Access tokens live in localStorage (`finwy_access_token`)
 * via `setStoredAccessToken` in `api-client.ts` — align with your backend’s login response.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
