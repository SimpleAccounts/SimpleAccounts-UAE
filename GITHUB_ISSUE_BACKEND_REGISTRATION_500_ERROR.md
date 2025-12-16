# Backend Registration 500 Error and CORS Issues

## Issue Type
Bug

## Status
🔴 **OPEN** - Needs investigation

## Description
The `/rest/company/register` endpoint returns a 500 Internal Server Error when attempting to register a new company. Additionally, CORS headers are missing on error responses, preventing the frontend from reading error messages.

## Symptoms

1. **500 Internal Server Error**
   - Registration requests return HTTP 500
   - Error occurs after form data is submitted
   - Backend receives the request but fails during processing

2. **CORS Headers Missing on Error Responses**
   - Browser shows "CORS header 'Access-Control-Allow-Origin' missing" error
   - Frontend cannot read the error response body
   - Prevents debugging and user feedback

## Current State

### Enhanced Error Logging (Implemented)
- Added detailed error logging in `CompanyController.java`
- Logs registration model data (companyName, email, stateId, etc.)
- Returns error message in response body
- **Note**: Error messages cannot be read by frontend due to CORS issue

### CORS Filter (Existing)
- `SimpleCorsFilter.java` exists and sets CORS headers
- Works for successful requests
- **Issue**: Headers not present on 500 error responses

## Investigation Needed

1. **Check Backend Logs**
   ```bash
   docker logs simpleaccounts-backend --tail 500 | grep -A 20 "Error during company registration"
   ```
   - Identify the actual exception causing the 500 error
   - Check for NullPointerException, ConstraintViolationException, or other exceptions
   - Review stack traces

2. **Common Causes to Check**
   - Missing required fields in RegistrationModel
   - Database constraint violations
   - Null pointer exceptions in service layer
   - Transaction rollback issues
   - Missing dependencies or configuration

3. **CORS Issue**
   - Spring Boot's default error handler (`BasicErrorController`) may bypass CORS filter
   - Error responses may be created before CORS headers are set
   - May need to configure CORS at a lower level (Tomcat/Spring Boot configuration)

## Files Modified (For Debugging)

- `apps/backend/src/main/java/com/simpleaccounts/rest/companycontroller/CompanyController.java`
  - Enhanced error logging
  - Added CORS headers in catch block (may not work due to Spring Boot error handling)

## Next Steps

1. **Immediate**: Check Docker logs to identify root cause of 500 error
2. **Fix**: Resolve the underlying exception causing the 500 error
3. **Then**: Address CORS headers on error responses (may require Spring Boot configuration changes or reverse proxy)

## Related Issues

- See `GITHUB_ISSUE_FRONTEND_REGISTRATION_FIXES.md` for frontend fixes
- **Note**: Security concerns should be reported privately per the [security policy](https://github.com/SimpleAccounts/SimpleAccounts-UAE/security/policy)

## Environment

- Backend: Spring Boot 3.4.1, running in Docker
- Database: PostgreSQL
- Frontend: React, running on localhost:3000
- Backend: Running on localhost:8080

