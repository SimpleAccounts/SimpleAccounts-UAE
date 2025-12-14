# Backend Migration Plan: Java 21 & Spring Boot 3.4.x

## Overview

This document outlines the migration strategy for upgrading the SimpleAccounts-UAE backend from Java 8/Spring Boot 2.0.0 to Java 21/Spring Boot 3.4.x.

## Current State Analysis

| Component   | Current Version   | Target Version   |
| ----------- | ----------------- | ---------------- |
| Java        | 1.8               | 21               |
| Spring Boot | 2.0.0.RELEASE     | 3.4.x            |
| jjwt        | 0.9.1             | 0.12.6           |
| Springfox   | 3.0.0             | SpringDoc 2.x    |
| EhCache     | 2.x               | Caffeine 3.x     |
| Apache POI  | 3.17              | 5.3.0            |
| HttpClient  | 4.5.14            | 5.x              |
| iText       | Mixed (5.x + 7.x) | 8.x (unified)    |
| javax.mail  | 1.6.2             | jakarta.mail 2.x |

## Impact Analysis

- **308 files** with javax imports requiring namespace migration
- **51 controllers** with Springfox annotations
- **1 WebSecurityConfig** using deprecated patterns

---

## Phase 1: Foundation & Preparation

### 1.1 Build Configuration Updates

- [ ] Update Java version to 21 in pom.xml
- [ ] Update maven-compiler-plugin source/target to 21
- [ ] Add Jakarta EE BOM for dependency management
- [ ] Update maven-surefire-plugin for JUnit 5 compatibility

### 1.2 CI/CD Preparation

- [ ] Update GitHub Actions to use Java 21
- [ ] Update Docker base images to Java 21
- [ ] Add migration validation workflow

---

## Phase 2: Spring Boot 3.4.x Core Migration

### 2.1 Spring Boot Parent Update

- [ ] Update spring-boot-starter-parent to 3.4.x
- [ ] Remove deprecated Spring Boot 2.x properties
- [ ] Update application.properties for Boot 3 compatibility

### 2.2 Jakarta Namespace Migration (javax → jakarta)

- [ ] Migrate javax.persistence → jakarta.persistence (entities)
- [ ] Migrate javax.servlet → jakarta.servlet (filters/controllers)
- [ ] Migrate javax.validation → jakarta.validation (validators)
- [ ] Migrate javax.annotation → jakarta.annotation
- [ ] Migrate javax.mail → jakarta.mail (email service)
- [ ] Migrate javax.xml.bind → jakarta.xml.bind (JAXB)

### 2.3 Spring Security Migration

- [ ] Replace WebSecurityConfigurerAdapter with SecurityFilterChain
- [ ] Update antMatchers() to requestMatchers()
- [ ] Update authorizeRequests() to authorizeHttpRequests()
- [ ] Migrate JWT filter to new security patterns

### 2.4 Spring Data JPA Migration

- [ ] Update Hibernate 6 compatibility
- [ ] Review lazy loading behavior changes
- [ ] Update query methods for Hibernate 6

---

## Phase 3: Security Library Updates

### 3.1 JWT Library Migration (jjwt 0.9.1 → 0.12.6)

- [ ] Update jjwt dependencies to modular structure
- [ ] Migrate JwtTokenUtil to new API
- [ ] Update token generation methods
- [ ] Update token validation methods
- [ ] Update JWT filter integration
- [ ] Add/update JWT-related tests

---

## Phase 4: API Documentation Migration

### 4.1 Springfox → SpringDoc OpenAPI Migration

- [ ] Remove Springfox dependencies
- [ ] Add SpringDoc OpenAPI dependencies
- [ ] Create SpringDoc configuration class
- [ ] Migrate @Api → @Tag annotations
- [ ] Migrate @ApiOperation → @Operation annotations
- [ ] Migrate @ApiParam → @Parameter annotations
- [ ] Migrate @ApiResponse annotations
- [ ] Migrate @ApiModel → @Schema annotations
- [ ] Update Swagger UI endpoint configuration

---

## Phase 5: Caching Migration

### 5.1 EhCache → Caffeine Migration

- [ ] Remove EhCache dependencies
- [ ] Add Caffeine dependencies
- [ ] Create Caffeine cache configuration
- [ ] Migrate ehcache.xml to Java config
- [ ] Update cache annotations if needed
- [ ] Verify cache behavior

---

## Phase 6: Utility Library Updates

### 6.1 Apache POI Migration (3.17 → 5.3.0)

- [ ] Update POI dependencies
- [ ] Migrate deprecated XSSFWorkbook methods
- [ ] Update cell style creation patterns
- [ ] Update formula evaluation
- [ ] Test Excel import/export functionality

### 6.2 Apache HttpClient Migration (4.x → 5.x)

- [ ] Update HttpClient dependencies
- [ ] Migrate CloseableHttpClient usage
- [ ] Update request/response handling
- [ ] Update connection pool configuration

### 6.3 iText PDF Consolidation

- [ ] Remove iText 5.x dependencies
- [ ] Standardize on iText 8.x
- [ ] Migrate PDF generation code
- [ ] Update html2pdf integration
- [ ] Test PDF generation functionality

---

## Phase 7: Test Framework Updates

### 7.1 Testing Dependencies

- [ ] Update JUnit 5 to latest version
- [ ] Update Mockito to 5.x
- [ ] Update Testcontainers to latest
- [ ] Update AssertJ to latest

### 7.2 Test Code Migration

- [ ] Fix deprecated test annotations
- [ ] Update MockMvc test patterns
- [ ] Update security test configurations

---

## Phase 8: Cleanup & Validation

### 8.1 Dependency Cleanup

- [ ] Remove unused dependencies
- [ ] Resolve version conflicts
- [ ] Update remaining transitive dependencies

### 8.2 Final Validation

- [ ] Run full test suite
- [ ] Validate Sonar quality gate
- [ ] Performance regression testing
- [ ] Security scan validation

---

## Risk Mitigation

1. **Incremental PRs**: Each task should be a separate PR for easy rollback
2. **Feature flags**: Consider feature flags for risky changes
3. **Parallel testing**: Run tests on both old and new configurations
4. **Documentation**: Update relevant docs with each change

## Dependencies Between Tasks

```
Phase 1 (Foundation)
    ↓
Phase 2 (Spring Boot Core) ← Critical path
    ↓
Phase 3 (Security) ← Depends on Boot 3
    ↓
Phase 4 (API Docs) ← Can run parallel with Phase 5-6
Phase 5 (Caching) ← Can run parallel with Phase 4, 6
Phase 6 (Utilities) ← Can run parallel with Phase 4-5
    ↓
Phase 7 (Tests) ← After all library updates
    ↓
Phase 8 (Cleanup) ← Final phase
```

---

_Generated: December 2025_
