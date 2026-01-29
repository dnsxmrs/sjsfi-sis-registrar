# Schedule Management System - Implementation Roadmap

**Project**: Integrated Schedule Management with HRMS
**Status**: Planning Phase
**Last Updated**: January 13, 2026

---

## Overview

This system allows hierarchical schedule management:

1. Create Academic Terms
2. Assign Year Levels to Terms
3. Attach Subjects to Year Level (per term)
4. Create Sections for student grouping
5. Create Schedules with time/room details
6. HRMS assigns teachers via API integration

---

## Phase 1: Database Schema Migration

### 1.1 Create New Models

- [✅] Create `TermYearLevel` model (links Year Levels to Academic Terms)
- [✅] Create `TermSubject` model (links Subjects to Term-YearLevel)
- [✅] Create `Section` model (student grouping within Term-YearLevel)
- [✅] Modify `Schedule` model to reference TermSubject and Section
- [✅] Add teacher fields to Schedule (teacherId, teacherName, teacherEmail)

### 1.2 Add Relations

- [✅] AcademicTerm → TermYearLevel (one-to-many)
- [✅] YearLevel → TermYearLevel (one-to-many)
- [✅] TermYearLevel → TermSubject (one-to-many)
- [✅] TermYearLevel → Section (one-to-many)
- [✅] Subject → TermSubject (one-to-many)
- [✅] TermSubject → Schedule (one-to-many)
- [✅] Section → Schedule (one-to-many)

### 1.3 Database Migration

- [✅] Update `schema.prisma`
- [✅] Run `prisma migrate dev --name add_schedule_management_tables` (requires database connection)
- [✅] Verify migration successful
- [✅] Test data relationships

**Status**: ✅ Complete

---

## Phase 2: Server Actions (Backend Logic)

### 2.1 Term-YearLevel Management

File: `src/app/_actions/termYearLevelActions.ts`

- [✅] `addYearLevelToTerm(termId, yearLevelId)` - Link year level to term
- [✅] `getYearLevelsForTerm(termId)` - Get all year levels in a term
- [✅] `removeYearLevelFromTerm(termYearLevelId)` - Soft delete
- [✅] `getAvailableYearLevels(termId)` - Get available year levels for a term
- [✅] Add validation for duplicates
- [✅] Add system logging

### 2.2 Term-Subject Management

File: `src/app/_actions/termSubjectActions.ts`

- [✅] `attachSubjectsToYearLevel(termYearLevelId, subjectIds[])` - Attach subjects
- [✅] `getSubjectsForYearLevel(termYearLevelId)` - Get attached subjects
- [✅] `updateSubjectRequirement(termSubjectId, isRequired)` - Toggle required
- [✅] `removeSubjectFromYearLevel(termSubjectId)` - Soft delete
- [✅] `getAvailableSubjects(termYearLevelId)` - Get available subjects
- [✅] Add validation (prevent duplicates)
- [✅] Add system logging

### 2.3 Section Management

File: `src/app/_actions/sectionActions.ts`

- [✅] `createSection(termYearLevelId, name, capacity)` - Create section
- [✅] `getSectionsForYearLevel(termYearLevelId)` - Get all sections
- [✅] `updateSection(sectionId, data)` - Update section details
- [✅] `deleteSection(sectionId)` - Soft delete
- [✅] Add case-insensitive checks for section names
- [✅] Add student count tracking
- [✅] Add capacity validation
- [✅] Add system logging

### 2.4 Enhanced Schedule Management

File: `src/app/_actions/scheduleActions.ts` (Update existing)

- [✅] `createSchedule(termSubjectId, sectionId, day, startTime, endTime, room)` - Create schedule
- [✅] `getSchedulesByTerm(termId)` - Get all schedules for term
- [✅] `getSchedulesByTermYearLevel(termYearLevelId)` - Filter by year level
- [✅] `getSchedulesBySection(sectionId)` - Filter by section
- [✅] `getAllSchedules()` - Get all schedules (backward compatibility)
- [✅] `updateSchedule(scheduleId, data)` - Update schedule
- [✅] `deleteSchedule(scheduleId)` - Soft delete
- [✅] Add conflict detection (same room/day/time)
- [✅] Add system logging

### 2.5 HRMS Integration Actions

File: `src/app/_actions/hrmsIntegrationActions.ts`

- [✅] `assignTeacherToSchedule(scheduleId, teacherData)` - Single assignment
- [✅] `bulkAssignTeachers(assignments[])` - Multiple assignments
- [✅] `removeTeacherFromSchedule(scheduleId)` - Unassign teacher
- [✅] `getAvailableSchedules(termId, filters)` - For HRMS to retrieve
- [✅] Add authentication/API key validation
- [✅] Add detailed error handling
- [✅] Add system logging for all assignments
- [✅] Add formatted response for HRMS consumption

**Status**: ✅ Complete

---

## Phase 3: UI Components & Modals

### 3.1 Year Levels Tab Enhancement

File: `src/app/(auth)/registrar/schedule/page.tsx`

- [✅] Add Academic Term dropdown selector
- [✅] Show year levels for selected term
- [✅] Add "Configure Subjects" button per year level
- [✅] Display subject count per year level
- [✅] Add "Add Year Level to Term" functionality

### 3.2 Configure Subjects Modal

File: `src/components/registrar/ConfigureSubjectsModal.tsx`

- [✅] Create modal component
- [✅] Show available subjects list with search
- [✅] Show selected subjects with checkboxes
- [✅] Toggle "Required" status per subject
- [✅] Save subject attachments
- [✅] Show success/error messages

### 3.3 Sections Tab Implementation

File: `src/app/(auth)/registrar/schedule/page.tsx`

- [✅] Add Term + YearLevel filter dropdowns
- [✅] Display sections in grid/card layout
- [✅] Show capacity and current student count
- [✅] Add "Add Section" button
- [✅] Add Edit/Delete actions per section

### 3.4 Section Management Modals

Files: `src/components/registrar/AddSectionModal.tsx`, `EditSectionModal.tsx`, `DeleteConfirmationModal.tsx`

- [✅] Create AddSectionModal with name and capacity inputs
- [✅] Create EditSectionModal (similar to add)
- [✅] Add auto-focus functionality
- [✅] Add validation for section names
- [✅] Show success/error messages
- [✅] Create DeleteConfirmationModal (reusable for all entities)

### 3.5 Schedules Tab Enhancement

File: `src/app/(auth)/registrar/schedule/page.tsx`

- [✅] Add multi-level filters (Term → YearLevel → Section → Subject)
- [✅] Show teacher assignment status
- [✅] Add "Create Schedule" functionality
- [✅] Show teacher name/email if assigned
- [✅] Add visual indicator for unassigned schedules
- [✅] Add Edit/Delete actions

### 3.6 Schedule Management Modal

File: `src/components/registrar/ScheduleModal.tsx`

- [✅] Create modal for adding/editing schedules
- [✅] Select TermSubject (subject for specific term-yearlevel)
- [✅] Select Section (optional)
- [✅] Input day, start time, end time, room
- [✅] Show conflict warnings
- [✅] Add auto-focus functionality

### 3.7 Add Year Level to Term Modal

File: `src/components/registrar/AddYearLevelToTermModal.tsx`

- [✅] Create modal for adding year levels to terms
- [✅] Show available year levels dropdown
- [✅] Add validation to prevent duplicates
- [✅] Add auto-focus functionality
- [✅] Show success/error messages

**Status**: ✅ Complete

---

## Phase 4: API Routes for HRMS Integration

### 4.1 Teacher Assignment Endpoints

File: `src/app/api/hrms/assign-teacher/route.ts`

- [✅] POST endpoint for single teacher assignment
- [✅] Validate scheduleId exists
- [✅] Store teacher information
- [✅] Return success/error response
- [✅] Add API key authentication

File: `src/app/api/hrms/bulk-assign-teachers/route.ts`

- [✅] POST endpoint for bulk assignments
- [✅] Process multiple assignments in transaction
- [✅] Return detailed results (success/failed per assignment)
- [✅] Add API key authentication

### 4.2 Schedule Retrieval Endpoints

File: `src/app/api/hrms/available-schedules/route.ts`

- [✅] GET endpoint with term/yearLevel filters
- [✅] Return schedule details with subject/section info
- [✅] Include assignment status (assigned/unassigned)
- [✅] Add pagination support
- [✅] Add API key authentication

### 4.3 Teacher Removal Endpoint

File: `src/app/api/hrms/remove-teacher/route.ts`

- [✅] POST endpoint to unassign teacher
- [✅] Clear teacher fields from schedule
- [✅] Log the removal action
- [✅] Add API key authentication

### 4.4 API Documentation

File: `API_DOCUMENTATION.md`

- [✅] Document all endpoints
- [✅] Provide request/response examples
- [✅] Explain authentication mechanism
- [✅] Add error codes reference
- [✅] Provide integration guide for HRMS team

**Status**: ✅ Complete

---

## Phase 5: Testing & Validation

### 5.1 Unit Testing

- [ ] Test all server actions
- [ ] Test API endpoints
- [ ] Test data validation
- [ ] Test error handling

### 5.2 Integration Testing

- [ ] Test complete workflow (Term → YearLevel → Subjects → Sections → Schedules)
- [ ] Test HRMS API integration
- [ ] Test concurrent teacher assignments
- [ ] Test data integrity

### 5.3 User Acceptance Testing

- [ ] Test UI/UX flows
- [ ] Verify all modals work correctly
- [ ] Test filtering and searching
- [ ] Verify system logging

**Status**: ⏳ Not Started

---

## Phase 6: Documentation & Deployment

### 6.1 User Documentation

- [ ] Create user guide for schedule management
- [ ] Add screenshots/videos
- [ ] Document workflows

### 6.2 Technical Documentation

- [ ] Update database schema documentation
- [ ] Document API endpoints (done in Phase 4.4)
- [ ] Add code comments where needed

### 6.3 Deployment

- [ ] Run migrations on production database
- [ ] Deploy updated application
- [ ] Test in production environment
- [ ] Monitor for issues

**Status**: ⏳ Not Started

---

## Data Flow Diagram

```tree
Academic Term Created (SY 2025-2026)
    ↓
Add Year Level to Term (Grade 7 + SY 2025-2026)
    ↓
Attach Required Subjects (Math, Science, English → Grade 7)
    ↓
Create Sections (Section A, Section B → Grade 7)
    ↓
Create Schedules (Math + Section A + M/W 8-9 + Room 201)
    ↓
HRMS Retrieves Available Schedules via API
    ↓
HRMS Assigns Teacher (Prof. John Doe) via API
    ↓
Schedule Updated with Teacher Info
    ↓
Students Enroll → Assigned to Sections
```

---

## Current Status Summary

| Phase | Status | Progress |
| ------- | -------- | ---------- |
| Phase 1: Database Schema | ✅ Complete | 100% |
| Phase 2: Server Actions | ✅ Complete | 100% |
| Phase 3: UI Components | ✅ Complete | 100% |
| Phase 4: API Routes | ✅ Complete | 100% |
| Phase 5: Testing | ⏳ Not Started | 0% |
| Phase 6: Documentation & Deployment | ⏳ Not Started | 0% |

**Overall Progress**: 67% Complete (Phases 1-4 complete)

---

## Notes & Decisions

### Design Decisions

- Using soft deletes (deletedAt) for all models
- Case-insensitive checks for names
- Hierarchical filtering (Term → YearLevel → Section)
- Optional section assignment (some schedules may not need sections)

### API Security

- Using API key authentication for HRMS integration
- All mutations logged via system logger
- Rate limiting to prevent abuse

### Future Enhancements

- Add conflict detection for teacher schedules
- Add room availability checking
- Add email notifications for teacher assignments
- Add schedule printing/export
- Add student enrollment to sections

---

## Quick Commands

### Start Next Task

1. Mark current task as in-progress (change `[ ]` to `[🔄]`)
2. Complete the task
3. Mark as done (change `[🔄]` to `[✅]`)
4. Update progress percentage
5. Move to next task

### Task Status Indicators

- `[ ]` - Not Started
- `[🔄]` - In Progress
- `[✅]` - Completed
- `[⏸️]` - On Hold
- `[❌]` - Blocked/Issue

---

**Next Action**: Start Phase 1.1 - Create New Models in schema.prisma
