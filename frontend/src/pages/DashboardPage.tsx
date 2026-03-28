import React, { useEffect, useState } from "react";
import { UserRole } from "../auth/authContext";
import { apiClient } from "../services/apiClient";

type DashboardPageProps = {
  role: UserRole;
  onNavigate: (view: "manual" | "batch" | "reports" | "book" | "admin") => void;
};

export function DashboardPage({ role, onNavigate }: DashboardPageProps) {
  const [metrics, setMetrics] = useState({ totalReports: 0, fills: 0, partials: 0, rejected: 0, batches: 0 });

  useEffect(() => {
    apiClient.getDashboardMetrics().then(setMetrics);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Dashboard</h2>
        <p className="page-subtitle mt-1">Signed in as {role}</p>
      </div>

      <div className="chip-grid">
        <div className="metric-chip">
          <div className="metric-label">Total reports</div>
          <div className="metric-value">{metrics.totalReports}</div>
        </div>
        <div className="metric-chip">
          <div className="metric-label">Fills</div>
          <div className="metric-value">{metrics.fills}</div>
        </div>
        <div className="metric-chip">
          <div className="metric-label">Partial fills</div>
          <div className="metric-value">{metrics.partials}</div>
        </div>
        <div className="metric-chip">
          <div className="metric-label">Rejected</div>
          <div className="metric-value">{metrics.rejected}</div>
        </div>
        <div className="metric-chip">
          <div className="metric-label">Batches</div>
          <div className="metric-value">{metrics.batches}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={() => onNavigate("manual")}>Manual Order Entry</button>
        <button className="btn-secondary" onClick={() => onNavigate("batch")}>CSV Batch Upload</button>
        <button className="btn-secondary" onClick={() => onNavigate("reports")}>Execution Reports</button>
        <button className="btn-secondary" onClick={() => onNavigate("book")}>Order Book</button>
        {role === "Admin" ? (
          <button className="btn-secondary" onClick={() => onNavigate("admin")}>Admin Monitoring</button>
        ) : null}
      </div>
    </div>
  );
}
