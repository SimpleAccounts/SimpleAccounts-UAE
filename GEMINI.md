# Project Context: SimpleAccounts-UAE

## Overview
SimpleAccounts-UAE is a comprehensive accounting software solution designed for the UAE market. It is a monorepo containing a Java Spring Boot backend and a React frontend. The application supports features like invoicing, expense tracking, banking, and financial reporting.

## Architecture

### Frontend (`apps/frontend`)
*   **Current State:** Transitioning from Create React App (CRA) to **Next.js**.
*   **Core Framework:** React (upgraded to latest), Next.js (latest).
*   **Routing:**
    *   *Legacy:* `react-router-dom` v5 (Client-Side Routing).
    *   *Target:* Next.js File-system Routing (`pages/` directory).
    *   *Strategy:* Incremental migration using Optional Catch-all Routes (`[[...slug]].js`) to support legacy routes while migrating specific pages.
*   **State Management:** Redux with `redux-thunk`.
    *   Store configuration: `src/services/store.js`.
    *   Reducers: `src/services/reducer.js`.
*   **UI Libraries:**
    *   Material-UI (v4).
    *   CoreUI.
    *   Bootstrap 4 (`reactstrap`).
*   **Data Fetching:**
    *   Environment variables injected via `window._env_` (legacy) or `process.env` (Next.js).
    *   API Base URL: Configured in `src/constants/config.js`.
*   **Entry Points:**
    *   `src/index.js` (Legacy CRA entry).
    *   `src/app.js` (Main App component with Providers).
    *   *New Next.js Entry:* `pages/_app.js` (to be implemented).

### Backend (`apps/backend`)
*   **Framework:** Spring Boot 2.0.0.RELEASE.
*   **Language:** Java 8.
*   **Build Tool:** Maven.
*   **Database:** PostgreSQL / MySQL.
*   **Authentication:** JWT (JSON Web Tokens).
*   **API Documentation:** Swagger (Springfox).
*   **Key Configuration:** `src/main/resources/application.properties`.

### Deployment
*   **Containerization:** Docker (Docker Compose provided).
*   **Orchestration:** Kubernetes (Helm charts in `deploy/helm`).

## Development Workflow

### Prerequisites
*   **Node.js:** Required for the frontend and root scripts.
*   **Java Development Kit (JDK):** Version 8 is required for the backend.
*   **Maven:** Required for building the backend.
*   **Database:** Local PostgreSQL or MySQL instance.

### Installation
1.  Install Node.js dependencies from the root directory:
    ```bash
    npm install --legacy-peer-deps
    ```
    *Note: `--legacy-peer-deps` is currently required due to version conflicts between older UI libraries and React 18/19.*

### Running the Application

#### Frontend (Next.js Transition)
To start the frontend development server (Next.js):
```bash
cd apps/frontend
npm run dev
```
*Note: The `start` script has been replaced/updated for Next.js usage.*

#### Backend
To run the backend application:
```bash
npm run backend:run
```
*This executes the `apps/backend/run.sh` script.*

Alternatively, via Maven:
```bash
cd apps/backend
mvn spring-boot:run
```

### Building the Application

*   **Frontend Build:**
    ```bash
    cd apps/frontend
    npm run build
    ```
    *Generates Next.js production build.*

*   **Backend Build:**
    ```bash
    npm run backend:build
    ```

## Next.js Migration Plan (Active Task)
The project is currently undergoing a migration from Create React App to Next.js.

1.  **Dependencies:** `react-scripts` removed; `next`, `react` (latest), `react-dom` (latest) installed.
2.  **Routing Strategy:**
    *   Create `pages/index.js` for the landing/login page.
    *   Create `pages/admin/[[...slug]].js` to wrap the existing `AdminLayout` and handle all `/admin/*` routes via the legacy `react-router-dom` logic temporarily.
    *   Gradually peel off routes (e.g., `/admin/invoices`) into dedicated Next.js pages (e.g., `pages/admin/invoices.js`) to enable SSR/ISR features.
3.  **Environment Variables:** Migrate `window._env_` runtime injection to Next.js `publicRuntimeConfig` or `NEXT_PUBLIC_` environment variables.
4.  **Styling:** Move global CSS/SCSS imports (currently in `src/index.js` and `src/app.js`) to `pages/_app.js`.

## Key Directory Structure

*   `apps/frontend/`
    *   `pages/`: Next.js routes (To Be Created).
    *   `src/`: Legacy source code.
        *   `screens/`: Business logic views.
        *   `components/`: Reusable UI components.
        *   `services/`: Redux store and API logic.
        *   `routes/`: Legacy route definitions (`main.js`, `admin.js`).
*   `apps/backend/src/main/java/`: Spring Boot source code.
*   `deploy/`: Deployment configurations.

## Testing
*   **Frontend:** Jest (needs reconfiguration for Next.js environment).
    *   Command: `npm test` (in `apps/frontend`).
*   **Backend:** JUnit.