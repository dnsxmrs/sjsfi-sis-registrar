# SJSFI Student Information System - Copilot Instructions

## Architecture Overview

This is a **Next.js 15 (App Router) + Prisma + PostgreSQL** enrollment management system for San Jose de la Salle Foundation, Inc. Key architectural decisions:

- **Custom Prisma output**: Generated client lives in `src/generated/prisma/client` (not default location)
- **Dual authentication portals**: Separate `/forms/` (admin-only) and `/registrar/` (registrar+admin) route groups with role-based middleware
- **Supabase storage**: File uploads (requirements, documents) stored in Supabase, database on PostgreSQL
- **Server Actions only**: All data mutations use Next.js Server Actions (`"use server"`) in `src/app/_actions/`
- **Hierarchical data model**: AcademicTerm → TermYearLevel → TermSubject → Schedule/Section (see Phase 2 in `SCHEDULE_MANAGEMENT_IMPLEMENTATION.md`)

## Critical Workflows

### Setup & Development
```bash
npm install
npx prisma generate  # REQUIRED before running dev server
npm run dev          # Starts on localhost:3000
npm run lint         # Run before committing
```

### Database Operations
```bash
# After schema changes in prisma/schema.prisma:
npx prisma migrate dev --name descriptive_migration_name
npx prisma generate  # Regenerates client in src/generated/prisma/

# View data:
npx prisma studio
```

### Environment Requirements
Must have `.env` with:
- `DATABASE_URL` - PostgreSQL connection string
- `CLERK_SECRET_KEY` - Clerk authentication
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` - File storage

## Project-Specific Conventions

### Import Paths
- **Prisma imports**: Always use `@/generated/prisma/client` (never `@prisma/client`)
- **Actions**: Import from `@/app/_actions/fileName` (no need for `.ts`)
- **Path alias**: `@/` maps to `src/`

### Server Actions Pattern
Every action file in `src/app/_actions/` must:
1. Start with `"use server"` directive
2. Import prisma from `@/lib/prisma` (uses PrismaPg adapter for v7)
3. Log significant events using `systemLoggerHelpers`:
   ```typescript
   import { logRegistrationEvent, logSecurityEvent } from '@/lib/systemLoggerHelpers';
   
   await logRegistrationEvent({
     actionType: 'CREATE',
     registrationId: registration.id.toString(),
     studentName: `${data.firstName} ${data.familyName}`,
     success: true,
     userName: currentUser.name,
     userRole: currentUser.role
   });
   ```
4. Return structured results: `{ success: boolean, data?: T, error?: string }`

### System Logger (Critical)
**All mutations** must log to `SystemLog` table using helpers in `systemLoggerHelpers.ts`:
- `logAuthEvent` - Login/logout/session events
- `logRegistrationEvent` - Registration CRUD operations
- `logAcademicTermEvent` - Term/year level/subject changes
- `logSecurityEvent` - Suspicious activities (invalid codes, unauthorized access)
- `logWithTiming` - Wrap long operations for performance tracking

See `SYSTEM_LOGGER_GUIDE.md` for full examples. **Never bypass logging** - it's used for audit trails and security monitoring.

### Error Handling Standards
Follow `ERROR_CODES.md` error code system:
- Auth errors: `AU##` (e.g., AU05 - Access Denied for Role)
- HRMS integration: `HR##`
- Registration: `RG##`

Always include error codes in logs and user-facing messages for troubleshooting.

### Middleware & Auth Flow
`src/middleware.ts` enforces:
- Admin users: Access both `/forms/` and `/registrar/` routes
- Registrar users: Only `/registrar/` routes (redirected if accessing `/forms/`)
- Roles stored in Clerk `privateMetadata.roles` (array) or `privateMetadata.role` (string)
- Authenticated users on public routes → auto-redirect to role-appropriate home

### Database Query Patterns
1. **Soft deletes**: Most models have `deletedAt` - always filter `deletedAt: null`
   ```typescript
   where: { id: studentId, deletedAt: null }
   ```
2. **Status filtering**: Use `GeneralStatus.ACTIVE` enum for active records
3. **Indexes exist** for common queries (see schema indexes) - leverage them:
   - `[familyName, firstName]` for name searches
   - `[status, academicYearId]` for term-filtered lists
   - `[studentNumber, deletedAt]` for student lookups

### Schedule Management Hierarchy
When working with schedules (added in Phase 2 migrations):
1. Start from `AcademicTerm` (school year)
2. Link `YearLevel` via `TermYearLevel`
3. Attach `Subject` via `TermSubject`
4. Create `Section` for student grouping
5. Build `Schedule` referencing `TermSubject` + `Section`

**HRMS Integration**: Schedules have `teacherId/teacherName/teacherEmail` populated by external HRMS via `hrmsIntegrationActions.ts`.

## Component Structure

- `src/components/admin/` - Admin-only UI (forms portal)
- `src/components/registrar/` - Registrar-specific UI
- `src/components/forms/` - Shared form components
- `src/components/skeleton/` - Loading states
- Use `react-hot-toast` for notifications (already configured)

## Key Files Reference

- `prisma/schema.prisma` - Single source of truth for data model (708 lines)
- `src/lib/systemLogger.ts` - Core logging implementation
- `src/lib/systemLoggerHelpers.ts` - Convenient logging wrappers
- `ERROR_CODES.md` - Complete error code reference
- `SYSTEM_LOGGER_GUIDE.md` - Logging best practices and examples
- `SCHEDULE_MANAGEMENT_IMPLEMENTATION.md` - Phase 2 schedule system documentation

## Common Pitfalls

1. **Don't run** `prisma generate` without database connection - it will fail
2. **Never import** `@prisma/client` directly - always use `@/generated/prisma/client`
3. **Check middleware logs** - console shows auth redirects with emojis (⚠️, ✅, 🔄)
4. **Cascade deletes configured** - Deleting Registration cascades to Guardians/ContactNumbers
5. **Unique constraints**: `studentNumber`, `applicationNumber`, `registrationCode` must be unique
6. **Date handling**: Prisma dates are JavaScript Date objects, but schema uses `@db.Date` for date-only fields
