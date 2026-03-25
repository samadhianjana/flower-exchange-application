import React, { useEffect, useState } from "react";
import { apiClient, Instrument, OrderBookSnapshot } from "../services/apiClient";
import { websocketClient } from "../services/websocketClient";

export function OrderBookPage() {
  const [instrument, setInstrument] = useState<Instrument>("Rose");
  const [book, setBook] = useState<OrderBookSnapshot>({ instrument: "Rose", bids: [], asks: [] });

  const loadBook = async (target: Instrument) => {
    const snapshot = await apiClient.getOrderBook(target);
    setBook(snapshot);
  };

  useEffect(() => {
    loadBook(instrument);
  }, [instrument]);

  useEffect(() => {
    const connection = websocketClient.connect((event) => {
      if (event.type === "orderbook_update") {
        const payload = event.payload as { instrument: Instrument };
        if (payload.instrument === instrument) {
          loadBook(instrument);
        }
      }
    });
    return () => connection.close();
  }, [instrument]);

  return (
    <div>
      <h2>Order Book</h2>
      <select value={instrument} onChange={(e) => setInstrument(e.target.value as Instrument)}>
        <option>Rose</option>
        <option>Lavender</option>
        <option>Lotus</option>
        <option>Tulip</option>
        <option>Orchid</option>
      </select>
      <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
        <div style={{ flex: 1 }}>
          <h4>Bids</h4>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Price</th>
                <th>Total Qty</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {book.bids.map((level) => (
                <tr key={`bid-${level.price}`}>
                  <td>{level.price}</td>
                  <td>{level.totalQty}</td>
                  <td>{level.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: 1 }}>
          <h4>Asks</h4>
          <table style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Price</th>
                <th>Total Qty</th>
                <th>Orders</th>
              </tr>
            </thead>
            <tbody>
              {book.asks.map((level) => (
                <tr key={`ask-${level.price}`}>
                  <td>{level.price}</td>
                  <td>{level.totalQty}</td>
                  <td>{level.orderCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
