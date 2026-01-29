# System Logger Usage Guide

## Overview

The system logger provides comprehensive tracking of all significant actions and events in the SJSFI Student Information System. It's designed to be used throughout the application for audit trails, security monitoring, and troubleshooting.

## Key Features

- ✅ **Enterprise-grade logging** with unique log numbers and timestamps
- ✅ **User context tracking** (user ID, name, role, session)
- ✅ **Action categorization** (AUTH, REGISTRATION, ACADEMIC, USER, SYSTEM, SECURITY)
- ✅ **Change tracking** with before/after values and changed fields
- ✅ **Performance monitoring** with execution time tracking
- ✅ **Security event detection** for suspicious activities
- ✅ **Automatic system context** detection (IP, user agent, request details)
- ✅ **Fallback logging** when primary logging fails
- ✅ **Critical event handling** for immediate alerts

## Quick Start

### 1. Basic Logging

```typescript
import { logSystemAction } from '@/lib/systemLogger';

await logSystemAction({
  userId: 123,
  userName: 'John Doe',
  userRole: 'ADMIN',
  actionCategory: 'ACADEMIC',
  actionType: 'CREATE',
  actionDescription: 'Created new academic term',
  targetType: 'ACADEMIC_TERM',
  targetId: '2024-2025',
  targetName: 'School Year 2024-2025',
  status: 'SUCCESS',
  severityLevel: 'MEDIUM'
});
```

### 2. Using Helper Functions

```typescript
import { 
  logRegistrationEvent, 
  logAuthEvent, 
  logAcademicTermEvent,
  logUserEvent,
  logSecurityEvent 
} from '@/lib/systemLoggerHelpers';

// Registration events
await logRegistrationEvent({
  actionType: 'CREATE',
  registrationId: '12345',
  studentName: 'Jane Smith',
  success: true,
  userName: 'Admin User',
  userRole: 'REGISTRAR'
});

// Authentication events
await logAuthEvent({
  userId: 123,
  userName: 'john.doe@example.com',
  actionType: 'LOGIN',
  success: true
});

// Security events
await logSecurityEvent({
  actionType: 'SUSPICIOUS_ACTIVITY',
  description: 'Multiple failed login attempts',
  targetType: 'USER',
  targetId: '123'
});
```

### 3. Performance Tracking

```typescript
import { logWithTiming } from '@/lib/systemLoggerHelpers';

const result = await logWithTiming(
  async () => {
    // Your database operation here
    return await prisma.registration.create({ data: registrationData });
  },
  {
    actionCategory: 'REGISTRATION',
    actionType: 'CREATE',
    actionDescription: 'Creating new student registration',
    targetType: 'REGISTRATION',
    targetId: 'pending',
    severityLevel: 'MEDIUM'
  }
);
```

### 4. Database Change Tracking

```typescript
import { logDatabaseChange } from '@/lib/systemLoggerHelpers';

const updatedRecord = await logDatabaseChange(
  async () => {
    return await prisma.academicTerm.update({
      where: { id: termId },
      data: { status: 'ACTIVE' }
    });
  },
  {
    userId: currentUser.id,
    userName: currentUser.name,
    userRole: currentUser.role,
    actionType: 'UPDATE',
    targetType: 'ACADEMIC_TERM',
    targetId: termId.toString(),
    targetName: term.year,
    oldValues: { status: 'INACTIVE' },
    severityLevel: 'HIGH'
  }
);
```

## Integration Examples

### In Server Actions

```typescript
// src/app/_actions/updateUserProfile.ts
'use server'

import { logUserEvent } from '@/lib/systemLoggerHelpers';

export async function updateUserProfile(userId: number, profileData: any) {
  try {
    const oldUser = await prisma.user.findUnique({ where: { id: userId } });
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: profileData
    });

    // Log successful update
    await logUserEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'UPDATE',
      actionSubType: 'PROFILE_UPDATE',
      targetUserId: userId.toString(),
      targetUserName: updatedUser.firstName + ' ' + updatedUser.familyName,
      oldValues: oldUser,
      newValues: updatedUser,
      success: true
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    // Log failed update
    await logUserEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'UPDATE',
      actionSubType: 'PROFILE_UPDATE',
      targetUserId: userId.toString(),
      success: false,
      errorMessage: error.message
    });

    throw error;
  }
}
```

### In API Routes

```typescript
// src/app/api/students/route.ts
import { logSystemAction } from '@/lib/systemLogger';

export async function GET(request: Request) {
  try {
    const students = await prisma.student.findMany();

    await logSystemAction({
      actionCategory: 'SYSTEM',
      actionType: 'VIEW',
      actionDescription: 'Retrieved student list',
      targetType: 'STUDENT',
      targetId: 'list',
      status: 'SUCCESS',
      severityLevel: 'LOW'
    });

    return Response.json(students);
  } catch (error) {
    await logSystemAction({
      actionCategory: 'SYSTEM',
      actionType: 'VIEW',
      actionDescription: 'Failed to retrieve student list',
      targetType: 'STUDENT',
      targetId: 'list',
      status: 'FAILED',
      errorMessage: error.message,
      severityLevel: 'MEDIUM'
    });

    return Response.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}
```

### In Authentication

```typescript
// src/lib/auth.ts
import { logAuthEvent, logSecurityEvent } from '@/lib/systemLoggerHelpers';

export async function signIn(email: string, password: string) {
  try {
    const user = await authenticateUser(email, password);
    
    await logAuthEvent({
      userId: user.id,
      userName: user.email,
      userRole: user.role,
      actionType: 'LOGIN',
      success: true
    });

    return { success: true, user };
  } catch (error) {
    // Log failed login attempt
    await logAuthEvent({
      userName: email,
      actionType: 'FAILED_LOGIN',
      success: false,
      errorMessage: error.message
    });

    // Check for brute force attacks
    const recentFailures = await getRecentFailedLogins(email);
    if (recentFailures > 5) {
      await logSecurityEvent({
        actionType: 'BRUTE_FORCE',
        description: `Multiple failed login attempts for ${email}`,
        targetType: 'USER',
        targetId: email,
        metadata: { failureCount: recentFailures }
      });
    }

    throw error;
  }
}
```

## Best Practices

### 1. Always Log Critical Actions

- User authentication (login/logout)
- Registration approvals/rejections
- Academic term changes
- User role modifications
- System configurations

### 2. Include Context

- Always provide user context when available
- Include target information (what was affected)
- Add meaningful descriptions
- Track changes with before/after values

### 3. Use Appropriate Severity Levels

- **LOW**: Routine operations, data views
- **MEDIUM**: Data modifications, user actions
- **HIGH**: Admin actions, status changes
- **CRITICAL**: Security events, system failures

### 4. Handle Errors Gracefully

- Never let logging errors break your main functionality
- Use try-catch blocks around logging calls
- The logger has built-in fallback mechanisms

### 5. Performance Considerations

- Use async logging to avoid blocking operations
- Leverage the timing helpers for performance monitoring
- Archive old logs regularly (using `archivedAt` field)

## Migration Script

To apply the schema changes and start using the system logger:

```bash
# Run the Prisma migration to create the SystemLog table
npx prisma migrate dev --name "add_system_logging"

# Generate the Prisma client
npx prisma generate
```

## Security and Compliance

The system logger helps with:

- **Audit Trails**: Track all system changes
- **Security Monitoring**: Detect suspicious activities
- **Compliance**: Meet regulatory requirements
- **Troubleshooting**: Debug issues with detailed context
- **Performance**: Monitor system performance

All sensitive data is automatically flagged and can be handled according to your data retention policies.
