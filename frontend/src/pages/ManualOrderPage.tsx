import React, { useState } from "react";
import { apiClient, Instrument, OrderInput, Side } from "../services/apiClient";

type QueuedOrder = OrderInput & { id: number };

export function ManualOrderPage() {
  const [clientOrderId, setClientOrderId] = useState("");
  const [instrument, setInstrument] = useState<Instrument | "">("");
  const [side, setSide] = useState<Side | "">("");
  const [price, setPrice] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [status, setStatus] = useState("");
  const [queuedOrders, setQueuedOrders] = useState<QueuedOrder[]>([]);
  const [validationHints, setValidationHints] = useState<string[]>([]);

  const getValidationHints = (): string[] => {
    const hints: string[] = [];
    if (!/^[a-zA-Z0-9]{1,7}$/.test(clientOrderId)) {
      hints.push("Client Order ID must be alphanumeric, max 7 chars.");
    }
    if (!instrument) {
      hints.push("Instrument is required.");
    }
    if (side !== 1 && side !== 2) {
      hints.push("Side is required.");
    }

    const parsedPrice = Number(price);
    const parsedQty = Number(quantity);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      hints.push("Price must be greater than 0.");
    }
    if (!Number.isFinite(parsedQty) || parsedQty < 10 || parsedQty > 1000 || parsedQty % 10 !== 0) {
      hints.push("Quantity must be 10..1000 and a multiple of 10.");
    }
    return hints;
  };

  const resetForm = () => {
    setClientOrderId("");
    setInstrument("");
    setSide("");
    setPrice("");
    setQuantity("");
  };

  const onAddOrder = () => {
    const hints = getValidationHints();
    if (hints.length > 0) {
      setValidationHints(hints);
      setStatus("Fix validation errors before adding.");
      return;
    }

    const nextOrder: QueuedOrder = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      clientOrderId,
      instrument: instrument as Instrument,
      side: side as Side,
      price: Number(price),
      quantity: Number(quantity)
    };
    setQueuedOrders((prev) => [...prev, nextOrder]);
    setValidationHints([]);
    resetForm();
    setStatus("Order queued. Add more orders or click Process.");
  };

  const onRemoveQueuedOrder = (id: number) => {
    setQueuedOrders((prev) => prev.filter((order) => order.id !== id));
  };

  const onProcess = async () => {
    if (queuedOrders.length === 0) {
      setStatus("Add at least one order before processing.");
      return;
    }

    const payload: OrderInput[] = queuedOrders.map(({ id: _id, ...order }) => order);
    const response = await apiClient.processManualOrders(payload);
    setQueuedOrders([]);
    setStatus(`${response.message}. Execution reports updated in the Execution Report tab.`);
  };

  const statusTone =
    status.toLowerCase().includes("error") ||
    status.toLowerCase().includes("fix") ||
    status.toLowerCase().includes("no manual orders")
      ? "status-error"
      : "status-ok";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl">Manual Order Entry</h2>
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
            <option value="">Select instrument</option>
            <option>Rose</option>
            <option>Lavender</option>
            <option>Lotus</option>
            <option>Tulip</option>
            <option>Orchid</option>
          </select>
        </div>
        <div className="field min-w-[8rem]">
          <label className="field-label" htmlFor="side">Side</label>
          <select
            id="side"
            className="select-field"
            value={side}
            onChange={(e) => setSide(e.target.value === "" ? "" : (Number(e.target.value) as Side))}
          >
            <option value="">Select side</option>
            <option value={1}>1 (Buy)</option>
            <option value={2}>2 (Sell)</option>
          </select>
        </div>
        <div className="field min-w-[8rem]">
          <label className="field-label" htmlFor="price">Price</label>
          <input
            id="price"
            className="input-field"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Price"
          />
        </div>
        <div className="field min-w-[8rem]">
          <label className="field-label" htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            className="input-field"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Quantity"
          />
        </div>
        <button className="btn-primary" onClick={onAddOrder}>
          Add Order
        </button>
        <button className="btn-secondary" onClick={onProcess} disabled={queuedOrders.length === 0}>
          Process
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

      {queuedOrders.length > 0 ? (
        <div className="table-shell">
          <table className="table">
            <thead>
              <tr>
                <th>Client Order ID</th>
                <th>Instrument</th>
                <th>Side</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {queuedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.clientOrderId}</td>
                  <td>{order.instrument}</td>
                  <td>{order.side}</td>
                  <td>{order.price}</td>
                  <td>{order.quantity}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => onRemoveQueuedOrder(order.id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="helper-text">No queued orders yet.</div>
      )}

    </div>
  );
}
