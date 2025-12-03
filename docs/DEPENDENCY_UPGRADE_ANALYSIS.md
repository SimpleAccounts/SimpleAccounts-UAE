# Dependency Upgrade Analysis - SimpleAccounts-UAE

**Document Version**: 1.0
**Analysis Date**: December 3, 2025
**Project**: SimpleAccounts-UAE

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Upgrade Categories](#upgrade-categories)
3. [Category 1: SAFE - Drop-in Upgrades](#category-1-safe---drop-in-upgrades)
4. [Category 2: MINOR BREAKING - Code Adjustments Required](#category-2-minor-breaking---code-adjustments-required)
5. [Category 3: MAJOR BREAKING - Significant Refactoring](#category-3-major-breaking---significant-refactoring)
6. [Category 4: AVOID - Do Not Upgrade Now](#category-4-avoid---do-not-upgrade-now)
7. [Category 5: MANDATORY - Security Critical](#category-5-mandatory---security-critical)
8. [Detailed Impact Analysis](#detailed-impact-analysis)
9. [Recommended Upgrade Roadmap](#recommended-upgrade-roadmap)
10. [Testing Strategy](#testing-strategy)

---

## Executive Summary

### Current State Overview

| Layer | Technology | Current Version | Target Version | Risk Level |
|-------|------------|-----------------|----------------|------------|
| Runtime | Java | 8 | 21 LTS | CRITICAL |
| Framework | Spring Boot | 2.0.0 | 3.3.x | CRITICAL |
| Runtime | Node.js | 16 | 20 LTS | LOW |
| Frontend | React | 18.2.0 | 18.3.1 | LOW |

### Quick Reference - Upgrade Priority Matrix

```
                    LOW EFFORT ─────────────────────────► HIGH EFFORT
                    │
    HIGH PRIORITY   │  [lodash]     [axios]        [JJWT]      [Spring Boot]
                    │  [moment]     [HttpClient]   [POI]       [React Router]
                    │                                          [Chart.js]
                    │
    LOW PRIORITY    │  [Lombok]     [commons-*]    [Redux]     [Class→Hooks]
                    │  [Node 20]    [PostgreSQL]   [MUI]
                    ▼
```

### Upgrade Readiness & Breakage Assessment

#### Java 8 → 21 LTS (Runtime & Toolchain)
- **Go / No-Go**: Proceed only after the Spring Boot 2.7.x intermediate hop; Boot 2.0.0 bundles Tomcat 8.5 which does not run on Java 21.
- **Critical Prerequisites**:
  - Update `pom.xml` (`<java.version>` and compiler plugin) and ensure all transitive libs (e.g., `ehcache`, `springfox-swagger2`) have Jakarta-compatible versions.
  - Replace every `javax.*` import in `apps/backend/src/main/java/**/*` with `jakarta.*` during the Boot 3 move.
  - Rebuild Docker/CI base images (`openjdk:21-jdk-slim`).
- **Likely Breakpoints**:
  - Reflection-heavy code in `com.simpleaccounts.security.*` and `com.simpleaccounts.config.*` that still references `sun.*` classes or uses CGLIB proxies.
  - The `frontend-maven-plugin` in `apps/backend/pom.xml` pins `node.version=v12.16.3`; this must be updated to `v20.x` or dropped before the backend build runs under Java 21.

#### Spring Boot 2.0.0 → 3.3.x (Framework)
- **Go / No-Go**: Good upgrade, but only after finishing Java 17+ support. Requires multi-step path `2.0 → 2.7 → 3.0 → 3.3`.
- **Hotspots**:
  - `WebSecurityConfig` (extends `WebSecurityConfigurerAdapter`) and every class under `com.simpleaccounts.security` will break because Boot 3 removes the adapter.
  - Controllers and filters importing `javax.servlet.*` (`com.simpleaccounts.filter.*`).
  - JPA entities under `com.simpleaccounts.domain` currently annotated with `javax.persistence`. All must switch to `jakarta.persistence`.
- **Secondary Impacts**:
  - `springfox-swagger2` 2.7.0 is incompatible with Spring Boot 3 / Springfox is EOL. Plan to migrate to `springdoc-openapi-starter-webmvc-ui`.
  - `javax.mail` must move to `jakarta.mail`.

#### Node.js 16 → 20 LTS (Frontend Runtime & Tooling)
- **Go / No-Go**: Safe once native build chain is aligned.
- **Watch Items**:
  - `apps/backend/pom.xml` embeds Node 12 via `frontend-maven-plugin`; update `node.version`/`yarn.version` or move JS build fully to the frontend workspace.
  - Ensure `node-gyp` consumers (transitive deps of `react-scripts` such as `react-scripts`'s `@svgr/webpack`) have prebuilt binaries for Node 20—run `npm ci` on macOS + CI Linux runners to confirm.
  - `package-lock.json` must be regenerated with npm 10 (bundled in Node 20) to avoid install drift.

#### React 18.2.0 → 18.3.1 (Frontend Framework)
- **Go / No-Go**: Safe; 18.3.1 is a minor patch but verify concurrent features.
- **Areas to Re-test**:
  - Suspense boundaries in `apps/frontend/src/layouts/admin/index.js` and `src/screens/**/index.js`.
  - Legacy class components using `UNSAFE_componentWillReceiveProps` should be checked for warnings because React 18.3 tightens StrictMode double-invocation.
  - Confirm `react-test-renderer` stays in lockstep (`^18.3.1`) to prevent hydration mismatch warnings.

#### React Router 5.0.1 → 6.x (Routing)
- **Decision**: High-risk, keep in backlog until class components are converted or wrapped.
- **Breakage Surface**:
  - 772 usages of `history.push` / `this.props.history` across `apps/frontend/src/routes`, `src/screens`, and `src/components`.
  - `react-router-config` is removed in v6; the `mainRoutes` arrays defined in `src/routes/admin.js` require a complete rewrite.

#### Chart.js 2.8.0 → 4.x
- **Watch Items**:
  - Each dashboard section (`apps/frontend/src/screens/dashboard/sections/**`) will need option rewrites (`scales.xAxes`→`scales.x` etc.).
  - Custom tooltip plugins under `@coreui/coreui-plugin-chartjs-custom-tooltips` must be revalidated because Chart.js 4 changes plugin signatures.

---

## Upgrade Categories

### Category Legend

| Category | Symbol | Meaning |
|----------|--------|---------|
| **SAFE** | ✅ | Drop-in replacement, no code changes |
| **MINOR BREAKING** | ⚠️ | Small code adjustments needed |
| **MAJOR BREAKING** | 🔴 | Significant refactoring required |
| **AVOID** | ⛔ | Do not upgrade at this time |
| **MANDATORY** | 🚨 | Security critical, must upgrade |

---

## Category 1: SAFE - Drop-in Upgrades

These upgrades can be performed immediately with no code changes.

### Backend - Java Dependencies

#### 1.1 Lombok
| Attribute | Value |
|-----------|-------|
| **Current** | 1.18.4 |
| **Target** | 1.18.30+ |
| **Files Affected** | 0 (compile-time only) |
| **Code Changes** | None |
| **Risk** | Very Low |

**Verification**:
```bash
# After upgrade, run:
mvn clean compile
# If builds successfully, upgrade is complete
```

#### 1.2 PostgreSQL Driver
| Attribute | Value |
|-----------|-------|
| **Current** | 42.4.0 |
| **Target** | 42.7.3 |
| **Files Affected** | 0 |
| **Code Changes** | None |
| **Risk** | Very Low |

**Notes**: Driver is backwards compatible. No API changes affect application code.

#### 1.3 Commons Libraries
| Library | Current | Target | Risk |
|---------|---------|--------|------|
| commons-csv | 1.4 | 1.10.0 | Very Low |
| commons-io | 2.6 | 2.15.1 | Very Low |
| commons-lang3 | 3.5 | 3.14.0 | Very Low |
| commons-collections4 | 4.1 | 4.4 | Very Low |

#### 1.4 Liquibase
| Attribute | Value |
|-----------|-------|
| **Current** | 4.5.0 |
| **Target** | 4.28.0 |
| **Files Affected** | 0 |
| **Risk** | Low |

**Notes**: Run existing migrations in test environment to verify compatibility.

### Frontend - NPM Dependencies

#### 1.5 Node.js Runtime
| Attribute | Value |
|-----------|-------|
| **Current** | 16 |
| **Target** | 20 LTS |
| **Files Affected** | .nvmrc, CI configs |
| **Code Changes** | None |
| **Risk** | Very Low |

**Actions Required**:
```bash
# Update .nvmrc
echo "20" > .nvmrc

# Update CI/CD configurations
# Update Dockerfile if applicable
```

#### 1.6 React (Minor Update)
| Attribute | Value |
|-----------|-------|
| **Current** | 18.2.0 |
| **Target** | 18.3.1 |
| **Files Affected** | 0 |
| **Code Changes** | None |

#### 1.7 Redux & Redux-Thunk
| Library | Current | Target | Risk |
|---------|---------|--------|------|
| redux | 4.0.4 | 4.2.1 | Very Low |
| redux-thunk | 2.3.0 | 2.4.2 | Very Low |

**Notes**: Minor version updates, fully backwards compatible.

#### 1.8 Sass
| Attribute | Value |
|-----------|-------|
| **Current** | 1.69.0 |
| **Target** | 1.77.8 |
| **Risk** | Very Low |

---

## Category 2: MINOR BREAKING - Code Adjustments Required

These upgrades require small, localized code changes.

### Backend Dependencies

#### 2.1 Apache HttpClient
| Attribute | Value |
|-----------|-------|
| **Current** | 4.5.1 |
| **Target** | 4.5.14 |
| **Severity** | HIGH (CVE-2020-13956) |
| **Files Affected** | 2 files (mostly commented out) |
| **Effort** | 1-2 hours |

**Files to Modify**:
- `apps/backend/src/main/java/com/simpleaccounts/service/impl/CurrencyExchangeImpl.java`
- `apps/backend/src/main/java/com/simpleaccounts/dao/impl/CurrencyExchangeDaoImpl.java`

**Current Code Pattern**:
```java
// Lines 47-58 (COMMENTED OUT but should be fixed)
CloseableHttpClient httpClient = HttpClientBuilder.create().build();
HttpPost httpPost = new HttpPost(url);
CloseableHttpResponse response = httpClient.execute(httpPost);
// ISSUE: No try-with-resources, potential resource leak
```

**Recommended Fix** (also fixes resource leak):
```java
try (CloseableHttpClient httpClient = HttpClients.createDefault();
     CloseableHttpResponse response = httpClient.execute(httpPost)) {
    String responseString = EntityUtils.toString(response.getEntity(), StandardCharsets.UTF_8);
}
```

**Alternative**: Replace with Spring's RestTemplate (already available):
```java
@Autowired
private RestTemplate restTemplate;

String response = restTemplate.postForObject(url, request, String.class);
```

#### 2.2 Apache POI
| Attribute | Value |
|-----------|-------|
| **Current** | 3.17 |
| **Target** | 5.2.5 |
| **Severity** | HIGH (CVE-2017-12626) |
| **Files Affected** | 20+ files |
| **Effort** | 4-8 hours |

**Files to Modify**:
- `apps/backend/src/main/java/com/simpleaccounts/utils/ExcelUtil.java`
- `apps/backend/src/main/java/com/simpleaccounts/parserengine/ExcelParser.java`
- Plus 18 additional files using Workbook/Sheet/Row/Cell

**Breaking Changes**:

| POI 3.17 | POI 5.x | Action |
|----------|---------|--------|
| `HSSFWorkbook` | Same | No change |
| `XSSFWorkbook` | Same | No change |
| `WorkbookFactory.create()` | Same | No change |
| `InvalidFormatException` | Changed package | Update import |
| Some deprecated methods | Removed | Use alternatives |

**Current Code** (`ExcelUtil.java:45-70`):
```java
try (Workbook workbook = WorkbookFactory.create(file)) {
    DataFormatter dataFormatter = new DataFormatter();
    workbook.forEach(sheet -> {
        sheet.forEach(row -> {
            row.forEach(cell -> {
                String cellValue = dataFormatter.formatCellValue(cell);
                // ... processing
            });
        });
    });
}
```

**Status**: This pattern is compatible with POI 5.x. Main changes needed:
1. Update import statements
2. Update exception handling
3. Test with existing Excel files

#### 2.3 iText PDF (Dependency Cleanup)
| Attribute | Value |
|-----------|-------|
| **Current** | Mixed 5.x + 7.x (CONFLICT) |
| **Target** | 7.2.x only |
| **Files Affected** | 1 file + pom.xml |
| **Effort** | 1-2 hours |

**Issue**: pom.xml declares BOTH iText 5.5.13.2 AND 7.1.12 - this is a conflict.

**File Using iText** (`MailUtility.java:265-271`):
```java
public static byte[] writePdf(OutputStream outputStream, String body) throws Exception {
    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
    HtmlConverter.convertToPdf(body, buffer);  // Uses iText 7 html2pdf
    return buffer.toByteArray();
}
```

**Required Changes**:
1. Remove iText 5.x from pom.xml (lines 221-222)
2. Keep only kernel 7.1.12 and html2pdf 3.0.1
3. Update to html2pdf 4.0.x for security fixes

### Frontend Dependencies

#### 2.4 Axios
| Attribute | Value |
|-----------|-------|
| **Current** | 0.21.1 |
| **Target** | 1.7.x |
| **Severity** | HIGH (CVE-2024-39338 SSRF) |
| **Files Affected** | 4 core files |
| **Effort** | 2-4 hours |

**Files to Modify**:
- `apps/frontend/src/utils/api.js`
- `apps/frontend/src/utils/auth_api.js`
- `apps/frontend/src/utils/auth_fileupload_api.js`
- `apps/frontend/src/services/global/common/actions.js`

**Breaking Changes**:

| axios 0.x | axios 1.x | Impact |
|-----------|-----------|--------|
| `error.response` | Same | Compatible |
| Default headers | `AxiosHeaders` object | May need adjustment |
| Interceptors | Same API | Compatible |
| `baseURL` | Same | Compatible |

**Current Code** (`auth_api.js`):
```javascript
import axios from 'axios';
import config from '../constants/config';

const authApi = axios.create({
  baseURL: config.API_ROOT_URL,
});

authApi.interceptors.request.use((config) => {
  config.headers.Authorization = 'Bearer ' + localStorage.getItem('accessToken');
  return config;
});

authApi.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response && err.response.status === 401) {
      localStorage.clear();
      window.location = '/login';
    }
    return Promise.reject(err);
  }
);
```

**Required Changes**:
1. Test interceptors with new version
2. Update error handling if `error.response` structure changed
3. Verify `config.headers` assignment still works

#### 2.5 Lodash
| Attribute | Value |
|-----------|-------|
| **Current** | 4.17.15 |
| **Target** | 4.17.21 |
| **Severity** | HIGH (Prototype Pollution) |
| **Files Affected** | 20+ files |
| **Effort** | 1 hour |

**Breaking Changes**: None - this is a security patch release.

**Usage Found**:
```javascript
import { upperFirst } from 'lodash-es';
// Used in form validation and display
```

**Action**: Direct drop-in upgrade. No code changes needed.

#### 2.6 Moment.js
| Attribute | Value |
|-----------|-------|
| **Current** | 2.24.0 |
| **Target** | 2.30.1 |
| **Severity** | MEDIUM (CVE-2022-24785) |
| **Files Affected** | 20+ files |
| **Effort** | 1 hour |

**Breaking Changes**: None - patch release for security fixes.

**Note**: Moment is in maintenance mode. Consider migration to `date-fns` or `dayjs` in future.

---

## Category 3: MAJOR BREAKING - Significant Refactoring

These upgrades require substantial development effort and should be planned carefully.

### Backend Dependencies

#### 3.1 JJWT (JWT Library)
| Attribute | Value |
|-----------|-------|
| **Current** | 0.9.1 |
| **Target** | 0.12.x or 0.13.x |
| **Severity** | CRITICAL (Multiple CVEs) |
| **Files Affected** | 3 files |
| **Effort** | 8-16 hours |

**Files Requiring Complete Rewrite**:
1. `apps/backend/src/main/java/com/simpleaccounts/security/JwtTokenUtil.java`
2. `apps/backend/src/main/java/com/simpleaccounts/security/JwtRequestFilter.java`
3. `apps/backend/src/main/java/com/simpleaccounts/security/JwtAuthenticationController.java`

**API Changes (0.9.1 → 0.12.x)**:

| JJWT 0.9.1 (Old) | JJWT 0.12.x (New) |
|------------------|-------------------|
| `Jwts.builder()` | `Jwts.builder()` (same) |
| `.signWith(SignatureAlgorithm.HS512, secret)` | `.signWith(key, Jwts.SIG.HS512)` |
| `Jwts.parser().setSigningKey(secret)` | `Jwts.parser().verifyWith(key).build()` |
| `.parseClaimsJws(token)` | `.parseSignedClaims(token)` |
| `.getBody()` | `.getPayload()` |
| `Claims` interface | `Claims` (same) |

**Current Code** (`JwtTokenUtil.java:74-78`):
```java
private String doGenerateToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .setClaims(claims)
        .setSubject(subject)
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
        .signWith(SignatureAlgorithm.HS512, secret)  // OLD API
        .compact();
}
```

**Required New Code**:
```java
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;

// In class initialization:
private SecretKey key;

@PostConstruct
public void init() {
    this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
}

private String doGenerateToken(Map<String, Object> claims, String subject) {
    return Jwts.builder()
        .claims(claims)
        .subject(subject)
        .issuedAt(new Date(System.currentTimeMillis()))
        .expiration(new Date(System.currentTimeMillis() + JWT_TOKEN_VALIDITY * 1000))
        .signWith(key, Jwts.SIG.HS512)  // NEW API
        .compact();
}
```

**Current Code** (`JwtTokenUtil.java:55-56`):
```java
private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser()
        .setSigningKey(secret)           // OLD API
        .parseClaimsJws(token)           // OLD API
        .getBody();                       // OLD API
}
```

**Required New Code**:
```java
private Claims getAllClaimsFromToken(String token) {
    return Jwts.parser()
        .verifyWith(key)                  // NEW API
        .build()                          // NEW API
        .parseSignedClaims(token)         // NEW API
        .getPayload();                    // NEW API
}
```

#### 3.2 Spring Boot (Framework Upgrade)
| Attribute | Value |
|-----------|-------|
| **Current** | 2.0.0.RELEASE |
| **Target** | 3.3.x |
| **Severity** | CRITICAL (EOL, Multiple CVEs) |
| **Files Affected** | 300+ files |
| **Effort** | 40-80 hours |

**Recommended Upgrade Path**:
```
2.0.0 → 2.7.x (LTS) → 3.0.x → 3.3.x
```

**Major Breaking Changes**:

| Spring Boot 2.x | Spring Boot 3.x | Impact |
|-----------------|-----------------|--------|
| Java 8+ | Java 17+ required | Must upgrade Java |
| `javax.*` packages | `jakarta.*` packages | All imports change |
| `WebSecurityConfigurerAdapter` | `SecurityFilterChain` bean | Security rewrite |
| `@EnableGlobalMethodSecurity` | `@EnableMethodSecurity` | Annotation change |
| Spring Security 5.x | Spring Security 6.x | Auth changes |

**Current Security Configuration** (`WebSecurityConfig.java`):
```java
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf().disable()
            .authorizeRequests()
            .antMatchers("/public/**").permitAll()
            .antMatchers("/rest/**").authenticated();
    }
}
```

**Required New Code** (Spring Security 6.x):
```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/rest/**").authenticated()
            );
        return http.build();
    }
}
```

**Package Migration Required**:
```bash
# All javax.* imports must change to jakarta.*
javax.persistence → jakarta.persistence
javax.validation → jakarta.validation
javax.servlet → jakarta.servlet
# This affects 100+ files
```

#### 3.3 Java Runtime
| Attribute | Value |
|-----------|-------|
| **Current** | 8 |
| **Target** | 21 LTS |
| **Severity** | CRITICAL (EOL July 2025) |
| **Files Affected** | Build configs, Dockerfile |
| **Effort** | 8-16 hours (testing) |

**Files to Update**:
- `pom.xml` - java.version property
- `Dockerfile` - base image
- CI/CD configurations
- `.java-version` (if present)

**Testing Required**:
1. Compile with Java 21
2. Run all unit tests
3. Run integration tests
4. Load testing for performance verification

### Frontend Dependencies

#### 3.4 React Router (v5 → v6)
| Attribute | Value |
|-----------|-------|
| **Current** | 5.0.1 |
| **Target** | 6.x |
| **Severity** | HIGH (Security) |
| **Files Affected** | 11+ routing files, 100+ route definitions |
| **Effort** | 24-40 hours |

**CRITICAL**: This is a complete API rewrite with no backwards compatibility.

**Files Requiring Major Changes**:
- `apps/frontend/src/app.js` - Main router setup
- `apps/frontend/src/routes/admin.js` - 100+ routes
- `apps/frontend/src/layouts/admin/index.js`
- All components using `history.push()`

**API Changes**:

| React Router v5 | React Router v6 | Impact |
|-----------------|-----------------|--------|
| `<Switch>` | `<Routes>` | All route wrappers |
| `<Route component={X}>` | `<Route element={<X/>}>` | All routes |
| `<Redirect to="/">` | `<Navigate to="/" replace>` | All redirects |
| `useHistory()` | `useNavigate()` | All navigation |
| `history.push('/path')` | `navigate('/path')` | 772 occurrences! |
| `withRouter(Component)` | hooks only | Class components broken |

**Current Code** (`app.js`):
```javascript
import { Router, Route, Switch } from 'react-router-dom';
import { createBrowserHistory } from 'history';

const hist = createBrowserHistory();

<Router history={hist}>
  <Switch>
    {mainRoutes.map(prop => (
      <Route path={prop.path} component={prop.component} />
    ))}
  </Switch>
</Router>
```

**Required New Code**:
```javascript
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<BrowserRouter>
  <Routes>
    {mainRoutes.map(prop => (
      <Route path={prop.path} element={<prop.component />} />
    ))}
  </Routes>
</BrowserRouter>
```

**BLOCKER**: 256 class components use `this.props.history.push()`. React Router v6 only supports hooks, which require functional components.

**Options**:
1. Stay on v5 (not recommended - security issues)
2. Create wrapper for class components
3. Convert class components to functional (massive effort)

#### 3.5 Chart.js (v2 → v4)
| Attribute | Value |
|-----------|-------|
| **Current** | 2.8.0 / react-chartjs-2 2.11.2 |
| **Target** | 4.x / react-chartjs-2 5.x |
| **Severity** | MEDIUM |
| **Files Affected** | 6 dashboard files, 16 chart instances |
| **Effort** | 8-16 hours |

**Files to Modify**:
- `apps/frontend/src/screens/dashboard/sections/invoice/index.js`
- `apps/frontend/src/screens/dashboard/sections/revenue_expense/index.js`
- `apps/frontend/src/screens/dashboard/sections/bank_account/index.js`
- `apps/frontend/src/screens/dashboard/sections/cash_flow/index.js`
- `apps/frontend/src/screens/dashboard/sections/paid_invoices/index.js`

**Breaking Changes**:

| Chart.js 2.x | Chart.js 4.x | Impact |
|--------------|--------------|--------|
| Auto-registration | Manual registration required | Setup code |
| `scales.xAxes[{...}]` | `scales.x: {...}` | All options |
| `scales.yAxes[{...}]` | `scales.y: {...}` | All options |
| `tooltips: {...}` | `plugins.tooltip: {...}` | All tooltips |
| `legend: {...}` | `plugins.legend: {...}` | All legends |

**Current Code** (`invoice/index.js`):
```javascript
const invoiceOption = {
  tooltips: { enabled: true },                    // OLD
  legend: { display: true, position: 'right' },   // OLD
  scales: {
    xAxes: [{ stacked: true }],                   // OLD
    yAxes: [{ stacked: true }]                    // OLD
  }
};
```

**Required New Code**:
```javascript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const invoiceOption = {
  plugins: {
    tooltip: { enabled: true },                   // NEW
    legend: { display: true, position: 'right' }  // NEW
  },
  scales: {
    x: { stacked: true },                         // NEW
    y: { stacked: true }                          // NEW
  }
};
```

---

## Category 4: AVOID - Do Not Upgrade Now

These upgrades are either unnecessary, risky, or have better alternatives.

### 4.1 Redux → Redux Toolkit
| Attribute | Value |
|-----------|-------|
| **Current** | redux 4.0.4 |
| **Alternative** | @reduxjs/toolkit |
| **Recommendation** | AVOID for now |

**Reason**:
- Current Redux setup works correctly
- 256 components use `connect()` HOC pattern
- Migration requires converting to hooks (useSelector/useDispatch)
- Would require converting class → functional components
- ROI is low for a working system

**Future Consideration**: Only migrate when converting components to functional.

### 4.2 Material-UI v4 → MUI v5 (Full Migration)
| Attribute | Value |
|-----------|-------|
| **Current** | @material-ui/core 4.11.0 + @mui/material 5.3.1 |
| **Recommendation** | AVOID full migration |

**Current State**: Both v4 and v5 are installed. Only minimal usage of MUI components.

**Reason to Avoid**:
- Components use both versions already
- Low usage count (76 occurrences)
- Would require changing styling approach (makeStyles → styled)
- Not worth the effort for current usage level

**Recommended Action**:
- Keep both for now
- For new components, use @mui/material 5.x
- Don't convert existing @material-ui code

### 4.3 Class Components → Functional Components
| Attribute | Value |
|-----------|-------|
| **Current** | 256 class components |
| **Target** | Functional with hooks |
| **Recommendation** | AVOID mass conversion |

**Reason**:
- All class components work correctly
- Massive effort (256 files)
- High regression risk
- No immediate security benefit

**Future Consideration**: Convert incrementally when touching files for other reasons.

### 4.4 Moment.js → date-fns/dayjs
| Attribute | Value |
|-----------|-------|
| **Current** | moment 2.24.0 |
| **Alternative** | date-fns or dayjs |
| **Recommendation** | AVOID for now |

**Reason**:
- Moment upgrade to 2.30.1 fixes security issues
- 851 occurrences of moment() calls
- Different API would require extensive testing
- Bundle size reduction not critical priority

**Recommended Action**: Upgrade moment to 2.30.1 (security fix), plan alternative migration for future.

---

## Category 5: MANDATORY - Security Critical

These upgrades MUST be performed to address active security vulnerabilities.

### Priority 1 - Immediate (This Sprint)

| Package | Current | Target | CVE/Issue | Risk |
|---------|---------|--------|-----------|------|
| **JJWT** | 0.9.1 | 0.12.x+ | CVE-2024-31033, CVE-2022-21449 | Auth bypass |
| **axios** | 0.21.1 | 1.7.x | CVE-2024-39338 | SSRF attack |
| **lodash** | 4.17.15 | 4.17.21 | Prototype pollution | Code injection |
| **Apache HttpClient** | 4.5.1 | 4.5.14 | CVE-2020-13956 | Security bypass |

### Priority 2 - High (Next 2 Weeks)

| Package | Current | Target | CVE/Issue | Risk |
|---------|---------|--------|-----------|------|
| **moment** | 2.24.0 | 2.30.1 | CVE-2022-24785 | Path traversal |
| **Apache POI** | 3.17 | 5.2.5 | CVE-2017-12626 | DoS attack |
| **Node.js** | 16 | 20 LTS | EOL April 2024 | No security patches |

### Priority 3 - Planned (1-2 Months)

| Package | Current | Target | Issue | Risk |
|---------|---------|--------|-------|------|
| **Java** | 8 | 21 LTS | EOL July 2025 | No security patches |
| **Spring Boot** | 2.0.0 | 3.3.x | Multiple CVEs | Framework vulnerabilities |

---

## Detailed Impact Analysis

### Backend Impact Summary

| Component | Files | Lines Changed | Test Coverage Needed |
|-----------|-------|---------------|---------------------|
| JWT Security | 3 | ~150 | Authentication flow |
| HttpClient | 2 | ~20 | Currency exchange |
| POI/Excel | 20+ | ~100 | File upload/export |
| Spring Boot | 300+ | ~2000 | Full regression |
| iText PDF | 1 + pom | ~10 | PDF generation |

### Frontend Impact Summary

| Component | Files | Components | Test Coverage Needed |
|-----------|-------|------------|---------------------|
| axios | 4 | API layer | All API calls |
| React Router | 11+ | 100+ routes | Navigation flow |
| Chart.js | 6 | 16 charts | Dashboard visuals |
| moment | 20+ | Date handling | Date display/logic |
| lodash | 20+ | Utilities | Form validation |

---

## Recommended Upgrade Roadmap

### Phase 1: Security Patches (Week 1-2)
**Zero/Low Breaking Changes**

```
Day 1-2:
├── lodash 4.17.15 → 4.17.21 (drop-in)
├── moment 2.24.0 → 2.30.1 (drop-in)
├── Lombok 1.18.4 → 1.18.30 (drop-in)
└── commons-* libraries (drop-in)

Day 3-5:
├── axios 0.21.1 → 1.7.x (test interceptors)
├── Apache HttpClient 4.5.1 → 4.5.14 (minor fixes)
└── Node.js 16 → 20 (runtime only)

Day 6-10:
├── JJWT 0.9.1 → 0.12.x (rewrite JWT code)
└── Full authentication testing
```

### Phase 2: Medium Effort Upgrades (Week 3-4)
**Minor Breaking Changes**

```
Day 1-5:
├── Apache POI 3.17 → 5.2.5
├── Test all Excel import/export
└── iText cleanup (remove 5.x)

Day 6-10:
├── PostgreSQL driver 42.4.0 → 42.7.3
├── Liquibase 4.5.0 → 4.28.0
└── Run all migrations in test
```

### Phase 3: Major Upgrades (Month 2-3)
**Requires Significant Planning**

```
Week 1-2:
├── Java 8 → 17 (intermediate step)
├── Update build configs
└── Performance testing

Week 3-4:
├── Spring Boot 2.0 → 2.7.x (LTS)
├── Update deprecated APIs
└── Full regression testing

Week 5-6:
├── Spring Boot 2.7 → 3.0.x
├── javax → jakarta migration
├── Security configuration rewrite
└── Integration testing

Week 7-8:
├── Spring Boot 3.0 → 3.3.x
├── Java 17 → 21 (optional)
└── Final testing
```

### Phase 4: Frontend Major Upgrades (Month 3-4)
**High Effort - Plan Carefully**

```
Option A: React Router Migration
├── Week 1-2: Create navigation wrapper for class components
├── Week 3-4: Migrate all routes
└── Week 5-6: Testing and fixes

Option B: Chart.js Migration
├── Week 1: Update chart configurations
├── Week 2: Test all dashboard charts
└── Week 3: Fix visual regressions
```

### Inter-Phase Exit Criteria (Safest Possible Rollout)

| Gate | When | Exit Criteria | Owner |
|------|------|---------------|-------|
| **G0 - Pre-Work** | Before Phase 1 | Backlog tickets created, sample data sets prepared, baseline metrics captured (auth success %, Excel upload time). | Tech Lead |
| **G1 - Post Phase 1** | After security patches | `mvn clean compile` + Playwright smoke green, no new Sentry errors for 48 hours, regression checklist signed. | QA Lead |
| **G2 - Post Phase 2** | After medium upgrades | POI import/export and PDF flows pass on QA & Staging, Liquibase dry-run logs archived, DB backups verified. | Backend Lead |
| **G3 - Post Phase 3** | After Java/Spring upgrades | Load test (k6) shows ≤5% latency regression, actuator health endpoints monitored, canary deployment stable for 72 hours. | DevOps |
| **G4 - Post Phase 4** | After frontend majors | Navigation + chart suites pass on desktop + tablet breakpoints, A/B analytics show <1% drop in funnel metrics. | Frontend Lead |

**Rollback Point**: After every gate, create a git tag (`release/<phase>-accepted`) and a database snapshot so we can revert quickly if the next phase fails.

---

## Testing Strategy

### Safe Upgrade Execution Workflow

**CRITICAL WARNING: Lack of Automated Tests**
Scan of the codebase reveals **NO backend unit tests** (`src/test` is missing) and only a minimal frontend smoke test.
**YOU CANNOT RELY ON `mvn test` OR `npm test` TO CATCH BREAKING CHANGES.**
Verification **MUST** be manual and runtime-based.

For **every single** dependency upgrade, follow this strict loop:

1.  **Pre-Check (Manual Baseline)**:
    *   **Backend:** Start the app (`npm run backend:run`). Verify you can Login and fetch the Dashboard.
    *   **Frontend:** Start the app (`npm start`). Click through the specific feature related to the upgrade (e.g., for `axios`, try to Login; for `chart.js`, view Dashboard).
2.  **Upgrade**: Change **one** dependency version.
3.  **Verify (Runtime Check)**:
    *   **Frontend:**
        *   Run `npm run build` (Catches compilation/transpilation errors).
        *   Run `npm start` -> **Manually test the feature**.
    *   **Backend:**
        *   Run `mvn clean compile` (Catches API breakages like Lombok/JJWT).
        *   Run `mvn spring-boot:run` -> **Wait for "Started Application in X seconds"**.
        *   **Manually test**: Use Postman or the Frontend to hit the affected API endpoints.
4.  **Commit**: `git commit -am "chore(deps): upgrade <package> to <version>"`

### Test Environment Matrix & Tooling

| Environment | Purpose | Data Set | Tooling & Automation Hooks |
|-------------|---------|----------|----------------------------|
| **Local Dev (macOS/Linux)** | Fast feedback for individual upgrades | Sanitized developer snapshot of UAE tenant | `mvn spring-boot:run`, `npm start`, Playwright smoke scripts (`npm run smoke:local`) |
| **CI - Pull Request** | Compile + lint gate | Synthetic fixtures | GitHub Actions + `mvn -B clean verify`, `npm run build`, `npm run lint` (enable ESLint) |
| **QA Sandbox** | Manual exploratory + regression | Obfuscated prod export refreshed weekly | Docker Compose stack (`docker compose up api frontend db`) + Postman collection + Cypress dashboard smoke suite |
| **Staging / UAT** | Pre-prod validation, performance | Near-real prod clone | Blue/Green deployment via Argo CD (target environment variable `ENV=staging`), load tests (`k6 run load.js`) |
| **Canary Prod Slice** | Real-user validation for high-risk upgrades (JJWT, Spring Boot) | Live traffic (5-10% routed) | Feature flag using `env.PROTECTED_API_VERSION=v2`, CloudWatch alarms, rollback script `scripts/rollback.sh` |

**Required Action**: Document the versions deployed to each environment in `docs/RELEASE_LOG.md` so we can trace regressions back to a specific dependency bump.

### Per-Upgrade Test Charters

| Dependency | Primary Scenarios | Negative / Edge Cases | Tooling |
|------------|------------------|-----------------------|---------|
| **JJWT 0.12.x** | Login, token refresh, accessing `/rest/**` endpoints | Expired token, tampered signature, concurrent logins | Postman collection `collections/Auth.json`, automated test `JwtTokenUtilTest` |
| **Apache HttpClient 4.5.14** | Currency conversion API call (`CurrencyExchangeImpl.fetchLatestRate`) | Remote API timeout, 500 response, malformed JSON | WireMock stub (`tests/mocks/exchange.json`), unit test `CurrencyExchangeImplTest` |
| **Apache POI 5.2.5** | Upload sample XLSX in `apps/backend/sample-data/supplier-rate.xlsx`, export `SalesReport` | Corrupt file upload, mixed XLS/XLSX, formulas | Selenium script `tests/e2e/excel-upload.spec.ts` |
| **axios 1.7.x** | Login, file upload, pagination requests, global error banner | 401 → redirect to `/login`, network offline, 413 payload | Playwright spec `tests/e2e/api-interceptors.spec.ts`, mock server |
| **lodash / moment patches** | Form validations, date pickers, dashboard filters | Invalid date strings (`31/02`), prototype pollution attempt via query params | Jest unit tests in `src/utils/__tests__` |
| **Node 20 runtime** | `npm ci`, `npm run build`, `npm run test` | Native module compilation failures, memory usage >1.5 GB | GitHub Actions matrix (`node: {18,20}`) |
| **Spring Boot 3.x** | Full CRUD flows, scheduled jobs, email with PDF attachments | Lazy-loaded Hibernate entities, `@Async` methods, actuator endpoints | Rest-Assured integration suite, MailHog |

Each charter must produce a short execution note (owner, date, pass/fail, blocking defects) stored under `docs/testing/<phase>/<dependency>.md`.

### Observability & Rollback Hooks
- **Logging**: Increase log level to DEBUG around `com.simpleaccounts.security` and `com.simpleaccounts.integrations` during the first 48 hours after deploying high-risk upgrades.
- **Metrics**: Add Grafana dashboards that track login success rate, API latency (P95), and Excel import failure counts; tag metrics with `build.deps.<name>=<version>`.
- **Feature Flags**: For JWT and routing changes, guard new code paths behind `FeatureFlagService`. Allows instant rollback without redeploying.
- **Rollback Script**: `scripts/rollback.sh <env> <git_sha>` stops the service, checks out the previous tag, re-applies Liquibase rollback if needed, and restarts. Keep this script tested weekly.

### Unit Tests Required

```
Backend:
├── JwtTokenUtilTest.java - Token generation/validation
├── JwtRequestFilterTest.java - Filter chain
├── ExcelUtilTest.java - Excel parsing
├── MailUtilityTest.java - PDF generation
└── CurrencyExchangeTest.java - HTTP calls

Frontend:
├── api.test.js - Axios interceptors
├── routing.test.js - Navigation flows
├── chart.test.js - Dashboard charts
└── dateUtils.test.js - Moment usage
```

### Integration Tests Required

```
Backend:
├── Authentication flow (login → token → protected route)
├── File upload/download (Excel, PDF)
├── Email with PDF attachment
└── All REST endpoints

Frontend:
├── Login → Dashboard navigation
├── All CRUD operations
├── Report generation
└── Chart data loading
```

### Regression Testing Checklist

```
[ ] User can log in
[ ] JWT token refreshes correctly
[ ] Protected routes require authentication
[ ] Excel files upload correctly
[ ] Excel files download correctly
[ ] PDF reports generate correctly
[ ] Email attachments work
[ ] Dashboard charts display
[ ] All date displays correct
[ ] Form validations work
[ ] Navigation between screens works
[ ] API error handling works
```

---

## Appendix A: File Reference

### Backend Files Requiring Changes

```
Security (JWT):
├── src/main/java/com/simpleaccounts/security/JwtTokenUtil.java
├── src/main/java/com/simpleaccounts/security/JwtRequestFilter.java
├── src/main/java/com/simpleaccounts/security/JwtAuthenticationController.java
└── src/main/java/com/simpleaccounts/security/WebSecurityConfig.java

Excel/POI:
├── src/main/java/com/simpleaccounts/utils/ExcelUtil.java
├── src/main/java/com/simpleaccounts/parserengine/ExcelParser.java
└── 18+ additional files

HTTP Client:
├── src/main/java/com/simpleaccounts/service/impl/CurrencyExchangeImpl.java
└── src/main/java/com/simpleaccounts/dao/impl/CurrencyExchangeDaoImpl.java

PDF:
└── src/main/java/com/simpleaccounts/utils/MailUtility.java

Build:
└── pom.xml
```

### Frontend Files Requiring Changes

```
API Layer:
├── src/utils/api.js
├── src/utils/auth_api.js
├── src/utils/auth_fileupload_api.js
└── src/services/global/common/actions.js

Routing:
├── src/app.js
├── src/routes/admin.js
└── src/layouts/admin/index.js

Charts:
├── src/screens/dashboard/sections/invoice/index.js
├── src/screens/dashboard/sections/revenue_expense/index.js
├── src/screens/dashboard/sections/bank_account/index.js
├── src/screens/dashboard/sections/cash_flow/index.js
└── src/screens/dashboard/sections/paid_invoices/index.js

Build:
├── package.json
└── .nvmrc
```

---

## Appendix B: Quick Reference Commands

### Check Current Versions

```bash
# Backend
cd apps/backend
mvn dependency:tree | grep -E "(jjwt|poi|httpclient|spring-boot)"

# Frontend
cd apps/frontend
npm list axios react-router-dom moment lodash chart.js redux
```

### Test After Upgrade

```bash
# Backend
mvn clean test
mvn spring-boot:run

# Frontend
npm test
npm run build
npm start
```

### Rollback Commands

```bash
# Git rollback
git checkout -- pom.xml
git checkout -- package.json package-lock.json

# Reinstall dependencies
mvn clean install -U
npm ci
```

---

**Document Maintained By**: Development Team
**Last Updated**: December 3, 2025
**Next Review Date**: January 2026
