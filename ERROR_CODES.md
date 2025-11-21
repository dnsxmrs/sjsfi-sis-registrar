# Error Code Reference Guide

This document provides a comprehensive list of error codes used throughout the SJSFI Enrollment System.

## Error Code Format

Error codes follow the format: `[MODULE][NUMBER]`

- **MODULE**: 2-3 letter code identifying the module/feature
- **NUMBER**: 2-digit sequential number

---

## Authentication Errors (AUTH)

### AU01 - Missing Email or Origin

**Description:** Login attempt without required email or origin parameter.  
**Severity:** Low  
**User Message:** "Missing email or origin"  
**Action:** Ensure both email and origin are provided in the login request.

---

### AU02 - Invalid Origin Attempt

**Description:** Login attempt from an unauthorized origin.  
**Severity:** Low  
**User Message:** "Invalid origin attempt."  
**Allowed Origins:** `forms`, `registrar`  
**Action:** Verify the origin parameter matches allowed values.

---

### AU03 - User Verification Failed

**Description:** Unable to verify user credentials with the system.  
**Severity:** Low  
**User Message:** "User verification failed"  
**Possible Causes:**

- User does not exist in HRMS
- Invalid email format
- Database connection issues

---

### AU04 - HRMS Connection Error

**Description:** Unable to connect to external HRMS system for user verification.  
**Severity:** Low  
**User Message:** "Unable to verify user credentials with external system"  
**Action:** Check HRMS service availability and network connectivity.

---

### AU05 - Access Denied for Role

**Description:** User role is not authorized to access the system.  
**Severity:** Low  
**User Message:** "Access denied for this role"  
**Allowed Roles:** Admin, Registrar  
**Action:** Ensure user has appropriate role assigned in HRMS.

---

### AU06 - Registrar Origin Restriction

**Description:** Registrar account attempting to access forms portal.  
**Severity:** Medium  
**User Message:** "Registrar accounts can only access the registrar portal"  
**Rule:**

- Admin accounts can access both `forms` and `registrar` origins
- Registrar accounts can only access `registrar` origin  
**Action:** Registrar users should use the registrar portal URL.

---

### AU07 - Internal Server Error

**Description:** Unexpected error during authentication process.  
**Severity:** Low  
**User Message:** "Internal server error occurred"  
**Action:** Check server logs for detailed error information.

---

## HRMS Integration Errors (HRMS)

### HR01 - Email Required

**Description:** Email parameter missing in HRMS lookup request.  
**Severity:** App-level  
**User Message:** "Email is required"  
**Action:** Ensure email is provided for user lookup.

---

### HR02 - Server Misconfiguration

**Description:** Required environment variables are missing.  
**Severity:** App-level  
**User Message:** "Server misconfiguration"  
**Required Variables:**

- `SJSFI_SHARED_SECRET`
- `SJSFI_SIS_API_KEY`
- `BASE_URL`  
**Action:** Verify all environment variables are properly configured.

---

### HR03 - User Not Found

**Description:** User does not exist in HRMS database.  
**Severity:** HRMS-level  
**User Message:** "User not found"  
**Action:** Verify the email address is correct and user exists in HRMS.

---

### HR04 - Invalid HRMS Response

**Description:** HRMS returned invalid or malformed JSON response.  
**Severity:** HRMS-level  
**User Message:** "Invalid response from external system"  
**Action:** Check HRMS API health and response format.

---

### HR05 - External System Unavailable

**Description:** HRMS system is unreachable or returned an error.  
**Severity:** HRMS-level  
**User Message:** "External system unavailable"  
**Action:**

- Check HRMS service status
- Verify network connectivity
- Check API endpoint URL

---

## Usage in Code

### Implementing Error Codes

```typescript
// Example usage in error responses
return { 
    success: false, 
    error: "Missing email or origin",
    errorCode: "AU01"
};
```

### Logging with Error Codes

```typescript
await logAuthAttempt(
    email, 
    origin, 
    "FAILED", 
    "Missing email or origin [AU01]"
);
```

---

## Error Severity Levels

| Level | Description | Examples |
|-------|-------------|----------|
| **LOW** | Normal operational errors, user input issues | Missing fields, invalid credentials |
| **MEDIUM** | Security-related or access control issues | Unauthorized origin access, role restrictions |
| **HIGH** | Critical system failures | Database corruption, security breaches |

---

## Troubleshooting Guide

### Common Error Scenarios

#### User Cannot Login (AU05)

1. Check user's role in HRMS
2. Verify role is either "Admin" or "Registrar"
3. Contact system administrator to update role if needed

#### Registrar Cannot Access Forms (AU06)

1. This is expected behavior
2. Registrar accounts are restricted to registrar portal only
3. Admin accounts can access both portals

#### External System Error (AU04, HR05)

1. Check HRMS service status
2. Verify environment variables are set correctly
3. Test HRMS API endpoint manually
4. Check network connectivity and firewall rules

---

## Future Error Codes

Reserved prefixes for upcoming modules:

- **ST** - Student Management (ST01-ST99)
- **SU** - Subject/Course Management (SU01-SU99)
- **RE** - Registration Process (RE01-RE99)
- **RP** - Reports Generation (RP01-RP99)
- **SL** - System Logs (SL01-SL99)
- **PO** - Policies Management (PO01-PO99)
- **DB** - Database Operations (DB01-DB99)
- **AP** - API Integration (AP01-AP99)

---

## Maintenance Notes

- Error codes should never be reused or changed once deployed
- New errors should use the next available sequential number
- Update this document whenever new error codes are added
- Include error codes in system logs for easier troubleshooting
- Consider internationalization (i18n) for user-facing error messages

---

**Last Updated:** November 1, 2025  
**Version:** 1.0.0  
**Maintained By:** SJSFI Development Team
