import React, { useMemo, useState } from "react";
import { AuthContext, UserRole } from "./auth/authContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminMonitoringPage } from "./pages/AdminMonitoringPage";
import { BatchUploadPage } from "./pages/BatchUploadPage";
import { ExecutionReportsPage } from "./pages/ExecutionReportsPage";
import { ManualOrderPage } from "./pages/ManualOrderPage";
import { OrderBookPage } from "./pages/OrderBookPage";
import { apiClient } from "./services/apiClient";

type View = "dashboard" | "manual" | "batch" | "reports" | "book" | "admin";

export default function App() {
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [role, setRole] = useState<UserRole>("Trader");
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("");
  const [view, setView] = useState<View>("dashboard");

  const value = useMemo(
    () => ({
      role,
      username,
      isAuthenticated,
      token,
      login: async (inputUsername: string, password: string) => {
        const response = await apiClient.login(inputUsername, password);
        if (!response.ok) {
          return { ok: false, message: response.message };
        }

        setAuthenticated(true);
        setRole(response.role);
        setToken(response.token);
        setUsername(inputUsername);
        setView("dashboard");
        return { ok: true };
      },
      logout: () => {
        setAuthenticated(false);
        setRole("Trader");
        setToken("");
        setUsername("");
        setView("dashboard");
      }
    }),
    [isAuthenticated, role, token, username]
  );

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <DashboardPage role={role} onNavigate={(next) => setView(next)} />;
      case "manual":
        return <ManualOrderPage />;
      case "batch":
        return <BatchUploadPage />;
      case "reports":
        return <ExecutionReportsPage />;
      case "book":
        return <OrderBookPage />;
      case "admin":
        return role === "Admin" ? <AdminMonitoringPage /> : <div>Access denied.</div>;
      default:
        return <DashboardPage role={role} onNavigate={(next) => setView(next)} />;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <div style={{ padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h1 style={{ margin: 0 }}>Flower Exchange Platform</h1>
            <div>
              <span style={{ marginRight: 12 }}>
                {username} ({role})
              </span>
              <button onClick={value.logout}>Logout</button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <button onClick={() => setView("dashboard")}>Dashboard</button>
            <button onClick={() => setView("manual")}>Manual Order</button>
            <button onClick={() => setView("batch")}>Batch Upload</button>
            <button onClick={() => setView("reports")}>Execution Reports</button>
            <button onClick={() => setView("book")}>Order Book</button>
            {role === "Admin" ? <button onClick={() => setView("admin")}>Admin</button> : null}
          </div>

          {renderContent()}
        </div>
      )}
    </AuthContext.Provider>
  );
}
