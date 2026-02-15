# Specification

## Summary
**Goal:** Add an employee designation field and enable admins to manually record/view attendance for any selected date (not just today).

**Planned changes:**
- Add a required “Designation” text field to the employee data model and backend APIs; persist it on employee creation.
- Update the “Add New Employee” form to include a required Designation input with clear English validation, and display designation on employee list cards and the Employee Profile page.
- Add backend date-based attendance support: upsert attendance for (employeeId, date) and fetch attendance for (employeeId, date), while keeping existing today-based behavior working via date-based logic.
- Update the Daily Attendance page to include a date selector (defaulting to today) and load/save each employee’s attendance against the currently selected date.
- Make React Query attendance hooks date-aware (date-scoped cache keys) and ensure correct invalidation/refetch after saving entries or changing the selected date.

**User-visible outcome:** Users can create employees with a required designation and see it throughout the app, and admins can select any date on the Daily Attendance page to manually enter and view staff attendance for that day.
