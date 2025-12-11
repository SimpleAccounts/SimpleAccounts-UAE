# Lessons Learned

This document captures important lessons learned during development to prevent recurring issues.

---

## Table of Contents

1. [History Package Version Mismatch](#1-history-package-version-mismatch)
2. [Apache POI / Java 17 Compatibility](#2-apache-poi--java-17-compatibility)
3. [SonarQube SSL Configuration in Coolify](#3-sonarqube-ssl-configuration-in-coolify)
4. [Java Dependency Version Validity & API Stability](#4-java-dependency-version-validity--api-stability)

---

## 1. History Package Version Mismatch

**Date:** December 2025

**Issue:** Page navigation stopped working after React 18 upgrade - clicking on menu items or links did not navigate to new pages.

**Root Cause:**
The `history` package was upgraded from `^4.10.1` to `^5.3.0` as part of dependency updates. However, `react-router-dom` v5.x is only compatible with `history` v4.x, not v5.x.

**Symptoms:**

- Clicking navigation links did not change the page
- No errors in console (silent failure)
- URL might change but component did not re-render
- Browser back/forward buttons didn't work correctly

**Technical Details:**

- `history` v5.x introduced breaking changes in its API
- `react-router-dom` v5.x uses `history.listen()` with a different signature than v5.x provides
- In history v4.x: `history.listen((location, action) => {})`
- In history v5.x: `history.listen(({ location, action }) => {})`

**Solution:**
Downgrade the history package from v5.x to v4.x:

```json
// package.json
{
  "dependencies": {
    "history": "^4.10.1", // NOT "^5.3.0"
    "react-router-dom": "^5.3.4"
  }
}
```

**Prevention:**

1. When upgrading React Router, check the required `history` version in its peer dependencies
2. Only upgrade to `history` v5.x when also upgrading to `react-router-dom` v6.x
3. Test navigation thoroughly after any routing-related package updates
4. Review the compatibility matrix before upgrading interdependent packages

**Related Packages:**

- `react-router-dom`: v5.3.4
- `history`: v4.10.1 (required for react-router-dom v5.x)
- `react-router`: v5.3.4

**References:**

- [React Router v5 to v6 Migration Guide](https://reactrouter.com/en/main/upgrading/v5)
- [History Package Changelog](https://github.com/remix-run/history/blob/main/CHANGES.md)

---

## 2. Apache POI / Java 17 Compatibility

**Date:** December 2025

**Issue:** Excel-related tests fail in CI with `ClassCastException` when writing and reading back Excel files.

**Root Cause:**
Apache POI's `ZipSecureFile` class has compatibility issues with Java 17's module system. When writing an Excel file to a temp file and then reading it back using `WorkbookFactory.create()`, a ClassCastException occurs.

**Error Message:**

```
org.apache.poi.openxml4j.exceptions.OpenXML4JRuntimeException: Fail to save:
class org.apache.poi.openxml4j.util.ZipSecureFile$ThresholdInputStream cannot be cast to
class java.util.zip.ZipFile$ZipFileInputStream
```

**Affected Tests:**

- `ExcelUtilTest.testGetDataFromExcel`
- `ExcelParserTest.testReadExcelWithWorkbookFactory`

**Temporary Solution:**
Tests that write-then-read Excel files are skipped with `@Ignore` annotation in CI.

**Permanent Solution (TODO):**

1. Upgrade Apache POI to version 5.2.3+ which has better Java 17 support
2. Or use `try-with-resources` properly and ensure workbook is closed before reading
3. Consider using `SXSSFWorkbook` for streaming operations

**Prevention:**

- Test Excel operations with the same Java version used in CI
- Keep Apache POI updated to latest stable version
- Review POI release notes when upgrading Java versions

---

## 3. SonarQube SSL Configuration in Coolify

**Date:** December 2025

**Issue:** SonarQube analysis fails in GitHub Actions with SSL certificate hostname verification errors.

**Root Cause:**
When SonarQube is deployed via Coolify, Traefik (the reverse proxy) may serve its default self-signed certificate instead of a valid Let's Encrypt certificate. This happens when:

- The domain is not properly configured for SSL in Coolify
- Let's Encrypt challenge fails silently
- The service is accessed before SSL provisioning completes

**Error Message:**

```
Failed to query server version: Hostname sonar-xxx.sslip.io not verified:
    certificate: sha256/...
    DN: CN=TRAEFIK DEFAULT CERT
    subjectAltNames: [xxx.traefik.default]
```

**Current Workaround:**
The workflow continues despite SSL errors (`|| true`), but analysis doesn't upload.

**Permanent Solution (TODO):**

1. In Coolify, configure the SonarQube service:
   - Enable "Generate SSL" or "Let's Encrypt"
   - Ensure the domain resolves correctly
   - Wait for SSL certificate provisioning before using
2. Alternatively, use HTTP instead of HTTPS for internal CI communication
3. Or configure a custom SSL certificate

**Prevention:**

- Verify SSL certificate is valid before configuring CI/CD tools
- Use `curl -v https://your-domain` to check SSL configuration
- Monitor Coolify/Traefik logs for Let's Encrypt errors

---

## 4. Java Dependency Version Validity & API Stability

**Date:** December 2025

**Issue:** Backend tests failed with `NoSuchMethodError` for `commons-csv` and potential resolution issues for `commons-lang3` in CI environments.

**Root Cause:**

1. **Non-Existent Version:** `commons-csv` was bumped to `1.14.1` in `pom.xml`. As of 2025, the latest stable version is `1.13.0`. Specifying a non-existent version caused Maven to potentially fallback to an ancient transitive version (pre-1.3) which lacked newer methods like `withFirstRecordAsHeader()`.
2. **Deprecated API Usage:** The codebase used the deprecated `new CSVParser(...)` constructor, which is fragile across versions.
3. **Bleeding Edge Version:** `commons-lang3` was set to `3.20.0` (very recent). While valid, bleeding-edge versions may not yet be available in all CI/CD Maven mirrors, leading to sporadic build failures.

**Error Message:**

```
java.lang.NoSuchMethodError: org.apache.commons.csv.CSVFormat.withFirstRecordAsHeader()Lorg/apache/commons/csv/CSVFormat;
```

**Solution:**

1. **Downgrade to Stable:** Downgraded `commons-csv` to `1.10.0` and `commons-lang3` to `3.14.0` (proven stable versions).
2. **Refactor to Factory Methods:** Updated code to use the modern, non-deprecated API:

   ```java
   // OLD (Deprecated)
   CSVParser parser = new CSVParser(reader, CSVFormat.EXCEL);

   // NEW (Recommended)
   CSVParser parser = CSVFormat.EXCEL.parse(reader);
   ```

**Prevention:**

1. **Verify Versions:** Always verify a library version exists in Maven Central before adding it to `pom.xml`. Do not guess versions.
2. **Prefer Stable:** For core libraries (commons-\*, guava, etc.), prefer versions that have been out for at least a few months unless a specific bugfix/feature is needed.
3. **Address Deprecations:** Resolve deprecation warnings (`new CSVParser`) proactively to avoid breakage when libraries are eventually upgraded.
4. **Local vs CI:** If a build passes locally but fails in CI, check for version mismatches or mirrors not yet having the latest artifacts.

---

_Add new lessons learned above this line, following the same format._
