# Comprehensive Testing Strategy for Dependency Upgrades

**Document Version**: 1.0
**Date**: December 3, 2025
**Project**: SimpleAccounts-UAE

## 1. Objective
To establish a robust safety net that allows us to upgrade critical legacy dependencies (Spring Boot 2.0, Java 8, React 18) with confidence. This strategy prioritizes "High Value, Low Cost" tests that target the specific areas being upgraded.

## 2. Testing Pyramid Strategy

Given the current lack of tests, we will not aim for 100% coverage immediately. We will focus on **Regression Testing** for the upgrade targets.

### Layer 1: Backend Unit Tests (High Priority)
*Target: Logic-heavy utility classes.*
*   **Tools**: JUnit 4, Mockito.
*   **Focus**:
    *   `JwtTokenUtil`: Verify token generation and parsing logic (Critical for `jjwt` upgrade).
    *   `ExcelUtil`: Verify Excel parsing logic (Critical for `poi` upgrade).
    *   `CurrencyExchangeImpl`: Verify HTTP request logic (Critical for `httpclient` upgrade).

### Layer 2: Backend Integration Tests (Medium Priority)
*Target: Controllers and Security Config.*
*   **Tools**: Spring Boot Test, MockMvc.
*   **Focus**:
    *   `JwtAuthenticationController`: Verify the login endpoint `/authenticate` actually returns a token.
    *   *Reasoning*: This validates that Spring Security, Jackson, and JJWT are all talking to each other correctly.

### Layer 3: Frontend Unit/Integration Tests (High Priority)
*Target: API Layer and Routing.*
*   **Tools**: Jest, React Testing Library.
*   **Focus**:
    *   `api.js` / `auth_api.js`: Verify Axios interceptors (headers, error handling) work.
    *   `Login.js`: Verify the form submits data correctly.

## 3. Test Execution Workflow (The "Safety Loop")

1.  **Baseline**: Run `mvn test` and `npm test` *before* any changes. All must pass.
2.  **Upgrade**: Modify `pom.xml` or `package.json`.
3.  **Verify**: Run tests again.
    *   **Pass**: Commit.
    *   **Fail**: Fix the code (not the test, unless the test is obsolete) until it passes.

## 4. Implementation Plan

### Step 1: Backend Test Infrastructure
Create standard Maven test structure:
*   `apps/backend/src/test/java/com/simpleaccounts/...`
*   `apps/backend/src/test/resources` (for sample Excel files)

### Step 2: Critical Backend Tests
*   `JwtTokenUtilTest.java`:
    *   `testGenerateToken()`
    *   `testValidateToken()`
*   `ExcelUtilTest.java`:
    *   `testReadExcel()`

### Step 3: Critical Frontend Tests
*   `utils/api.test.js`:
    *   Mock Axios.
    *   Test Request Interceptor (Authorization header).
    *   Test Response Interceptor (401 redirection).

---
**Status**: 
*   **Frontend**: ✅ READY. Baseline established. `npm test` passes.
*   **Backend**: ⚠️ BLOCKED. Baseline tests cannot run because the project (Java 8) does not compile on the current environment (Java 21). Backend upgrades must proceed with **Manual Runtime Verification** only until the environment is fixed or the project is upgraded to Java 17+.
