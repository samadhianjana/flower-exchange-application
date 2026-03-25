# Local Setup

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
