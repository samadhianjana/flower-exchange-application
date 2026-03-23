# Flower Exchange Platform Architecture

## 1. Purpose

This document defines the target architecture for a Flower Exchange platform with:

- **Trader Application (Frontend)** for manual order entry, CSV upload, order book visibility, and execution report download.
- **Exchange Application (C++ Backend)** for validation, matching, order book management, and execution report generation.

The architecture is designed to satisfy the attached business rules, status lifecycle, priority sequence, and Example 6 behavior.

---

## 2. Scope

### In scope
- Submit orders manually from the UI.
- Submit orders in batch via CSV.
- Validate every order using strict rules.
- Maintain one order book per instrument.
- Match orders using price-time priority.
- Produce execution reports with statuses: `New`, `Reject`, `Fill`, `PFill`.
- Display and download execution reports in the frontend.

### Out of scope (phase 1)
- Order cancellation/amendment.
- Multi-node matching engine distribution.
- Advanced order types (market, iceberg, stop, etc.).
- User auth/roles beyond basic app access.

---

## 3. Canonical Business Rules

## 3.1 Supported instruments
- Allowed values: `Rose`, `Lavender`, `Lotus`, `Tulip`, `Orchid`.
- One order book is maintained per instrument.

## 3.2 Input order schema

Each input order must contain:

1. `Client Order ID` (String, alphanumeric, max 7 chars, mandatory)
2. `Instrument` (String, one of allowed instruments, mandatory)
3. `Side` (Int, `1 = Buy`, `2 = Sell`, mandatory)
4. `Price` (double, must be `> 0`, mandatory)
5. `Quantity` (int, mandatory, multiple of 10, min 10, max 1000)

## 3.3 Validation rejection rules

Order is rejected if any condition fails:

- Missing required field.
- Invalid instrument.
- Invalid side.
- `Price <= 0`.
- `Quantity` not multiple of 10.
- `Quantity < 10` or `Quantity > 1000`.

Rejected orders do not enter the order book and generate `Reject` execution reports.

## 3.4 Order book priority

Priority sequence:

- **Buy side:** higher price first, then earlier time (FIFO within same price).
- **Sell side:** lower price first, then earlier time (FIFO within same price).

> Note: one slide text has reversed sort wording; this architecture follows the stated attractiveness rule and Example 6 behavior.

## 3.5 Status semantics

- `New`: valid order accepted by exchange.
- `Reject`: order failed validation.
- `Fill`: order fully executed.
- `PFill`: order partially executed (remaining quantity > 0).

---

## 4. Output Execution Report Contract

Execution report fields:

1. `Client Order ID` (String, mandatory)
2. `Order ID` (String, system-generated unique id, mandatory)
3. `Instrument` (String, mandatory)
4. `Side` (Int, `1`/`2`, mandatory)
5. `Price` (double, mandatory)
6. `Quantity` (int, mandatory)
7. `Status` (int in source table, mapped to enum)
   - `0 = New`
   - `1 = Rejected`
   - `2 = Fill`
   - `3 = PFill`
8. `Reason` (String, optional, max 50 chars; populated for rejects)
9. `Transaction Time` (String, mandatory format `YYYYMMDD-HHMMSS.sss`)

### Recommended internal enum

```text
enum class ExecStatus {
  New = 0,
  Rejected = 1,
  Fill = 2,
  PFill = 3
};
```

---

## 5. High-Level System Architecture

```text
+--------------------------+      HTTPS/JSON      +------------------------------+
| Trader Frontend          |  <-----------------> | Exchange API (C++ service)   |
| - Manual order form      |                     | - Submit single order        |
| - CSV upload             |                     | - Submit batch orders        |
| - Execution report table |                     | - Query reports/order books  |
| - Download report CSV    |                     +--------------+---------------+
+------------+-------------+                                    |
             |                                                  |
             |                                                  v
             |                                  +------------------------------+
             |                                  | Core Exchange Engine         |
             |                                  | - Validation Engine          |
             |                                  | - Sequencer                  |
             |                                  | - Matching Engine            |
             |                                  | - Order Book Manager         |
             |                                  | - Execution Report Builder   |
             |                                  +---------------+--------------+
             |                                                  |
             |                                                  v
             |                                  +------------------------------+
             |                                  | Persistence / Storage        |
             |                                  | - Orders/Event log           |
             |                                  | - Execution report store     |
             |                                  | - Snapshot (optional)        |
             |                                  +------------------------------+
```

---

## 6. Component Responsibilities

## 6.1 Trader Frontend
- Manual order entry with client-side validation hints.
- CSV upload and parsing feedback.
- Live/polled execution report rendering.
- Download execution report as CSV.

## 6.2 Exchange API Layer
- Accepts single order and batch order requests.
- Normalizes requests to internal command objects.
- Returns synchronous acknowledgement and report references.

## 6.3 Validation Engine
- Applies schema and business-rule validations.
- Maps failures to standard reject reasons.
- Emits `Reject` execution report immediately for invalid orders.

## 6.4 Sequencer
- Assigns monotonically increasing sequence number per accepted order.
- Preserves deterministic ordering for matching.

## 6.5 Matching Engine
- Maintains per-instrument order books.
- Runs price-time matching.
- Supports partial and multi-match fills.
- Produces execution events for both aggressor and resting orders.

## 6.6 Execution Report Builder
- Translates domain events to output contract rows.
- Adds mandatory `Transaction Time` in required format.
- Stores reports and sends them to frontend.

## 6.7 Persistence
- Stores submitted orders, execution events, and final report rows.
- Supports report retrieval and CSV export.
- Enables replay/audit (recommended append-only event log).

---

## 7. Data Model (Conceptual)

## 7.1 Core entities

- `Order`
  - `orderId` (system generated)
  - `clientOrderId`
  - `instrument`
  - `side`
  - `price`
  - `originalQty`
  - `remainingQty`
  - `status`
  - `sequenceNo`
  - `createdAt`

- `Trade`
  - `tradeId`
  - `instrument`
  - `buyOrderId`
  - `sellOrderId`
  - `price`
  - `qty`
  - `executedAt`

- `ExecutionReport`
  - fields per section 4

## 7.2 Order book structure (per instrument)

- `BidBook`: price levels in descending order; each level is FIFO queue.
- `AskBook`: price levels in ascending order; each level is FIFO queue.

Recommended C++ structures:
- `std::map<double, std::deque<OrderRef>, std::greater<double>>` for bids
- `std::map<double, std::deque<OrderRef>, std::less<double>>` for asks

---

## 8. Processing Flows

## 8.1 Single manual order flow

1. User submits order from frontend.
2. API creates internal order command.
3. Validation engine validates input.
4. If invalid -> create `Reject` report, persist, return to frontend.
5. If valid -> create system `Order ID`, emit `New` report.
6. Matching engine attempts matching against opposite book.
7. For each match, generate `PFill` or `Fill` updates.
8. If remaining qty > 0, rest order on book.
9. Persist all report events and return/stream to frontend.

## 8.2 CSV batch flow

1. User uploads CSV file.
2. Frontend sends file to API batch endpoint.
3. Parser reads rows in file order.
4. Each row goes through same pipeline as manual order.
5. Continue processing regardless of row-level rejection.
6. Frontend displays cumulative execution report rows.
7. User can download full execution report CSV.

---

## 9. Matching Logic, Price Adjustment, and Status Transitions

For each valid incoming order:

1. Select the opposite best price level.
2. Check crossing condition:
   - Buy order can execute while `bestAsk <= buyLimitPrice`
   - Sell order can execute while `bestBid >= sellLimitPrice`
3. If not crossable, rest incoming order on its own side and emit `New`.
4. If crossable:
   - `tradeQty = min(incomingRemaining, restingRemaining)`
   - **trade price = resting (book) order price**
   - update both remaining quantities
   - emit execution rows for both sides:
     - `Fill` if remaining becomes 0
     - `PFill` if remaining is still > 0 after at least one trade
5. Continue until incoming order is fully matched or book is no longer crossable.
6. If incoming still has remainder, keep it in the book at its original limit price.

### 9.1 Price adjustment behavior (important)

Incoming limit price defines **maximum buy** / **minimum sell** acceptable price.  
Execution can happen at a better resting-book price:

- Incoming **sell** with very low price can execute at higher resting bid prices.
- Incoming **buy** with high price can execute at lower resting ask prices.

This is consistent with your Example 6 outputs.

### 9.2 Transition patterns

- `Reject` (terminal)
- `New` (accepted, no immediate execution)
- `New -> PFill -> Fill`
- `New -> Fill`
- Immediate match path (no separate `New` row first):
  - `PFill` then possibly later `Fill`, or
  - direct `Fill`

---

## 10. General Execution Scenarios

## 10.1 No cross (order rests)

- Incoming buy limit below best ask, or incoming sell limit above best bid.
- Result: emit `New`; no trade; order rests in book.

## 10.2 Full match at one price level

- Incoming quantity exactly equals best opposite resting quantity.
- Result: both counterparties move to `Fill`.

## 10.3 Partial match with remainder resting

- Incoming order matches some quantity, then no more crossable liquidity exists.
- Result: incoming emits `PFill`; unmatched remainder stays on book.

## 10.4 Sweep multiple levels

- Incoming quantity larger than best opposite level.
- Engine consumes multiple price levels in price-time order.
- Result: multiple report rows (`PFill` and/or `Fill`) until done or not crossable.

## 10.5 User-provided scenario: Buy 200 @ 45 against existing sells

Given book state (sell side already resting):
- `ord1` (aa13): Sell 100 @ 55
- `ord2` (aa14): Sell 100 @ 45

Incoming:
- `ord3` (aa15): Buy 200 @ 45

Execution:
1. Buy 45 crosses sell 45 (`ord2`) -> trade 100 @ 45.
2. `ord2` becomes `Fill`.
3. `ord3` has 100 remaining, but cannot cross `ord1` at 55 (`55 > 45`).
4. `ord3` remains partially filled (`PFill`) with remaining 100 resting at buy 45.

Execution report sequence (as in your attachment):
- `ord1` -> `New` (100 @ 55)
- `ord2` -> `New` (100 @ 45)
- `ord3` -> `PFill` (100 executed @ 45)
- `ord2` -> `Fill` (100 executed @ 45)

Note: no execution occurs against `ord1` in this scenario.

---

## 11. Example 6 Interpretation (from provided slides)

Input sequence (Rose):
1. `aa13` Buy 100 @ 55.00
2. `aa14` Buy 100 @ 65.00
3. `aa15` Sell 300 @ 1.00
4. `aa16` Buy 100 @ 2.00

Expected matching behavior:

- `aa13` accepted (`New`) and rests.
- `aa14` accepted (`New`) and rests above `aa13`.
- `aa15` crosses both bids:
  - trades 100 with `aa14` at 65.00 (`aa14` becomes `Fill`, `aa15` becomes `PFill`)
  - trades 100 with `aa13` at 55.00 (`aa13` becomes `Fill`, `aa15` remains `PFill`)
  - `aa15` has 100 remaining on ask at 1.00.
- `aa16` buy 100 @ 2.00 crosses resting `aa15` ask 1.00:
  - both complete (`aa16` `Fill`, `aa15` `Fill`).

This confirms price-time behavior, partial-fill lifecycle, and resting-price trade execution.

---

## 12. API Contract (Draft)

## 11.1 Submit single order
- `POST /api/orders`
- Request body: input-order fields.
- Response: accepted/rejected plus generated report row(s) id reference.

## 11.2 Submit CSV batch
- `POST /api/orders/batch`
- Multipart CSV upload.
- Response: batch id and processing summary.

## 11.3 Retrieve execution reports
- `GET /api/reports?batchId=...`
- Returns ordered report rows.

## 11.4 Download execution report CSV
- `GET /api/reports/{reportId}/download`
- Returns CSV file.

## 11.5 Get order book snapshot
- `GET /api/orderbook/{instrument}`
- Returns buy/sell levels and queued orders.

---

## 13. Persistence Strategy

Phase 1 recommended:

- Relational DB tables (or append-only file + indexed query store):
  - `orders`
  - `trades`
  - `execution_reports`
  - `batches`

- Write all execution report rows atomically in order.
- Store `sequenceNo` and `transactionTime` for deterministic replay.

---

## 14. Error Handling and Reject Reasons (Draft)

Standardized reason catalog (<= 50 chars each):

- `Missing required field`
- `Invalid instrument`
- `Invalid side`
- `Invalid price`
- `Invalid quantity increment`
- `Quantity out of range`
- `Duplicate client order id` (optional policy)

---

## 15. Non-Functional Requirements

- Deterministic processing order.
- Idempotent batch retry behavior (same file should not duplicate orders if replayed intentionally with same batch id policy).
- Auditability of all input and output events.
- Low-latency single-order processing for manual mode.
- Clear observability: metrics, structured logs, and trace ids.

---

## 16. Recommended C++ Backend Structure

```text
src/
  api/
    order_controller.*
    report_controller.*
  domain/
    order.*
    execution_report.*
    enums.*
  validation/
    validator.*
    reject_reason.*
  matching/
    matching_engine.*
    order_book.*
    price_level.*
  ingest/
    csv_parser.*
    command_mapper.*
  persistence/
    repositories.*
  app/
    exchange_service.*
    batch_service.*
```

---

## 17. Testing Strategy

- Unit tests:
  - Validation rule tests.
  - Order book sorting and FIFO tests.
  - Matching engine trade generation tests.
  - Status transition tests.

- Integration tests:
  - Manual submit end-to-end.
  - CSV batch end-to-end.
  - Execution report download correctness.

- Acceptance tests:
  - Reproduce Example 6 expected output rows and statuses.

---

## 18. Open Decisions to Confirm

1. Duplicate `Client Order ID` policy scope.
2. Batch behavior on malformed CSV rows (skip row vs stop file).
3. Real-time push mechanism for frontend updates (polling/WebSocket/SSE).

---

## 19. Implementation Roadmap

1. Freeze contracts (input/output CSV and API JSON).
2. Build domain + validation modules.
3. Build order book + matching engine with deterministic tests.
4. Add API layer and persistence.
5. Add frontend manual form + CSV upload + report table + download.
6. Run Example 6 acceptance test as release gate.

---

## 20. Summary

The platform architecture centers on a deterministic C++ matching engine with strict validation and clear execution report semantics. Both manual and CSV orders share one processing pipeline, ensuring consistent results and traceable output for `New`, `Reject`, `PFill`, and `Fill` states.