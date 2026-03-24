import React, { useMemo, useState } from "react";
import { AuthContext, UserRole } from "./auth/authContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminMonitoringPage } from "./pages/AdminMonitoringPage";

export default function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role] = useState<UserRole>("Trader");

  const value = useMemo(
    () => ({
      role,
      isAuthenticated,
      token: isAuthenticated ? "token" : "",
      login: async (_username: string, _password: string) => {
        setAuthenticated(true);
        return true;
      },
      logout: () => setAuthenticated(false)
    }),
    [isAuthenticated, role]
  );

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <AuthContext.Provider value={value}>
      <DashboardPage />
      {role === "Admin" ? <AdminMonitoringPage /> : null}
    </AuthContext.Provider>
  );
}
