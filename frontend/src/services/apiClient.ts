type OrderInput = {
  clientOrderId: string;
  instrument: string;
  side: 1 | 2;
  price: number;
  quantity: number;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const apiClient = {
  login: async (username: string, password: string) => {
    await delay(100);
    if (!password) return { ok: false, message: "Password is required" };
    return {
      ok: true,
      token: `token_${username}`,
      role: (username === "admin" ? "Admin" : "Trader") as "Admin" | "Trader"
    };
  },

  submitOrder: async (payload: OrderInput) => {
    await delay(120);
    if (!payload.clientOrderId || payload.price <= 0 || payload.quantity < 10 || payload.quantity % 10 !== 0) {
      return { ok: false, message: "Validation failed for order payload" };
    }
    return { ok: true, message: "Order accepted" };
  },

  submitBatch: async (_file: File) => {
    await delay(180);
    return { ok: true, message: "Batch processed", total: 10, accepted: 8, rejected: 2 };
  },

  getReports: async () => {
    await delay(100);
    return [];
  },

  downloadReportsCsv: async () => {
    await delay(100);
    return "ClientOrderID,OrderID,Instrument,Side,Price,Quantity,Status,Reason,TransactionTime\n";
  },

  getOrderBook: async (_instrument: string) => {
    await delay(100);
    return { bids: [], asks: [] };
  }
};