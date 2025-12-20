// Types for logging data
type LoggableValue = string | number | boolean | null | Date | LoggableValue[] | { [key: string]: LoggableValue };
export type LogData = Record<string, LoggableValue>;

// Types for the system logger
export interface LogSystemActionParams {
    // User context (optional for system actions)
    userId?: number;
    userName?: string;
    userRole?: string;
    sessionId?: string;

    // Action details (required)
    actionCategory: 'AUTH' | 'REGISTRATION' | 'ACADEMIC' | 'USER' | 'SYSTEM' | 'SECURITY';
    actionType: 'CREATE' | 'UPDATE' | 'DELETE' | 'SIGN-IN' | 'SIGN-OUT' | 'EXPORT' | 'IMPORT' | 'VIEW' | 'PASSWORD_CHANGE' | 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'DATA_BREACH' | 'BRUTE_FORCE';
    actionSubType?: string;
    actionDescription: string;

    // Target information (required)
    targetType: string;
    targetId: string;
    targetName?: string;

    // Change tracking (optional)
    oldValues?: LogData;
    newValues?: LogData;
    changedFields?: string[];

    // System context (auto-detected if not provided)
    ipAddress?: string;
    userAgent?: string;
    requestMethod?: string;
    requestUrl?: string;

    // Status and results (required)
    status: 'SUCCESS' | 'FAILED' | 'WARNING';
    errorCode?: string;
    errorMessage?: string;
    severityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

    // Performance and metadata (optional)
    executionTimeMs?: number;
    metadata?: LogData;
    isSensitiveData?: boolean;
}

// Predefined action types for consistency
export const ACTION_TYPES = {
    AUTH: {
        SIGN_IN: 'SIGN-IN',
        SIGN_OUT: 'SIGN-OUT',
        PASSWORD_CHANGE: 'PASSWORD_CHANGE',
        FAILED_LOGIN: 'FAILED_LOGIN',
        ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
        SESSION_EXPIRED: 'SESSION_EXPIRED'
    },
    REGISTRATION: {
        CREATE: 'CREATE',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE',
        APPROVE: 'APPROVE',
        REJECT: 'REJECT',
        STATUS_CHANGE: 'STATUS_CHANGE'
    },
    ACADEMIC: {
        TERM_CREATE: 'TERM_CREATE',
        TERM_UPDATE: 'TERM_UPDATE',
        TERM_DELETE: 'TERM_DELETE',
        TERM_STATUS_CHANGE: 'TERM_STATUS_CHANGE',
        YEAR_LEVEL_CREATE: 'YEAR_LEVEL_CREATE',
        YEAR_LEVEL_UPDATE: 'YEAR_LEVEL_UPDATE',
        YEAR_LEVEL_DELETE: 'YEAR_LEVEL_DELETE'
    },
    USER: {
        CREATE: 'CREATE',
        UPDATE: 'UPDATE',
        DELETE: 'DELETE',
        ROLE_CHANGE: 'ROLE_CHANGE',
        PERMISSION_CHANGE: 'PERMISSION_CHANGE'
    },
    SYSTEM: {
        BACKUP: 'BACKUP',
        RESTORE: 'RESTORE',
        MAINTENANCE: 'MAINTENANCE',
        CONFIG_CHANGE: 'CONFIG_CHANGE',
        MIGRATION: 'MIGRATION'
    }
} as const;

// Utility function to sanitize sensitive data (non-async version)
export function sanitizeForLoggingSync(data: LogData, sensitiveFields: string[] = []): LogData {
    if (!data || typeof data !== 'object') return data;

    const defaultSensitiveFields = [
        'password', 'token', 'secret', 'key', 'ssn', 'creditCard',
        'bankAccount', 'socialSecurity', 'passcode', 'pin'
    ];

    const allSensitiveFields = [...defaultSensitiveFields, ...sensitiveFields];
    const sanitized = { ...data };

    for (const field of allSensitiveFields) {
        if (sanitized[field] !== undefined) {
            sanitized[field] = '[REDACTED]';
        }
    }

    return sanitized;
}

// Utility function to compare objects and get changed fields (non-async version)
export function getChangedFieldsSync(oldValues: LogData, newValues: LogData): string[] {
    if (!oldValues || !newValues) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    for (const key of allKeys) {
        if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
            changedFields.push(key);
        }
    }

    return changedFields;
}
