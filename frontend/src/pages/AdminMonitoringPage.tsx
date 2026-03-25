import React, { useEffect, useState } from "react";
import { apiClient, BatchSummary, execStatusLabel, ReportRow } from "../services/apiClient";
import { websocketClient } from "../services/websocketClient";

export function AdminMonitoringPage() {
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [rejects, setRejects] = useState<ReportRow[]>([]);

  const refresh = async () => {
    const [nextBatches, nextRejects] = await Promise.all([apiClient.getBatchSummaries(), apiClient.getRecentRejects(20)]);
    setBatches(nextBatches);
    setRejects(nextRejects);
  };

  useEffect(() => {
    refresh();
    const connection = websocketClient.connect((event) => {
      if (event.type === "batch_processed" || event.type === "report_update") {
        refresh();
      }
    });
    return () => connection.close();
  }, []);

  return (
    <div>
      <h2>Admin Monitoring</h2>
      <button onClick={refresh}>Refresh</button>

      <h3 style={{ marginTop: 12 }}>Recent Batch Summaries</h3>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Batch ID</th>
            <th>Total</th>
            <th>Accepted</th>
            <th>Rejected</th>
            <th>Processed At</th>
          </tr>
        </thead>
        <tbody>
          {batches.map((batch) => (
            <tr key={batch.batchId}>
              <td>{batch.batchId}</td>
              <td>{batch.total}</td>
              <td>{batch.accepted}</td>
              <td>{batch.rejected}</td>
              <td>{batch.processedAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 12 }}>Recent Rejects</h3>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Client Order ID</th>
            <th>Order ID</th>
            <th>Status</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {rejects.map((report, index) => (
            <tr key={`${report.orderId}-${index}`}>
              <td>{report.transactionTime}</td>
              <td>{report.clientOrderId}</td>
              <td>{report.orderId}</td>
              <td>{execStatusLabel(report.status)}</td>
              <td>{report.reason ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
