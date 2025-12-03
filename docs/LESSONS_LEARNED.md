# Lessons Learned

This document captures important lessons learned during development to prevent recurring issues.

---

## Table of Contents

1. [History Package Version Mismatch](#1-history-package-version-mismatch)

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
    "history": "^4.10.1",  // NOT "^5.3.0"
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

*Add new lessons learned above this line, following the same format.*
