import React, { useState } from "react";
import { apiClient, execStatusLabel, Instrument, ReportRow, Side } from "../services/apiClient";

export function ManualOrderPage() {
  const [clientOrderId, setClientOrderId] = useState("");
  const [instrument, setInstrument] = useState<Instrument>("Rose");
  const [side, setSide] = useState<1 | 2>(1);
  const [price, setPrice] = useState(45);
  const [quantity, setQuantity] = useState(100);
  const [status, setStatus] = useState("");
  const [reports, setReports] = useState<ReportRow[]>([]);

  const validationHints: string[] = [];
  if (!/^[a-zA-Z0-9]{1,7}$/.test(clientOrderId)) {
    validationHints.push("Client Order ID must be alphanumeric, max 7 chars.");
  }
  if (price <= 0) {
    validationHints.push("Price must be greater than 0.");
  }
  if (quantity < 10 || quantity > 1000 || quantity % 10 !== 0) {
    validationHints.push("Quantity must be 10..1000 and a multiple of 10.");
  }

  const onSubmit = async () => {
    if (validationHints.length > 0) {
      setStatus("Fix validation errors before submitting.");
      return;
    }
    const response = await apiClient.submitOrder({ clientOrderId, instrument, side, price, quantity });
    setStatus(response.message);
    setReports(response.reports);
  };

  return (
    <div>
      <h2>Manual Order Entry</h2>
      <input
        value={clientOrderId}
        onChange={(e) => setClientOrderId(e.target.value)}
        placeholder="Client Order ID"
        style={{ marginRight: 8 }}
      />
      <select value={instrument} onChange={(e) => setInstrument(e.target.value as Instrument)}>
        <option>Rose</option>
        <option>Lavender</option>
        <option>Lotus</option>
        <option>Tulip</option>
        <option>Orchid</option>
      </select>
      <select value={side} onChange={(e) => setSide(Number(e.target.value) as Side)} style={{ marginLeft: 8 }}>
        <option value={1}>Buy</option>
        <option value={2}>Sell</option>
      </select>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} style={{ marginLeft: 8 }} />
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
        style={{ marginLeft: 8 }}
      />
      <button onClick={onSubmit} style={{ marginLeft: 8 }}>
        Submit
      </button>

      {validationHints.length > 0 ? (
        <ul style={{ color: "crimson" }}>
          {validationHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : null}

      <div style={{ marginTop: 8 }}>{status}</div>

      {reports.length > 0 ? (
        <table style={{ marginTop: 12, borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th>Client Order ID</th>
              <th>Order ID</th>
              <th>Status</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, index) => (
              <tr key={`${report.orderId}-${index}`}>
                <td>{report.clientOrderId}</td>
                <td>{report.orderId}</td>
                <td>{execStatusLabel(report.status)}</td>
                <td>{report.quantity}</td>
                <td>{report.price}</td>
                <td>{report.reason ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
