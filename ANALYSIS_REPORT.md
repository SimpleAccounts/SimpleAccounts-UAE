# Codebase Analysis & Next.js Integration Plan

## 1. Current Architecture Analysis
*   **Frontend (`apps/frontend`)**:
    *   **Framework**: Create React App (using `react-scripts`).
    *   **Routing**: `react-router-dom` v5. Top-level routes are split into `/` (Initial/Login) and `/admin` (Dashboard).
    *   **State Management**: Redux with `redux-thunk`. Store configured in `services/store.js`.
    *   **UI Library**: Material-UI (v4), Bootstrap 4.
    *   **Data Fetching**: API URL is injected via `window._env_` (runtime env config), likely consumed via Axios (implied by dependencies).
    *   **Entry Point**: `src/index.js` -> `src/app.js`.

*   **Backend (`apps/backend`)**:
    *   Spring Boot application serving REST APIs.
    *   Likely running on port 8080.

## 2. Core Modules & Data Flow
*   **Modules**: The frontend is modularized by "Screens" (`src/screens`) which likely map to business features (Invoice, Payroll, etc.).
*   **Data Flow**:
    1.  User interacts with `Screens`.
    2.  Actions are dispatched (Redux).
    3.  `services/` likely contains action creators that make API calls.
    4.  Store is updated, triggering re-renders.

## 3. Next.js Migration Plan
To fulfill the requirement "Ensure Next.js integration", we need to migrate `apps/frontend` from CRA to Next.js.

**Challenges:**
*   **Routing**: `react-router-dom` is client-side. Next.js is file-system based.
    *   *Strategy*: We will use Next.js "Optional Catch-all Routes" (`[[...slug]].js`) to incrementally migrate. We can keep the existing `react-router-dom` logic running *inside* a Next.js page for the `/admin` routes initially, then peel them off one by one.
*   **Global Object (`window`)**: Code relying on `window` (like the env injection) needs to be handled carefully in Server-Side Rendering (SSR) or restricted to `useEffect`.
*   **Styling**: `app.scss` and global styles need to be imported in `_app.js`.

## 4. Proposed Refactoring Steps
1.  **Dependency Swap**: Uninstall `react-scripts`, install `next`.
2.  **Entry Point Migration**:
    *   Move `src/index.js` logic (Providers) to `pages/_app.js`.
    *   Move `public/index.html` structure to `pages/_document.js`.
3.  **Routing Setup**:
    *   Create `pages/index.js` (Login/Initial).
    *   Create `pages/admin/[[...slug]].js` (Dashboard catch-all).
4.  **Environment Config**: Replace `window._env_` with Next.js `publicRuntimeConfig` or `NEXT_PUBLIC_` variables.

## 5. Tests
*   Existing tests use `react-scripts test` (Jest).
*   We will need to update the test runner configuration to work with Next.js (using `next/jest` or configuring Jest manually).
