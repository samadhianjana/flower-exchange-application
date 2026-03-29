import { createContext } from "react";

export type UserRole = "Trader" | "Admin";

export type AuthLoginResult = {
  ok: boolean;
  message?: string;
};

export type AuthContextValue = {
  role: UserRole;
  username: string;
  isAuthenticated: boolean;
  token: string;
  login: (username: string, password: string) => Promise<AuthLoginResult>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue>({
  role: "Trader" as UserRole,
  username: "",
  isAuthenticated: false,
  token: "",
  login: async (_username: string, _password: string) => ({ ok: false }),
  logout: () => {}
});