# Security Notes

## Password Transmission in Registration Request

**Issue:** Passwords appear in clear text in the HTTP request body (FormData).

**Current Status:** This is expected behavior for form submissions - passwords are sent in the request body as part of the form data.

**Security Considerations:**

1. **In Transit:** 
   - ✅ Passwords should be encrypted via HTTPS/TLS in production
   - ⚠️ Currently using HTTP in development (localhost) - acceptable for dev, but must use HTTPS in production

2. **Server-Side Handling:**
   - ✅ Passwords are hashed using BCrypt before storage (see `CompanyController.java` line 257-259)
   - ⚠️ Ensure passwords are NOT logged in plain text in server logs
   - ⚠️ Ensure passwords are NOT stored in plain text in database

3. **Recommended Improvements (Future):**
   - Use HTTPS in production environment
   - Add request logging filter that redacts sensitive fields (password, confirmPassword) from logs
   - Consider using encrypted request body for sensitive operations
   - Implement rate limiting on registration endpoint to prevent brute force attacks
   - Add password strength validation on both frontend and backend

**Location:** 
- Frontend: `apps/frontend/src/screens/register/screen.js` - FormData construction
- Backend: `apps/backend/src/main/java/com/simpleaccounts/rest/companycontroller/CompanyController.java` - Password hashing

**Priority:** Medium (acceptable for development, must address before production)

