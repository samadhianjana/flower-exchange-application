import React, { useState } from "react";
import { apiClient } from "../services/apiClient";

export function ManualOrderPage() {
  const [clientOrderId, setClientOrderId] = useState("");
  const [instrument, setInstrument] = useState("Rose");
  const [side, setSide] = useState<1 | 2>(1);
  const [price, setPrice] = useState(45);
  const [quantity, setQuantity] = useState(100);
  const [status, setStatus] = useState("");

  const onSubmit = async () => {
    const response = await apiClient.submitOrder({ clientOrderId, instrument, side, price, quantity });
    setStatus(response.message);
  };

  return (
    <div>
      <h2>Manual Order Entry</h2>
      <input value={clientOrderId} onChange={(e) => setClientOrderId(e.target.value)} placeholder="Client Order ID" />
      <select value={instrument} onChange={(e) => setInstrument(e.target.value)}>
        <option>Rose</option>
        <option>Lavender</option>
        <option>Lotus</option>
        <option>Tulip</option>
        <option>Orchid</option>
      </select>
      <select value={side} onChange={(e) => setSide(Number(e.target.value) as 1 | 2)}>
        <option value={1}>Buy</option>
        <option value={2}>Sell</option>
      </select>
      <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
      <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
      <button onClick={onSubmit}>Submit</button>
      <div>{status}</div>
    </div>
  );
}
