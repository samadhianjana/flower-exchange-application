import React, { useEffect, useState } from "react";
import { apiClient } from "../services/apiClient";

export function OrderBookPage() {
  const [instrument, setInstrument] = useState("Rose");
  const [book, setBook] = useState<{ bids: unknown[]; asks: unknown[] }>({ bids: [], asks: [] });

  useEffect(() => {
    apiClient.getOrderBook(instrument).then(setBook);
  }, [instrument]);

  return (
    <div>
      <h2>Order Book</h2>
      <select value={instrument} onChange={(e) => setInstrument(e.target.value)}>
        <option>Rose</option>
        <option>Lavender</option>
        <option>Lotus</option>
        <option>Tulip</option>
        <option>Orchid</option>
      </select>
      <div>Bids: {book.bids.length}</div>
      <div>Asks: {book.asks.length}</div>
    </div>
  );
}
