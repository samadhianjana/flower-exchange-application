# Frontend Tailwind Style Guide

## Purpose
This guide documents reusable Tailwind styling patterns used in the frontend redesign so new UI work stays consistent and avoids one-off styles.

## Visual Direction
- Professional fintech style: clean surfaces, restrained color, clear hierarchy.
- Data-first layouts: dense content remains readable with strong table and label treatment.
- Consistent spacing scale: use shared classes and keep page rhythm predictable.

## Shared Class Patterns
These classes are defined in `frontend/src/index.css` under `@layer components`.

- `app-shell`: main page container width and responsive padding.
- `panel`, `panel-header`, `panel-body`: standard content card wrappers.
- `btn-primary`, `btn-secondary`: primary and secondary action styles.
- `field`, `field-label`, `input-field`, `select-field`: consistent form controls.
- `toolbar`: responsive filter/action row.
- `chip-grid`, `metric-chip`, `metric-label`, `metric-value`: KPI metric display blocks.
- `table-shell`, `table`: reusable table container and table treatment.
- `status-badge`, `status-new`, `status-rejected`, `status-fill`, `status-pfill`: status presentation.
- `status-ok`, `status-error`: simple inline messaging states.

## Page Usage Examples
- `frontend/src/pages/LoginPage.tsx`: uses `panel` + `field` patterns for compact auth form layout.
- `frontend/src/pages/DashboardPage.tsx`: uses metric chips and button hierarchy for quick navigation.
- `frontend/src/pages/ManualOrderPage.tsx`: uses toolbar + shared fields for fast data entry and report table.
- `frontend/src/pages/ExecutionReportsPage.tsx`: uses toolbar and status badges for filtered report browsing.
- `frontend/src/pages/OrderBookPage.tsx`: uses dual table-shell layouts for bids/asks readability.
- `frontend/src/pages/AdminMonitoringPage.tsx`: uses table pattern consistency for operational monitoring.

## Maintenance Rules
- Prefer existing shared classes first; add new component-layer classes only if repeated across at least two screens.
- Avoid inline styles for standard UI elements (buttons, fields, tables, status text).
- Keep color and spacing decisions aligned with Tailwind theme values in `frontend/tailwind.config.js`.
- If a new UI pattern appears repeatedly, promote it to `frontend/src/index.css` under `@layer components`.
- Do not change business logic while adjusting styles; keep styling updates CSS-focused.

## Extension Workflow
1. Prototype with existing classes.
2. If duplication emerges, add one reusable component-layer class.
3. Update this guide with the new class name and one usage location.
4. Run `npm run build` in `frontend/` to confirm no config regressions.
