import { createContext } from "react";

export type UserRole = "Trader" | "Admin";

export const AuthContext = createContext({
  role: "Trader" as UserRole,
  isAuthenticated: false,
  token: "",
  login: async (_username: string, _password: string) => false,
  logout: () => {}
});