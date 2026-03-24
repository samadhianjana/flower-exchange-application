import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";
import { websocketClient } from "../services/websocketClient";

export function ExecutionReportsPage() {
  const [reports, setReports] = useState<unknown[]>([]);
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [liveStatus, setLiveStatus] =
    useState<"connected" | "reconnecting" | "fallback_polling">("connected");

  useEffect(() => {
    apiClient.getReports().then(setReports);
    const conn = websocketClient.connect(
      () => {
        apiClient.getReports().then(setReports);
      },
      (status) => setLiveStatus(status)
    );
    return () => conn.close();
  }, []);

  const onDownload = async () => {
    const csv = await apiClient.downloadReportsCsv();
    setMessage(`CSV ready (${csv.length} bytes)`);
  };

  return (
    <div>
      <h2>Execution Reports</h2>
      <input
        placeholder="Filter by instrument/status/clientOrderId"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <button onClick={onDownload}>Download CSV</button>
      <div>Filter: {filter}</div>
      <div>Rows: {reports.length}</div>
      <div>Live status: {liveStatus}</div>
      <div>{message}</div>
    </div>
  );
}
