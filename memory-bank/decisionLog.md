# Decision Log

This file records architectural and implementation decisions using a list format.
2025-08-17 01:42:55 - Log of updates made.

*

## Decision

*   [2025-08-17 01:55:03] - Simplified Piket Schedule Form: Removed role selection as it's now auto-assigned to 'role-piket-admin' in the backend.
    *   Rationale: Streamline UI and backend logic, reduce redundancy.
    *   Implementation Details: Removed dropdown from Svelte component, removed 'Peran Ruasa'' column from table, set 'roleId' permanently in API endpoint, removed unnecessary role data fetching in `+page.server.ts`.
*   [2025-08-17 01:55:03] - Implemented RBAC for 'ruasa''.
    *   Rationale: Enhance access control granularity.
    *   Implementation Details: Database-driven RBAC system.
*   [2025-08-17 01:55:03] - Modified Murid Table Schema: Added gender and photo columns.
    *   Rationale: Support more detailed murid data.
    *   Implementation Details: Schema migration.
*   [2025-08-17 01:55:03] - Refactored MuridModal for Centralized State Management: Used a Svelte store (`muridModalStore`) to manage modal data.
    *   Rationale: Prevent redundant API calls, ensure data consistency across modal instances.
    *   Implementation Details: Centralized store usage, `clearSelection` method for SuperTable, proper filter state management.
*   [2025-08-17 01:55:03] - Implemented Name Selection from Similar Murid Alert.
    *   Rationale: Improve user experience for data entry.
    *   Implementation Details: Enhanced `SimilarMuridsAlert` and `PersonalInfoForm`.
*   [2025-08-17 01:55:03] - Updated User Deletion Logic: Now uses permission-based access control.
    *   Rationale: Enhance security and maintainability.
    *   Implementation Details: Integrated with RBAC system.
*   [2025-08-17 01:55:03] - Migrated File Uploads to Cloudinary from Google Drive.
    *   Rationale: Centralized and efficient file management.
    *   Implementation Details: Updated file upload handling to use `muridId` for Cloudinary uploads, updated dependencies.