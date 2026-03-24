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

> Note: frontend pages and services are currently scaffold placeholders and need full implementation.
