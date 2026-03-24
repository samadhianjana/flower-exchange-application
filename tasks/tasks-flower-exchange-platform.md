## Relevant Files

- `src/domain/order.hpp` - Core order entity, fields, and lifecycle state.
- `src/domain/execution_report.hpp` - Execution report contract and status mapping.
- `src/domain/enums.hpp` - Shared enums for instrument, side, and execution status.
- `src/validation/validator.hpp` - Validation interface for all order checks.
- `src/validation/validator.cpp` - Validation rule implementations and reject reasons.
- `src/matching/order_book.hpp` - Per-instrument order book data structures.
- `src/matching/order_book.cpp` - FIFO price-level operations for bids/asks.
- `src/matching/matching_engine.hpp` - Matching engine interface and sequencing entrypoint.
- `src/matching/matching_engine.cpp` - Price-time matching, partial fills, and trade generation.
- `src/api/order_controller.cpp` - Single and batch order submission endpoints.
- `src/api/report_controller.cpp` - Execution report query and CSV download endpoints.
- `src/api/orderbook_controller.cpp` - Order book snapshot endpoint by instrument.
- `src/ingest/csv_parser.cpp` - CSV parsing logic for batch rows.
- `src/persistence/repositories.cpp` - Persistence operations for orders/trades/reports/batches.
- `src/app/exchange_service.cpp` - Orchestration of validation, matching, persistence, and reporting.
- `src/realtime/ws_server.cpp` - WebSocket server/broadcast for live updates.
- `frontend/src/pages/LoginPage.tsx` - Authentication entry point.
- `frontend/src/pages/DashboardPage.tsx` - Role-aware landing and navigation.
- `frontend/src/pages/ManualOrderPage.tsx` - Manual order form and submit flow.
- `frontend/src/pages/BatchUploadPage.tsx` - CSV upload and batch summary workflow.
- `frontend/src/pages/ExecutionReportsPage.tsx` - Report table, filter/search, and CSV export action.
- `frontend/src/pages/OrderBookPage.tsx` - Instrument-level order book visibility.
- `frontend/src/pages/AdminMonitoringPage.tsx` - Admin monitoring view and operational controls.
- `frontend/src/services/apiClient.ts` - API client for orders, reports, and order books.
- `frontend/src/services/websocketClient.ts` - WebSocket connection, events, and reconnection logic.
- `frontend/src/auth/authContext.tsx` - Login state, role claims, and route guards.
- `tests/unit/validator_test.cpp` - Unit tests for all validation/reject paths.
- `tests/unit/order_book_test.cpp` - Unit tests for sorting and FIFO correctness.
- `tests/unit/matching_engine_test.cpp` - Unit tests for full/partial/multi-level matching.
- `tests/integration/order_flow_test.cpp` - End-to-end single-order flow tests.
- `tests/integration/batch_flow_test.cpp` - End-to-end CSV batch flow tests.
- `tests/acceptance/example6_test.cpp` - Acceptance test reproducing documented Example 6.

### Notes

- Unit tests should typically be placed alongside or near the modules they test.
- Use `npx jest [optional/path/to/test/file]` for frontend tests and your C++ test runner (for example, CTest/GTest) for backend tests.
- Keep reject reason strings within required limits and stable for UI display/testing.
- Update this file as each sub-task is completed by checking the box from `- [ ]` to `- [x]`.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` -> `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 1.0 Establish project foundations and shared contracts
  - [x] 1.1 Confirm final API request/response contracts for single order, batch upload, reports, and order book endpoints.
  - [x] 1.2 Define shared domain enums and types (`Instrument`, `Side`, `ExecStatus`, reject reasons, timestamp format).
  - [x] 1.3 Define coding standards and SOLID-oriented module boundaries for validation, matching, API, persistence, and UI layers.
  - [x] 1.4 Set up base project scaffolding for backend (C++) and frontend apps if not already present.
  - [x] 1.5 Document environment setup and run instructions for local development.

- [x] 2.0 Implement authentication and role-based access (Trader/Admin)
  - [x] 2.1 Implement login endpoint and token/session issuance flow.
  - [x] 2.2 Add backend middleware/guards to verify authenticated requests.
  - [x] 2.3 Add role-based authorization rules for admin-only operations and views.
  - [x] 2.4 Build frontend login page and auth state management.
  - [x] 2.5 Implement protected routes and role-aware navigation in the frontend.
  - [x] 2.6 Add tests for authentication failure paths and role permission boundaries.

- [x] 3.0 Build core exchange backend (validation, matching, status lifecycle) using C++
  - [x] 3.1 Implement order validation rules for required fields, side, instrument, price, and quantity constraints.
  - [x] 3.2 Implement standardized reject reason mapping for all validation failures.
  - [x] 3.3 Implement per-instrument order book structures with FIFO queues at each price level.
  - [x] 3.4 Implement matching engine with strict price-time priority and crossing rules.
  - [x] 3.5 Implement execution logic for partial fills, full fills, and multi-level sweeps using resting-book price execution.
  - [x] 3.6 Implement status transition handling for `New`, `Reject`, `PFill`, and `Fill`.
  - [x] 3.7 Implement deterministic sequencing for accepted order processing.

- [x] 4.0 Implement API endpoints and persistence for orders, books, and reports
  - [x] 4.1 Implement `POST /api/orders` for manual single-order submission.
  - [x] 4.2 Implement `POST /api/orders/batch` for CSV batch ingestion and processing summary response.
  - [x] 4.3 Implement `GET /api/reports` for execution report retrieval with query filters.
  - [x] 4.4 Implement `GET /api/reports/{reportId}/download` for CSV export.
  - [x] 4.5 Implement `GET /api/orderbook/{instrument}` for order book snapshots.
  - [x] 4.6 Implement persistence for orders, trades, execution reports, and batch metadata.
  - [x] 4.7 Ensure atomic write/order guarantees for execution reports and transaction times.
  - [x] 4.8 Add API integration tests for valid, invalid, and mixed batch scenarios.

- [x] 5.0 Build trader/admin UI workflows (manual order, CSV batch, reports, order book)
  - [x] 5.1 Build dashboard with role-aware links to trading and admin views.
  - [x] 5.2 Implement manual order form with client-side validation hints and submit feedback.
  - [x] 5.3 Implement CSV upload UI with parse status, row-level errors, and batch summary.
  - [x] 5.4 Implement execution reports table with filter/search by instrument, status, and client order ID.
  - [x] 5.5 Implement report CSV download from current report context.
  - [x] 5.6 Implement order book page with instrument selector and bid/ask depth display.
  - [x] 5.7 Implement admin monitoring page for operational visibility and batch/report tracking.
  - [x] 5.8 Ensure consistent, actionable error messages for rejects and API failures.

- [x] 6.0 Implement real-time updates via WebSocket and UI integration
  - [x] 6.1 Implement backend WebSocket broadcasting for execution report and order book update events.
  - [x] 6.2 Define event payload schemas and version identifiers for frontend compatibility.
  - [x] 6.3 Implement frontend WebSocket client connection lifecycle and reconnection behavior.
  - [x] 6.4 Wire real-time events into execution reports and order book UI state updates.
  - [x] 6.5 Add fallback behavior and user messaging when live connection is unavailable.
  - [x] 6.6 Add tests for event handling, reconnect behavior, and duplicate-event safety.

- [x] 7.0 Add test coverage, acceptance scenarios, and release readiness checks
  - [x] 7.1 Add unit tests for all validation rules and reject reason outputs.
  - [x] 7.2 Add unit tests for order book sorting and FIFO behavior on both sides.
  - [x] 7.3 Add unit tests for matching outcomes: no-cross, full fill, partial fill, and multi-level sweep.
  - [x] 7.4 Add integration tests for manual order flow and CSV batch flow end-to-end.
  - [x] 7.5 Implement acceptance test reproducing Example 6 expected status/report sequence.
  - [x] 7.6 Add performance smoke tests for manual submission latency and batch throughput.
  - [x] 7.7 Verify auditability requirements (ordered persistence, transaction timestamps, deterministic replay hooks).
  - [x] 7.8 Prepare release checklist (docs, known limitations, rollback plan, and sign-off criteria).
