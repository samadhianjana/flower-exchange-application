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
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-xl">Order Book</h2>
        <div className="field min-w-[10rem]">
          <label className="field-label" htmlFor="bookInstrument">Instrument</label>
          <select
            id="bookInstrument"
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
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h4 className="text-base">Bids</h4>
          <div className="table-shell">
            <table className="table">
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
        </div>
        <div className="space-y-2">
          <h4 className="text-base">Asks</h4>
          <div className="table-shell">
            <table className="table">
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
    </div>
  );
}
