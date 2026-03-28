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

  const statusTone = status.toLowerCase().includes("error") || status.toLowerCase().includes("fix") ? "status-error" : "status-ok";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Manual Order Entry</h2>
        <p className="page-subtitle mt-1">Submit and immediately review execution reports.</p>
      </div>

      <div className="toolbar">
        <div className="field min-w-[12rem]">
          <label className="field-label" htmlFor="clientOrderId">Client Order ID</label>
          <input
            id="clientOrderId"
            className="input-field"
            value={clientOrderId}
            onChange={(e) => setClientOrderId(e.target.value)}
            placeholder="Client Order ID"
          />
        </div>
        <div className="field min-w-[10rem]">
          <label className="field-label" htmlFor="instrument">Instrument</label>
          <select
            id="instrument"
            className="select-field"
            value={instrument}
            onChange={(e) => setInstrument(e.target.value as Instrument)}
          >
            <option>Rose</option>
            <option>Lavender</option>
            <option>Lotus</option>
            <option>Tulip</option>
            <option>Orchid</option>
          </select>
        </div>
        <div className="field min-w-[8rem]">
          <label className="field-label" htmlFor="side">Side</label>
          <select id="side" className="select-field" value={side} onChange={(e) => setSide(Number(e.target.value) as Side)}>
            <option value={1}>Buy</option>
            <option value={2}>Sell</option>
          </select>
        </div>
        <div className="field min-w-[8rem]">
          <label className="field-label" htmlFor="price">Price</label>
          <input
            id="price"
            className="input-field"
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div className="field min-w-[8rem]">
          <label className="field-label" htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            className="input-field"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
        <button className="btn-primary" onClick={onSubmit}>
          Submit
        </button>
      </div>

      {validationHints.length > 0 ? (
        <ul className="space-y-1 text-sm text-fintech-danger">
          {validationHints.map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ul>
      ) : null}

      <div className={statusTone}>{status}</div>

      {reports.length > 0 ? (
        <div className="table-shell">
          <table className="table">
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
        </div>
      ) : null}
    </div>
  );
}
