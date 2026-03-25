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
    <div>
      <h2>Dashboard</h2>
      <p>Signed in as {role}</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <div>Total reports: {metrics.totalReports}</div>
        <div>Fills: {metrics.fills}</div>
        <div>Partial fills: {metrics.partials}</div>
        <div>Rejected: {metrics.rejected}</div>
        <div>Batches: {metrics.batches}</div>
      </div>
      <ul>
        <li>
          <button onClick={() => onNavigate("manual")}>Manual Order Entry</button>
        </li>
        <li>
          <button onClick={() => onNavigate("batch")}>CSV Batch Upload</button>
        </li>
        <li>
          <button onClick={() => onNavigate("reports")}>Execution Reports</button>
        </li>
        <li>
          <button onClick={() => onNavigate("book")}>Order Book</button>
        </li>
        {role === "Admin" ? (
          <li>
            <button onClick={() => onNavigate("admin")}>Admin Monitoring</button>
          </li>
        ) : null}
      </ul>
    </div>
  );
}
