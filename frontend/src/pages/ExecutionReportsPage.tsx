import React, { useEffect, useState } from "react";
import { apiClient, execStatusLabel, ExecStatus, Instrument, ReportRow } from "../services/apiClient";
import { websocketClient } from "../services/websocketClient";

export function ExecutionReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [clientOrderId, setClientOrderId] = useState("");
  const [instrument, setInstrument] = useState<Instrument | "">("");
  const [status, setStatus] = useState<ExecStatus | "">("");
  const [message, setMessage] = useState("");
  const [liveStatus, setLiveStatus] =
    useState<"connected" | "reconnecting" | "fallback_polling">("connected");

  const loadReports = async () => {
    const next = await apiClient.getReports({
      clientOrderId: clientOrderId || undefined,
      instrument: instrument || undefined,
      status: typeof status === "number" ? status : undefined
    });
    setReports(next);
  };

  useEffect(() => {
    loadReports();
    const conn = websocketClient.connect(
      (event) => {
        if (event.type === "report_update" || event.type === "batch_processed") {
          loadReports();
        }
      },
      (status) => setLiveStatus(status)
    );
    return () => conn.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientOrderId, instrument, status]);

  const onDownload = async () => {
    const csv = await apiClient.downloadReportsCsv(reports);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `execution-reports-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage(`CSV ready (${csv.length} bytes)`);
  };

  return (
    <div>
      <h2>Execution Reports</h2>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
        <input
          placeholder="Client Order ID"
          value={clientOrderId}
          onChange={(e) => setClientOrderId(e.target.value)}
        />
        <select value={instrument} onChange={(e) => setInstrument(e.target.value as Instrument | "") }>
          <option value="">All instruments</option>
          <option value="Rose">Rose</option>
          <option value="Lavender">Lavender</option>
          <option value="Lotus">Lotus</option>
          <option value="Tulip">Tulip</option>
          <option value="Orchid">Orchid</option>
        </select>
        <select
          value={typeof status === "number" ? String(status) : ""}
          onChange={(e) => setStatus(e.target.value === "" ? "" : (Number(e.target.value) as ExecStatus))}
        >
          <option value="">All statuses</option>
          <option value="0">New</option>
          <option value="1">Rejected</option>
          <option value="2">Fill</option>
          <option value="3">PFill</option>
        </select>
        <button onClick={onDownload}>Download CSV</button>
      </div>
      <div>Rows: {reports.length}</div>
      <div>Live status: {liveStatus}</div>
      <div>{message}</div>

      <table style={{ width: "100%", marginTop: 10, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Client Order ID</th>
            <th>Order ID</th>
            <th>Instrument</th>
            <th>Side</th>
            <th>Price</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((report, index) => (
            <tr key={`${report.orderId}-${report.transactionTime}-${index}`}>
              <td>{report.transactionTime}</td>
              <td>{report.clientOrderId}</td>
              <td>{report.orderId}</td>
              <td>{report.instrument}</td>
              <td>{report.side === 1 ? "Buy" : "Sell"}</td>
              <td>{report.price}</td>
              <td>{report.quantity}</td>
              <td>{execStatusLabel(report.status)}</td>
              <td>{report.reason ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
