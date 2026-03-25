export type Instrument = "Rose" | "Lavender" | "Lotus" | "Tulip" | "Orchid";
export type Side = 1 | 2;
export type ExecStatus = 0 | 1 | 2 | 3;

export type OrderInput = {
  clientOrderId: string;
  instrument: Instrument;
  side: Side;
  price: number;
  quantity: number;
};

type RestingOrder = {
  orderId: string;
  clientOrderId: string;
  instrument: Instrument;
  side: Side;
  price: number;
  remainingQty: number;
  sequenceNo: number;
};

export type ReportRow = {
  clientOrderId: string;
  orderId: string;
  instrument: Instrument;
  side: Side;
  price: number;
  quantity: number;
  status: ExecStatus;
  reason?: string;
  transactionTime: string;
  batchId?: string;
};

export type BatchRowError = {
  lineNumber: number;
  reason: string;
  row: string;
};

export type BatchSummary = {
  batchId: string;
  total: number;
  accepted: number;
  rejected: number;
  processedAt: string;
};

export type OrderBookLevel = {
  price: number;
  totalQty: number;
  orderCount: number;
};

export type OrderBookSnapshot = {
  instrument: Instrument;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
};

export type ReportFilters = {
  instrument?: Instrument;
  status?: ExecStatus;
  clientOrderId?: string;
};

type LiveEvent =
  | { type: "report_update"; payload: ReportRow[] }
  | { type: "orderbook_update"; payload: { instrument: Instrument } }
  | { type: "batch_processed"; payload: BatchSummary }
  | { type: "heartbeat"; payload: { at: number } };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const instruments: Instrument[] = ["Rose", "Lavender", "Lotus", "Tulip", "Orchid"];

const statusLabel = (status: ExecStatus): string => {
  switch (status) {
    case 0:
      return "New";
    case 1:
      return "Rejected";
    case 2:
      return "Fill";
    case 3:
      return "PFill";
    default:
      return "Unknown";
  }
};

const timestampNow = (): string => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  const mss = String(d.getMilliseconds()).padStart(3, "0");
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}.${mss}`;
};

const state: {
  nextOrderId: number;
  nextSequenceNo: number;
  reports: ReportRow[];
  batches: BatchSummary[];
  books: Record<Instrument, { bids: RestingOrder[]; asks: RestingOrder[] }>;
  listeners: Set<(event: LiveEvent) => void>;
} = {
  nextOrderId: 1,
  nextSequenceNo: 1,
  reports: [],
  batches: [],
  books: {
    Rose: { bids: [], asks: [] },
    Lavender: { bids: [], asks: [] },
    Lotus: { bids: [], asks: [] },
    Tulip: { bids: [], asks: [] },
    Orchid: { bids: [], asks: [] }
  },
  listeners: new Set()
};

const emit = (event: LiveEvent) => {
  state.listeners.forEach((listener) => listener(event));
};

const validateOrder = (payload: OrderInput): string | undefined => {
  if (!payload.clientOrderId || payload.clientOrderId.trim().length === 0) return "Missing required field";
  if (!/^[a-zA-Z0-9]{1,7}$/.test(payload.clientOrderId)) return "Invalid client order id";
  if (!instruments.includes(payload.instrument)) return "Invalid instrument";
  if (payload.side !== 1 && payload.side !== 2) return "Invalid side";
  if (payload.price <= 0) return "Invalid price";
  if (payload.quantity % 10 !== 0) return "Invalid quantity increment";
  if (payload.quantity < 10 || payload.quantity > 1000) return "Quantity out of range";
  return undefined;
};

const makeReport = (
  order: {
    clientOrderId: string;
    orderId: string;
    instrument: Instrument;
    side: Side;
    price: number;
  },
  quantity: number,
  status: ExecStatus,
  reason?: string,
  batchId?: string
): ReportRow => ({
  clientOrderId: order.clientOrderId,
  orderId: order.orderId,
  instrument: order.instrument,
  side: order.side,
  price: order.price,
  quantity,
  status,
  reason,
  transactionTime: timestampNow(),
  batchId
});

const sortBids = (orders: RestingOrder[]) => {
  orders.sort((a, b) => {
    if (b.price !== a.price) return b.price - a.price;
    return a.sequenceNo - b.sequenceNo;
  });
};

const sortAsks = (orders: RestingOrder[]) => {
  orders.sort((a, b) => {
    if (a.price !== b.price) return a.price - b.price;
    return a.sequenceNo - b.sequenceNo;
  });
};

const processOrder = (payload: OrderInput, batchId?: string): ReportRow[] => {
  const reportsForOrder: ReportRow[] = [];
  const rejectReason = validateOrder(payload);

  const orderId = `O-${state.nextOrderId++}`;
  if (rejectReason) {
    const reject = makeReport(
      {
        clientOrderId: payload.clientOrderId,
        orderId,
        instrument: payload.instrument,
        side: payload.side,
        price: payload.price
      },
      payload.quantity,
      1,
      rejectReason,
      batchId
    );
    reportsForOrder.push(reject);
    state.reports.push(reject);
    return reportsForOrder;
  }

  const incoming: RestingOrder = {
    orderId,
    clientOrderId: payload.clientOrderId,
    instrument: payload.instrument,
    side: payload.side,
    price: payload.price,
    remainingQty: payload.quantity,
    sequenceNo: state.nextSequenceNo++
  };

  const book = state.books[incoming.instrument];
  const opposite = incoming.side === 1 ? book.asks : book.bids;
  let matchedAny = false;

  while (incoming.remainingQty > 0 && opposite.length > 0) {
    const resting = opposite[0];
    const crossable = incoming.side === 1 ? resting.price <= incoming.price : resting.price >= incoming.price;
    if (!crossable) {
      break;
    }

    matchedAny = true;
    const tradeQty = Math.min(incoming.remainingQty, resting.remainingQty);
    incoming.remainingQty -= tradeQty;
    resting.remainingQty -= tradeQty;

    const incomingStatus: ExecStatus = incoming.remainingQty === 0 ? 2 : 3;
    const restingStatus: ExecStatus = resting.remainingQty === 0 ? 2 : 3;

    const incomingReport = makeReport(incoming, tradeQty, incomingStatus, undefined, batchId);
    const restingReport = makeReport(resting, tradeQty, restingStatus, undefined, batchId);
    reportsForOrder.push(incomingReport, restingReport);
    state.reports.push(incomingReport, restingReport);

    if (resting.remainingQty === 0) {
      opposite.shift();
    }
  }

  if (incoming.remainingQty > 0) {
    if (!matchedAny) {
      const accepted = makeReport(incoming, incoming.remainingQty, 0, undefined, batchId);
      reportsForOrder.push(accepted);
      state.reports.push(accepted);
    }
    if (incoming.side === 1) {
      book.bids.push(incoming);
      sortBids(book.bids);
    } else {
      book.asks.push(incoming);
      sortAsks(book.asks);
    }
  }

  return reportsForOrder;
};

const csvEscape = (value: string | number): string => {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replaceAll("\"", "\"\"")}"`;
  }
  return text;
};

const parseSide = (sideToken: string): Side | undefined => {
  const cleaned = sideToken.trim().toLowerCase();
  if (cleaned === "1" || cleaned === "buy") return 1;
  if (cleaned === "2" || cleaned === "sell") return 2;
  return undefined;
};

const normalizeHeader = (header: string): string => header.toLowerCase().replace(/[^a-z0-9]/g, "");

export const apiClient = {
  login: async (username: string, password: string) => {
    await delay(120);
    if (!username.trim()) return { ok: false, message: "Username is required" };
    if (!password) return { ok: false, message: "Password is required" };
    return {
      ok: true,
      token: `token_${username}`,
      role: (username.trim().toLowerCase() === "admin" ? "Admin" : "Trader") as "Admin" | "Trader"
    };
  },

  submitOrder: async (payload: OrderInput) => {
    await delay(120);
    const reports = processOrder(payload);
    emit({ type: "report_update", payload: reports });
    emit({ type: "orderbook_update", payload: { instrument: payload.instrument } });
    const reject = reports.find((r) => r.status === 1);
    return {
      ok: !reject,
      message: reject ? `Order rejected: ${reject.reason ?? "Unknown reason"}` : "Order processed",
      reports
    };
  },

  submitBatch: async (file: File) => {
    await delay(200);
    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      return {
        ok: false,
        message: "CSV file is empty",
        summary: {
          batchId: `B-${Date.now()}`,
          total: 0,
          accepted: 0,
          rejected: 0,
          processedAt: timestampNow()
        } as BatchSummary,
        rowErrors: [] as BatchRowError[]
      };
    }

    let columnIndexes = {
      clientOrderId: 0,
      instrument: 1,
      side: 2,
      price: 3,
      quantity: 4
    };

    const firstLineTokens = lines[0].split(",").map((token) => token.trim());
    const normalizedHeaders = firstLineTokens.map(normalizeHeader);
    const headerIndexByName = new Map<string, number>();
    normalizedHeaders.forEach((name, index) => {
      headerIndexByName.set(name, index);
    });

    const hasHeader = headerIndexByName.has("clordid") || headerIndexByName.has("clientorderid");

    if (hasHeader) {
      columnIndexes = {
        clientOrderId: headerIndexByName.get("clordid") ?? headerIndexByName.get("clientorderid") ?? 0,
        instrument: headerIndexByName.get("instrument") ?? 1,
        side: headerIndexByName.get("side") ?? 2,
        price: headerIndexByName.get("price") ?? 3,
        quantity: headerIndexByName.get("quantity") ?? 4
      };
    }

    const dataLines = hasHeader ? lines.slice(1) : lines;
    const lineOffset = hasHeader ? 2 : 1;
    const batchId = `B-${Date.now()}`;
    const rowErrors: BatchRowError[] = [];
    const allBatchReports: ReportRow[] = [];
    let accepted = 0;
    let rejected = 0;

    dataLines.forEach((line, index) => {
      const tokens = line.split(",").map((token) => token.trim());
      if (tokens.length < 5) {
        rowErrors.push({ lineNumber: index + lineOffset, reason: "Missing required field", row: line });
        rejected += 1;
        return;
      }

      const maxRequiredIndex = Math.max(
        columnIndexes.clientOrderId,
        columnIndexes.instrument,
        columnIndexes.side,
        columnIndexes.price,
        columnIndexes.quantity
      );

      if (tokens.length <= maxRequiredIndex) {
        rowErrors.push({ lineNumber: index + lineOffset, reason: "Missing required field", row: line });
        rejected += 1;
        return;
      }

      const side = parseSide(tokens[columnIndexes.side]);
      const price = Number(tokens[columnIndexes.price]);
      const qty = Number(tokens[columnIndexes.quantity]);

      const order: OrderInput = {
        clientOrderId: tokens[columnIndexes.clientOrderId],
        instrument: tokens[columnIndexes.instrument] as Instrument,
        side: side ?? 1,
        price,
        quantity: qty
      };

      const reports = processOrder(order, batchId);
      allBatchReports.push(...reports);
      if (reports.some((r) => r.status === 1)) {
        rejected += 1;
        const firstReject = reports.find((r) => r.status === 1);
        rowErrors.push({
          lineNumber: index + lineOffset,
          reason: firstReject?.reason ?? "Validation failed",
          row: line
        });
      } else {
        accepted += 1;
      }
    });

    const summary: BatchSummary = {
      batchId,
      total: dataLines.length,
      accepted,
      rejected,
      processedAt: timestampNow()
    };
    state.batches.unshift(summary);

    if (allBatchReports.length > 0) {
      const impactedInstruments = new Set<Instrument>(allBatchReports.map((r) => r.instrument));
      emit({ type: "report_update", payload: allBatchReports });
      impactedInstruments.forEach((instrument) => emit({ type: "orderbook_update", payload: { instrument } }));
    }
    emit({ type: "batch_processed", payload: summary });

    return {
      ok: true,
      message: "Batch processed",
      summary,
      rowErrors
    };
  },

  getReports: async (filters?: ReportFilters) => {
    await delay(90);
    return state.reports.filter((report) => {
      if (filters?.instrument && report.instrument !== filters.instrument) return false;
      if (typeof filters?.status === "number" && report.status !== filters.status) return false;
      if (
        filters?.clientOrderId &&
        !report.clientOrderId.toLowerCase().includes(filters.clientOrderId.trim().toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  },

  downloadReportsCsv: async (rows?: ReportRow[]) => {
    await delay(80);
    const source = rows ?? state.reports;
    const header = "Cl. Ord.ID,OrderID,Instrument,Side,Price,Quantity,Status,Reason,TransactionTime,BatchId\n";
    const body = source
      .map((r) =>
        [
          r.clientOrderId,
          r.orderId,
          r.instrument,
          r.side,
          r.price,
          r.quantity,
          statusLabel(r.status),
          r.reason ?? "",
          r.transactionTime,
          r.batchId ?? ""
        ]
          .map(csvEscape)
          .join(",")
      )
      .join("\n");
    return `${header}${body}${body ? "\n" : ""}`;
  },

  getOrderBook: async (instrument: Instrument): Promise<OrderBookSnapshot> => {
    await delay(80);
    const book = state.books[instrument];

    const aggregate = (orders: RestingOrder[]): OrderBookLevel[] => {
      const grouped = new Map<number, { totalQty: number; orderCount: number }>();
      orders.forEach((order) => {
        const existing = grouped.get(order.price) ?? { totalQty: 0, orderCount: 0 };
        existing.totalQty += order.remainingQty;
        existing.orderCount += 1;
        grouped.set(order.price, existing);
      });
      return Array.from(grouped.entries()).map(([price, details]) => ({
        price,
        totalQty: details.totalQty,
        orderCount: details.orderCount
      }));
    };

    const bids = aggregate(book.bids).sort((a, b) => b.price - a.price);
    const asks = aggregate(book.asks).sort((a, b) => a.price - b.price);

    return { instrument, bids, asks };
  },

  getBatchSummaries: async () => {
    await delay(60);
    return [...state.batches];
  },

  getRecentRejects: async (limit = 10) => {
    await delay(60);
    return state.reports.filter((r) => r.status === 1).slice(-limit).reverse();
  },

  getDashboardMetrics: async () => {
    await delay(50);
    const rejected = state.reports.filter((r) => r.status === 1).length;
    const fills = state.reports.filter((r) => r.status === 2).length;
    const partials = state.reports.filter((r) => r.status === 3).length;
    return {
      totalReports: state.reports.length,
      fills,
      partials,
      rejected,
      batches: state.batches.length
    };
  },

  subscribeLiveEvents: (listener: (event: LiveEvent) => void) => {
    state.listeners.add(listener);
    return () => {
      state.listeners.delete(listener);
    };
  }
};

export const execStatusLabel = statusLabel;