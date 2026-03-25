# API Contracts (Phase 1)

## POST `/api/orders`
- Request:
  - `clientOrderId` (string)
  - `instrument` (Rose|Lavender|Lotus|Tulip|Orchid)
  - `side` (1|2)
  - `price` (number > 0)
  - `quantity` (10..1000, multiple of 10)
- Response:
  - `reports: ExecutionReport[]`

## POST `/api/orders/batch`
- Request:
  - CSV payload with columns: `Cl. Ord.ID,Instrument,Side,Price,Quantity`
  - `batchId` (string)
- Response:
  - `batchId`
  - `totalRows`
  - `acceptedRows`
  - `rejectedRows`
  - `reports: ExecutionReport[]`

## GET `/api/reports`
- Query:
  - `clientOrderId` (optional)
- Response:
  - `reports: ExecutionReport[]`

## GET `/api/reports/{reportId}/download`
- Response:
  - CSV text

## GET `/api/orderbook/{instrument}`
- Response:
  - `bids: {price, size}[]`
  - `asks: {price, size}[]`
