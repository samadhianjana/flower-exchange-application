## Relevant Files

- `frontend/package.json` - Add Tailwind CSS and supporting tooling dependencies/scripts if needed.
- `frontend/package-lock.json` - Lock installed Tailwind, PostCSS, and Autoprefixer dependency versions.
- `frontend/tailwind.config.js` - Define theme tokens, content scanning paths, and reusable design primitives.
- `frontend/postcss.config.js` - Configure Tailwind and Autoprefixer processing.
- `frontend/src/main.tsx` - Ensure global stylesheet import and bootstrapping path are correct.
- `frontend/src/App.tsx` - Apply global shell/container utility classes where needed.
- `frontend/src/index.css` - Define Tailwind layer imports and shared utility composition for common patterns.
- `frontend/src/pages/LoginPage.tsx` - Apply fintech visual redesign classes to login UI.
- `frontend/src/pages/DashboardPage.tsx` - Apply shared typography, spacing, and card/table patterns.
- `frontend/src/pages/OrderBookPage.tsx` - Style dense trading data views with readable hierarchy.
- `frontend/src/pages/ManualOrderPage.tsx` - Style form controls and action buttons with reusable patterns.
- `frontend/src/pages/BatchUploadPage.tsx` - Align file upload and status presentation styles.
- `frontend/src/pages/ExecutionReportsPage.tsx` - Apply report/table style patterns and status indicators.
- `frontend/src/pages/AdminMonitoringPage.tsx` - Align monitoring metrics layout and alert/status styling.
- `docs/frontend-style-guide-tailwind.md` - Document reusable style patterns and usage guidelines for junior developers.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (for example, `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npm run build` from `frontend/` to validate the production build after styling changes.
- Use `npm run dev` from `frontend/` for manual page-by-page visual verification.
- This task list follows a CSS-only scope. Do not modify JSX/TSX structure or frontend business logic.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you do not skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks
- [x] 1.0 Set up Tailwind CSS in the existing frontend
	- [x] 1.1 Install and configure Tailwind CSS, PostCSS, and Autoprefixer in `frontend/`.
	- [x] 1.2 Create/update Tailwind and PostCSS config files with correct Vite + React content paths.
	- [x] 1.3 Add Tailwind layer directives to the global stylesheet and ensure they are loaded by the app entry point.
	- [x] 1.4 Verify Tailwind utilities compile correctly by running a frontend build.
- [x] 2.0 Define reusable fintech-style design patterns
	- [x] 2.1 Establish base typography, spacing, color, and surface conventions for a professional fintech look.
	- [x] 2.2 Define reusable class patterns for page containers, headings, forms, buttons, tables, and status indicators.
	- [x] 2.3 Add shared utility composition in global styles for frequently repeated UI patterns.
	- [x] 2.4 Validate pattern consistency against PRD goals before page-level rollout.
- [x] 3.0 Apply redesigned styles across all frontend pages
	- [x] 3.1 Update `LoginPage.tsx` and `DashboardPage.tsx` using the shared Tailwind patterns.
	- [x] 3.2 Update trading flow pages: `OrderBookPage.tsx`, `ManualOrderPage.tsx`, and `ExecutionReportsPage.tsx`.
	- [x] 3.3 Update operations pages: `BatchUploadPage.tsx` and `AdminMonitoringPage.tsx`.
	- [x] 3.4 Ensure all changes stay CSS-only with no JSX/TSX structural or logic changes.
- [ ] 4.0 Validate visual consistency and implementation speed goals
	- [x] 4.1 Perform manual visual QA on all pages for typography, spacing, color consistency, and hierarchy.
	- [x] 4.2 Verify no functional regressions in existing user flows after style updates.
	- [x] 4.3 Measure reusable pattern adoption target (at least 80% of repeated style cases).
	- [x] 4.4 Run frontend build and resolve any styling/config issues.
	- [ ] 4.5 Complete interactive page walkthrough with backend/API running and capture stakeholder sign-off.
- [x] 5.0 Document reusable styling conventions for junior developers
	- [x] 5.1 Create a concise Tailwind style guide document describing reusable patterns and when to use them.
	- [x] 5.2 Add page-level examples showing how shared patterns are applied in this redesign.
	- [x] 5.3 Add a short maintenance section describing how to extend patterns without reintroducing one-off styles.
