# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-08-17 01:43:56 - Log of updates made.

*

## Coding Patterns

*   **Centralized Svelte Stores for Modals:** Utilize dedicated Svelte stores (e.g., `muridModalStore`) for managing modal-specific data and state to ensure data consistency and prevent redundant API calls across different modal instances.
*   **Reactive Statements (`$:`):** Employ Svelte's reactive statements for derived state calculations and managing side effects (e.g., API calls, DOM manipulations) that depend on reactive values, ensuring efficient and declarative updates.
*   **Modular API Services:** Abstract API interactions into dedicated service functions or modules (e.g., `src/lib/utils/api.ts` or `src/lib/services/`) to maintain separation of concerns, improve testability, and promote reusability.

## Architectural Patterns

*   **Database-Driven Role-Based Access Control (RBAC):** Implement a flexible RBAC system managed entirely through the database, allowing dynamic permission management without code changes. This includes granular permissions, role hierarchies, and checks for territory scope and write action hierarchies.
*   **Centralized Data Table Component (SuperTable):** Leverage the `SuperTable` component as a foundational pattern for displaying, filtering, sorting, and paginating data across the application, ensuring consistent UI/UX and efficient data handling.
*   **Cloudinary for File Storage:** Utilize Cloudinary for all file upload and storage needs, centralizing media management and replacing previous solutions like Google Drive integration.

## Testing Patterns

*   No specific testing patterns identified from recent commits, beyond general adherence to project rules.