# Product Requirements Document: Flower Exchange Platform

## 1. Introduction/Overview

The Flower Exchange Platform enables traders to submit flower buy/sell orders manually or in CSV batches, while an exchange backend validates, matches, and produces execution reports.  
This PRD covers the full platform scope (backend, API, and UI) for Phase 1, with emphasis on correct matching behavior, clear reporting, and an efficient trader workflow.

The product solves three core problems:
- Manual order handling is slow and error-prone without a dedicated trading UI.
- Matching and order lifecycle outcomes must be deterministic and auditable.
- Users need immediate, reliable visibility into `New`, `Reject`, `PFill`, and `Fill` outcomes.

## 2. Goals

1. Implement end-to-end order processing for manual and batch order submission.
2. Enforce all business validation rules consistently for every order source.
3. Match orders by instrument using strict price-time priority.
4. Provide real-time execution report updates in the UI via WebSocket.
5. Provide a usable trader UI that supports order entry, order visibility, and report download.
6. Deliver a role-aware Phase 1 experience for two roles: Trader and Admin.
7. Ensure behavior aligns with architecture examples (including Example 6 semantics).
8. Follow SOLID principles

## 3. User Stories

- As a **Trader**, I want to submit a single order from a form so I can quickly place trades.
- As a **Trader**, I want to upload a CSV file of orders so I can process large sets efficiently.
- As a **Trader**, I want to immediately see if an order is accepted, rejected, partially filled, or filled.
- As a **Trader**, I want to view the current order book by instrument so I can make better decisions.
- As a **Trader**, I want to download execution reports as CSV for reconciliation.
- As an **Admin**, I want to monitor submitted batches and processing outcomes so I can support operations.
- As an **Admin**, I want to access the same order/report data with elevated management visibility.

## 4. Functional Requirements

### 4.1 Roles and Access

1. The system must support two roles in Phase 1: `Trader` and `Admin`.
2. The system must require authenticated access before platform usage.
3. The system must enforce role-based permissions for sensitive admin operations.
4. The system must expose shared trading/report views for both roles, with admin-only management views where applicable.

### 4.2 Order Submission and Validation

5. The UI must provide a manual order entry form with fields: Client Order ID, Instrument, Side, Price, Quantity.
6. The system must validate each order against rules:
   - Instrument in (`Rose`, `Lavender`, `Lotus`, `Tulip`, `Orchid`)
   - Side in (`1` buy, `2` sell)
   - Price `> 0`
   - Quantity between `10` and `1000`, multiple of `10`
   - Required fields present
7. The system must reject invalid orders and emit `Reject` execution reports with reject reasons.
8. Rejected orders must not be inserted into any order book.

### 4.3 Matching and Order Book

9. The system must maintain one order book per instrument.
10. The system must apply price-time priority:
    - Buy side: highest price, then earliest time
    - Sell side: lowest price, then earliest time
11. The system must match incoming orders against opposite-side liquidity while crossing rules hold.
12. The system must execute trades at the resting book order price.
13. The system must support partial fills and multi-level sweeps.
14. The system must rest remaining quantity on the book when no further crossing is possible.

### 4.4 Status Lifecycle and Reports

15. The system must support statuses: `New`, `Reject`, `PFill`, `Fill`.
16. The system must produce execution reports with fields:
    - Client Order ID
    - Order ID (system-generated)
    - Instrument
    - Side
    - Price
    - Quantity
    - Status
    - Reason (optional, required for rejects)
    - Transaction Time (`YYYYMMDD-HHMMSS.sss`)
17. The system must persist execution reports for retrieval and download.
18. The system must provide CSV download for execution report results.

### 4.5 Batch CSV Processing

19. The UI must allow CSV upload for batch order submission.
20. The API must process rows in file order.
21. The system must apply the same validation and matching pipeline used by manual submission.
22. The system must continue processing remaining rows when an individual row is rejected.
23. The system must return batch processing summary details to the UI.

### 4.6 API and Data Access

24. The backend must provide single-order submission endpoint.
25. The backend must provide batch CSV submission endpoint.
26. The backend must provide execution report retrieval endpoint.
27. The backend must provide execution report CSV download endpoint.
28. The backend must provide order book snapshot endpoint by instrument.

### 4.7 UI Requirements (Functional)

29. The UI must include pages/views for:
    - Login
    - Dashboard
    - Manual Order Entry
    - CSV Batch Upload
    - Execution Reports
    - Order Book by Instrument
    - Admin Monitoring (admin role)
30. The UI must show immediate submission feedback for manual and batch actions.
31. The UI must receive and render report/order updates over WebSocket.
32. The UI must support filter/search in execution reports by instrument, status, and client order ID.
33. The UI must allow users to download currently viewed report scope as CSV.
34. The UI must display clear, actionable validation and reject error messages.

## 5. Non-Goals (Out of Scope)

- Advanced order types (market, iceberg, stop, etc.).
- Order amend/cancel workflows in Phase 1.
- Multi-node/distributed matching engine.
- Algorithmic trading strategies or automated bot orchestration.
- Complex analytics dashboards beyond operational visibility.
- Mobile-native applications (web UI only in Phase 1).

## 6. Design Considerations (Optional)

- This PRD defines UI behavior and workflow requirements only; visual mockups/wireframes are not required for this version.
- UI should prioritize fast manual input, clear status visibility, and low-friction CSV workflows.
- Status and reject reason presentation should be unambiguous for junior traders and support staff.
- Role-based navigation should show only relevant options to each role.

## 7. Technical Considerations (Optional)

- Exchange backend is implemented in C++ and should preserve deterministic sequencing.
- Frontend communicates with backend via API endpoints plus WebSocket channel for real-time updates.
- Persistence should support auditability and ordered event/report replay.
- Report generation and storage should align with the architecture contract fields and timestamp format.
- Batch processing must be resilient to row-level failures.

## 8. Success Metrics

1. **Matching correctness:** 100% pass rate on acceptance test cases for documented scenarios (including Example 6).
2. **Validation correctness:** 100% expected `Reject` behavior for invalid sample inputs.
3. **Real-time visibility:** 95% of execution report updates appear in UI within 1 second of backend emission.
4. **Workflow efficiency:** Manual order submission to first status acknowledgment in under 2 seconds for normal load.
5. **Usability quality:** At least 80% positive feedback from internal users on order entry/report workflows.
6. **Operational reliability:** Zero data-loss incidents for accepted orders and generated execution reports in test/UAT.

## 9. Open Questions

1. What exact permission boundaries separate `Trader` and `Admin` in Phase 1?
2. Should duplicate `Client Order ID` be rejected globally, per batch, or per day/session?
3. Should the UI fall back to polling when WebSocket is unavailable, and at what interval?
4. Which CSV schema/versioning strategy should be enforced for upload compatibility?
5. Are there explicit non-functional throughput targets for peak batch size and concurrent users?
