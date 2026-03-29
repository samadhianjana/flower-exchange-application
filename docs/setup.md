# Local Setup

## Docker (recommended for quick start)

From the repository root:

1. Production frontend + backend src:
   - `docker compose up --build frontend backend`
   - Open `http://localhost:8080`

2. Development frontend (hot reload):
   - `docker compose --profile dev up --build frontend-dev`
   - Open `http://localhost:5173`

Notes:

- `frontend` uses a production image (`nginx` + built static assets).
- `frontend-dev` mounts local source for live changes.
- `backend` compiles `src/` via CMake during image build.
- `backend` persists execution report files into `tests/testdata/exec_reports/`.

CLI tip for report naming:

- Use a mounted filename that matches your source CSV name so the output is `<inputname>_execution_report.csv`.
- Example:
   - `INPUT_CSV="/absolute/path/to/your.csv" && CSV_NAME="$(basename \"$INPUT_CSV\")" && docker compose run --rm --no-deps -e FLOWER_EXCHANGE_BATCH_CSV_PATH="/inputs/$CSV_NAME" -v "$INPUT_CSV:/inputs/$CSV_NAME:ro" backend ctest --test-dir build --output-on-failure -R exchange_core_tests`

## Backend (C++)

1. Install a C++17 compiler.
2. Install CMake 3.16+.
3. Configure and build:
   - `cmake -S . -B build`
   - `cmake --build build`
4. Run tests:
   - `ctest --test-dir build --output-on-failure`

## Frontend Scaffold

1. Install Node.js 18+.
2. From `frontend/`, run:
   - `npm install`
   - `npm start`

Available frontend features

- Login (Trader/Admin role simulation)
- Manual order entry with client-side validation hints
- CSV batch upload with row-level reject feedback
- Execution reports table with filters and CSV download
- Order book depth view by instrument
- Admin monitoring view for batch summaries and recent rejects
- Realtime updates (simulated WebSocket events)

Login tip:

- Use username `admin` for Admin role; any non-empty password is accepted.
