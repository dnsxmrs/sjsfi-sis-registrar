"use server";

import { logSystemAction, getChangedFields } from './systemLogger';
import { LogSystemActionParams, LogData } from './systemLoggerTypes';

// Helper wrapper for logging with performance timing
export async function logWithTiming<T>(
    action: () => Promise<T>,
    logParams: Omit<LogSystemActionParams, 'executionTimeMs' | 'status' | 'errorMessage'>
): Promise<T> {
    const startTime = Date.now();

    try {
        const result = await action();

        // Log successful action
        await logSystemAction({
            ...logParams,
            status: 'SUCCESS',
            executionTimeMs: Date.now() - startTime
        });

        return result;
    } catch (error) {
        // Log failed action
        await logSystemAction({
            ...logParams,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            executionTimeMs: Date.now() - startTime
        });

        throw error; // Re-throw the error
    }
}

// Helper for database operations with change tracking
export async function logDatabaseChange<T extends Record<string, unknown>>(
    operation: () => Promise<T>,
    params: {
        userId?: number;
        userName?: string;
        userRole?: string;
        actionType: 'CREATE' | 'UPDATE' | 'DELETE';
        targetType: string;
        targetId: string;
        targetName?: string;
        oldValues?: LogData;
        severityLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    }
): Promise<T> {
    const startTime = Date.now();

    try {
        const result = await operation();

        // Prepare log data
        const newValues = result ? (result as LogData) : undefined;
        const changedFields = params.oldValues && newValues
            ? await getChangedFields(params.oldValues, newValues)
            : undefined;

        await logSystemAction({
            userId: params.userId,
            userName: params.userName,
            userRole: params.userRole,
            actionCategory: 'SYSTEM', // Database operations are system-level
            actionType: params.actionType,
            actionDescription: `${params.actionType.toLowerCase()} ${params.targetType.toLowerCase()}: ${params.targetName || params.targetId}`,
            targetType: params.targetType,
            targetId: params.targetId,
            targetName: params.targetName,
            oldValues: params.oldValues,
            newValues,
            changedFields,
            status: 'SUCCESS',
            severityLevel: params.severityLevel || 'MEDIUM',
            executionTimeMs: Date.now() - startTime
        });

        return result;
    } catch (error) {
        await logSystemAction({
            userId: params.userId,
            userName: params.userName,
            userRole: params.userRole,
            actionCategory: 'SYSTEM',
            actionType: params.actionType,
            actionDescription: `Failed to ${params.actionType.toLowerCase()} ${params.targetType.toLowerCase()}: ${params.targetName || params.targetId}`,
            targetType: params.targetType,
            targetId: params.targetId,
            targetName: params.targetName,
            oldValues: params.oldValues,
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Unknown error',
            severityLevel: 'HIGH',
            executionTimeMs: Date.now() - startTime
        });

        throw error;
    }
}

// Helper for authentication events
export async function logAuthEvent(params: {
    userId?: number;
    userName?: string;
    userRole?: string;
    actionType: 'SIGN-IN' | 'SIGN-OUT' | 'PASSWORD_CHANGE';
    success: boolean;
    errorMessage?: string;
    metadata?: LogData;
}) {
    await logSystemAction({
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        actionCategory: 'AUTH',
        actionType: params.success ? params.actionType : 'UNAUTHORIZED_ACCESS',
        actionDescription: `User ${params.actionType.toLowerCase()}${params.success ? ' successful' : ' failed'}`,
        targetType: 'USER',
        targetId: params.userId?.toString() || 'unknown',
        targetName: params.userName,
        status: params.success ? 'SUCCESS' : 'FAILED',
        errorMessage: params.errorMessage,
        severityLevel: params.success ? 'LOW' : 'MEDIUM',
        metadata: params.metadata,
        isSensitiveData: params.actionType === 'PASSWORD_CHANGE'
    });
}

// Helper for registration events
export async function logRegistrationEvent(params: {
    userId?: number;
    userName?: string;
    userRole?: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
    actionSubType?: 'APPROVE' | 'REJECT' | 'STATUS_CHANGE';
    registrationId: string;
    studentName?: string;
    oldValues?: LogData;
    newValues?: LogData;
    success: boolean;
    errorMessage?: string;
}) {
    const changedFields = params.oldValues && params.newValues
        ? await getChangedFields(params.oldValues, params.newValues)
        : undefined;

    await logSystemAction({
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        actionCategory: 'REGISTRATION',
        actionType: params.actionType,
        actionSubType: params.actionSubType,
        actionDescription: `${params.actionSubType || params.actionType} registration for ${params.studentName || 'student'}`,
        targetType: 'REGISTRATION',
        targetId: params.registrationId,
        targetName: params.studentName,
        oldValues: params.oldValues,
        newValues: params.newValues,
        changedFields,
        status: params.success ? 'SUCCESS' : 'FAILED',
        errorMessage: params.errorMessage,
        severityLevel: params.actionSubType === 'APPROVE' || params.actionSubType === 'REJECT' ? 'HIGH' : 'MEDIUM'
    });
}

// Helper for academic term events
export async function logAcademicTermEvent(params: {
    userId?: number;
    userName?: string;
    userRole?: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
    actionSubType?: 'STATUS_CHANGE' | 'DETAILS_UPDATE';
    termId: string;
    termName?: string;
    oldValues?: LogData;
    newValues?: LogData;
    success: boolean;
    errorMessage?: string;
}) {
    const changedFields = params.oldValues && params.newValues
        ? await getChangedFields(params.oldValues, params.newValues)
        : undefined;

    await logSystemAction({
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        actionCategory: 'ACADEMIC',
        actionType: params.actionType,
        actionSubType: params.actionSubType,
        actionDescription: `${params.actionType} academic term: ${params.termName || params.termId}`,
        targetType: 'ACADEMIC_TERM',
        targetId: params.termId,
        targetName: params.termName,
        oldValues: params.oldValues,
        newValues: params.newValues,
        changedFields,
        status: params.success ? 'SUCCESS' : 'FAILED',
        errorMessage: params.errorMessage,
        severityLevel: params.actionType === 'DELETE' ? 'CRITICAL' : 'HIGH'
    });
}

// Helper for user management events
export async function logUserEvent(params: {
    userId?: number;
    userName?: string;
    userRole?: string;
    actionType: 'CREATE' | 'UPDATE' | 'DELETE';
    actionSubType?: 'ROLE_CHANGE' | 'PERMISSION_CHANGE' | 'PROFILE_UPDATE';
    targetUserId: string;
    targetUserName?: string;
    oldValues?: LogData;
    newValues?: LogData;
    success: boolean;
    errorMessage?: string;
}) {
    const changedFields = params.oldValues && params.newValues
        ? await getChangedFields(params.oldValues, params.newValues)
        : undefined;

    await logSystemAction({
        userId: params.userId,
        userName: params.userName,
        userRole: params.userRole,
        actionCategory: 'USER',
        actionType: params.actionType,
        actionSubType: params.actionSubType,
        actionDescription: `${params.actionSubType || params.actionType} user: ${params.targetUserName || params.targetUserId}`,
        targetType: 'USER',
        targetId: params.targetUserId,
        targetName: params.targetUserName,
        oldValues: params.oldValues,
        newValues: params.newValues,
        changedFields,
        status: params.success ? 'SUCCESS' : 'FAILED',
        errorMessage: params.errorMessage,
        severityLevel: params.actionSubType === 'ROLE_CHANGE' || params.actionSubType === 'PERMISSION_CHANGE' ? 'HIGH' : 'MEDIUM',
        isSensitiveData: params.actionSubType === 'PROFILE_UPDATE'
    });
}

// Helper for security events
export async function logSecurityEvent(params: {
    userId?: number;
    userName?: string;
    actionType: 'UNAUTHORIZED_ACCESS' | 'SUSPICIOUS_ACTIVITY' | 'DATA_BREACH' | 'BRUTE_FORCE';
    description: string;
    targetType?: string;
    targetId?: string;
    metadata?: LogData;
}) {
    await logSystemAction({
        userId: params.userId,
        userName: params.userName,
        actionCategory: 'SECURITY',
        actionType: params.actionType,
        actionDescription: params.description,
        targetType: params.targetType || 'SYSTEM',
        targetId: params.targetId || 'security',
        status: 'WARNING',
        severityLevel: 'CRITICAL',
        metadata: params.metadata,
        isSensitiveData: true
    });
}
