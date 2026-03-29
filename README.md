# flower-exchange-application

Flower Exchange is a trading platform prototype for flower instruments (Rose, Lavender, Lotus, Tulip, Orchid).

It includes:

- A C++17 backend core for validation, order matching, order book handling, and reporting
- Integration and unit tests for core trading flows
- A React + Vite frontend for login simulation, manual orders, batch upload, reports, and order book view

## Run with Docker

This repository includes Docker support for:

- Frontend production container (served via Nginx)
- Frontend development container (Vite dev server)
- Backend C++ source build container

### 1) Prerequisites

- Docker Engine
- Docker Compose v2

### 2) Build and run frontend + backend

Start both services in one command:

- `docker compose up --build frontend backend`

Then open:

- `http://localhost:8080` (frontend production UI)

### 3) Frontend development mode (hot reload)

- `docker compose --profile dev up --build frontend-dev`

Then open `http://localhost:5173`.

### 4) CLI workflow (batch CSV processing)

To run the backend batch flow through CLI in Docker:

- `INPUT_CSV="/absolute/path/to/your.csv" && CSV_NAME="$(basename \"$INPUT_CSV\")" && docker compose run --rm --no-deps -e FLOWER_EXCHANGE_BATCH_CSV_PATH="/inputs/$CSV_NAME" -v "$INPUT_CSV:/inputs/$CSV_NAME:ro" backend ctest --test-dir build --output-on-failure -R exchange_core_tests`

Execution reports are saved to:

- `tests/testdata/exec_reports/`

because the backend service maps that host folder into the container.

Example: if the input is `testcase_3.csv`, the output will be `testcase_3_execution_report.csv`.

Optional: write the execution report to a host directory:

- `docker compose run --rm --no-deps -e FLOWER_EXCHANGE_BATCH_CSV_PATH=/inputs/input.csv -e FLOWER_EXCHANGE_REPORT_OUTPUT_PATH=/outputs/report.csv -v "/absolute/path/to/your.csv:/inputs/input.csv:ro" -v "$PWD/tests/testdata/exec_reports:/outputs" backend ctest --test-dir build --output-on-failure -R exchange_core_tests`

### 5) Stop services

- `docker compose down`