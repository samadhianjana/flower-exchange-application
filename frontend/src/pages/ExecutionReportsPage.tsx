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

  const getStatusClass = (statusCode: ExecStatus) => {
    if (statusCode === 0) return "status-badge status-new";
    if (statusCode === 1) return "status-badge status-rejected";
    if (statusCode === 2) return "status-badge status-fill";
    return "status-badge status-pfill";
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Execution Reports</h2>
      </div>
      <div className="toolbar">
        <input
          className="input-field"
          placeholder="Client Order ID"
          value={clientOrderId}
          onChange={(e) => setClientOrderId(e.target.value)}
        />
        <select className="select-field" value={instrument} onChange={(e) => setInstrument(e.target.value as Instrument | "") }>
          <option value="">All instruments</option>
          <option value="Rose">Rose</option>
          <option value="Lavender">Lavender</option>
          <option value="Lotus">Lotus</option>
          <option value="Tulip">Tulip</option>
          <option value="Orchid">Orchid</option>
        </select>
        <select
          className="select-field"
          value={typeof status === "number" ? String(status) : ""}
          onChange={(e) => setStatus(e.target.value === "" ? "" : (Number(e.target.value) as ExecStatus))}
        >
          <option value="">All statuses</option>
          <option value="0">New</option>
          <option value="1">Rejected</option>
          <option value="2">Fill</option>
          <option value="3">PFill</option>
        </select>
        <button className="btn-primary" onClick={onDownload}>Download CSV</button>
      </div>
      <div className="flex flex-wrap gap-4 text-fintech-muted">
        <div>Rows: {reports.length}</div>
        <div>Live status: {liveStatus}</div>
        <div>{message}</div>
      </div>

      <div className="table-shell">
        <table className="table">
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
                <td><span className={getStatusClass(report.status)}>{execStatusLabel(report.status)}</span></td>
                <td>{report.reason ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
