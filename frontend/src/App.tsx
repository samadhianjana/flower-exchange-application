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

  const getNavButtonClass = (targetView: View) =>
    view === targetView ? "btn-secondary btn-nav-active" : "btn-secondary";

  return (
    <AuthContext.Provider value={value}>
      {!isAuthenticated ? (
        <LoginPage />
      ) : (
        <div className="app-shell space-y-4">
          <div className="panel">
            <div className="panel-body flex flex-wrap items-center justify-between gap-3">
              <h1 className="page-title">Flower Exchange Platform</h1>
              <div className="flex items-center gap-3">
                <span className="text-fintech-muted">
                {username} ({role})
              </span>
                <button className="btn-secondary" onClick={value.logout}>
                  Logout
                </button>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-body flex flex-wrap gap-2">
              <button className={getNavButtonClass("dashboard")} onClick={() => setView("dashboard")}>Dashboard</button>
              <button className={getNavButtonClass("manual")} onClick={() => setView("manual")}>Manual Order</button>
              <button className={getNavButtonClass("batch")} onClick={() => setView("batch")}>Batch Upload</button>
              <button className={getNavButtonClass("reports")} onClick={() => setView("reports")}>Execution Report</button>
              <button className={getNavButtonClass("book")} onClick={() => setView("book")}>Order Book</button>
              {role === "Admin" ? (
                <button className={getNavButtonClass("admin")} onClick={() => setView("admin")}>Admin</button>
              ) : null}
            </div>
          </div>

          <div className="panel">
            <div className="panel-body">{renderContent()}</div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
