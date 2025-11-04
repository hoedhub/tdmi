# Sistem Manajemen TDMI Brownfield Enhancement PRD

## 1. Intro Project Analysis and Context

### 1.1. Existing Project Overview

#### 1.1.1. Analysis Source

Document-project output available at: `docs/brownfield-architecture.md`

#### 1.1.2. Current Project State

This is a SvelteKit web application for "Sistem Manajemen TDMI", an internal tool for managing member data (murid), activities (nasyath), and user administration. It uses a server-side authentication model with Lucia Auth and a database-driven Role-Based Access Control (RBAC) system. The database is Turso (via LibSQL) with Drizzle ORM.

## 1.2. Available Documentation Analysis

Using existing project analysis from `document-project` output.

**Key Documents Created by `document-project`:**

*   `docs/brownfield-architecture.md` (Comprehensive Brownfield Architecture Document)

## 1.3. Enhancement Scope Definition

#### 1.3.1. Enhancement Type

*   Technology Stack Upgrade

#### 1.3.2. Enhancement Description

This enhancement involves upgrading the project's frontend framework from Svelte 4 to Svelte 5. This is a critical update driven by Vercel's deprecation of Svelte 4 support, making the project undeployable in its current state.

#### 1.3.3. Impact Assessment

*   Major Impact (architectural changes required)

## 1.4. Goals and Background Context

#### 1.4.1. Goals

*   Enable successful deployment of the application on Vercel.
*   Ensure long-term maintainability and compatibility with the modern Svelte ecosystem.
*   Leverage new Svelte 5 features for improved developer experience and potential performance gains.

#### 1.4.2. Background Context

The project is currently built with Svelte 4. Vercel, the chosen deployment platform, has ceased support for Svelte 4, rendering the application undeployable. This upgrade is a critical necessity to resolve the deployment blocker and ensure the project's continued viability and future development. It aligns with the project's need for a stable and up-to-date technology stack.

## 1.5. Change Log

| Change                 | Date       | Version | Description                 | Author |
| :--------------------- | :--------- | :------ | :-------------------------- | :----- |
| Initial PRD Creation   | 2025-11-04 | 1.0     | Initial Brownfield PRD for Svelte 5 Upgrade | John   |

## 2. Requirements

### 2.1. Functional Requirements

*   **FR1:** The application shall function identically to its Svelte 4 counterpart after the Svelte 5 upgrade.
*   **FR2:** All existing user interactions and data flows shall be preserved.
*   **FR3:** The application shall be deployable on Vercel after the upgrade.

### 2.2. Non-Functional Requirements

*   **NFR1:** The application's performance (load times, responsiveness) shall not degrade after the Svelte 5 upgrade.
*   **NFR2:** The application shall maintain its current level of security.
*   **NFR3:** The codebase shall adhere to Svelte 5 best practices and conventions.

### 2.3. Compatibility Requirements

*   **CR1:** Existing APIs remain unchanged.
*   **CR2:** Database schema changes are backward compatible.
*   **CR3:** UI changes follow existing patterns.
*   **CR4:** Integration with existing backend services (Lucia Auth, Drizzle ORM) remains functional.

## 3. User Interface Enhancement Goals

### 3.1. Integration with Existing UI

The Svelte 5 upgrade will not introduce new UI elements. Instead, it will focus on refactoring the existing Svelte 4 components to use Svelte 5's new features (runes, snippets, etc.). The refactored components will continue to use DaisyUI and Tailwind CSS, and will adhere to the project's existing visual design and style guides.

### 3.2. Modified/New Screens and Views

All existing screens and views will be modified as they are all built with Svelte 4. No new screens or views will be added as part of this upgrade.

### 3.3. UI Consistency Requirements

The refactored Svelte 5 components must be visually and functionally identical to their Svelte 4 counterparts. The user experience should remain unchanged after the upgrade.

## 4. Technical Constraints and Integration Requirements

### 4.1. Existing Technology Stack

**Languages**: TypeScript
**Frameworks**: SvelteKit (^2.44.0), Svelte (^4.2.20)
**Database**: Turso (LibSQL) (^0.15.8) with Drizzle ORM (^0.44.3)
**Authentication**: Lucia Auth (^3.2.2)
**Styling**: Tailwind CSS (^3.4.17) with DaisyUI (^4.12.24)
**Bundler**: Vite (^5.4.10)
**Runtime**: Node.js (>=22)
**External Dependencies**: Cloudinary, Google APIs

### 4.2. Integration Approach

**Database Integration Strategy**: The Svelte 5 upgrade is a frontend-only change and will not directly impact the database integration strategy. Drizzle ORM will continue to be used for all database interactions.
**API Integration Strategy**: The existing SvelteKit API routes will remain unchanged. The frontend will continue to interact with these APIs as before.
**Frontend Integration Strategy**: The existing Svelte 4 components will be refactored to Svelte 5 runes and snippets. The goal is to maintain the current component structure and interaction patterns.
**Testing Integration Strategy**: Currently, there are no automated tests. Post-upgrade, manual testing will be critical to ensure no regressions. The upgrade should ideally pave the way for introducing automated testing in the future.

### 4.3. Code Organization and Standards

**File Structure Approach**: The existing SvelteKit file structure (e.g., `src/routes`, `src/lib/components`, `src/lib/drizzle`) will be maintained.
**Naming Conventions**: Existing naming conventions for components, variables, and functions will be preserved.
**Coding Standards**: The project uses ESLint and Prettier. These configurations will be updated to support Svelte 5 best practices.
**Documentation Standards**: The `brownfield-architecture.md` document will be updated to reflect the Svelte 5 upgrade.

### 4.4. Deployment and Operations

**Build Process Integration**: The existing `pnpm build` command will be updated to support Svelte 5. The build process will continue to use Vite.
**Deployment Strategy**: The project will continue to be deployed on Vercel using the `@sveltejs/adapter-vercel`. The Svelte 5 upgrade is specifically to enable continued deployment on Vercel.
**Monitoring and Logging**: Existing monitoring and logging practices will remain unchanged.
**Configuration Management**: Environment variables will continue to be managed via the `.env` file.

### 4.5. Risk Assessment and Mitigation

**Technical Risks**:
*   **Complexity of Svelte 5 Migration**: The migration to runes, snippets, and new event handling is a significant refactoring effort.
*   **Third-party Library Compatibility**: Some existing Svelte libraries or components might not be immediately compatible with Svelte 5.
*   **Performance Regressions**: Despite Svelte 5's performance promises, there's a risk of unintended performance regressions if not carefully managed.
**Integration Risks**:
*   **Frontend-Backend Communication**: Risk of breaking existing API calls or data serialization/deserialization if not carefully handled during refactoring.
*   **Lucia Auth Integration**: Ensuring Lucia Auth continues to function correctly with the Svelte 5 frontend.
**Deployment Risks**:
*   **Vercel Build Issues**: New build issues might arise with Svelte 5 on Vercel, requiring troubleshooting.
**Mitigation Strategies**:
*   **Phased Migration**: Consider migrating components incrementally if feasible, rather than a big-bang approach.
*   **Thorough Testing**: Comprehensive manual testing across all features is crucial.
*   **Dependency Review**: Proactively identify and update or replace incompatible third-party libraries.
*   **Version Control**: Utilize Git effectively for small, atomic commits to allow for easy rollback if issues arise.
*   **Documentation**: Update the `brownfield-architecture.md` document to reflect the new Svelte 5 architecture and any new technical debt or workarounds.

## 5. Epic and Story Structure

### 5.1. Epic Approach

**Epic Structure Decision**: This enhancement will be structured as a single, comprehensive epic. The Svelte 5 upgrade is a highly interconnected task that impacts the entire frontend codebase. Breaking it into multiple, smaller epics would likely lead to increased complexity in managing dependencies, potential inconsistencies, and a higher risk of integration issues. A single epic allows for a unified approach to refactoring, testing, and deployment, ensuring that all frontend components are upgraded cohesively.

## 6. Epic 1: Svelte 5 Upgrade

**Epic Goal**: Successfully upgrade the entire frontend of the "Sistem Manajemen TDMI" application to Svelte 5, ensuring full compatibility with Vercel deployment, maintaining existing functionality, and adhering to Svelte 5 best practices.

**Integration Requirements**: The Svelte 5 upgrade must seamlessly integrate with the existing backend (Lucia Auth, Drizzle ORM, SvelteKit API routes) without requiring any changes to backend logic or database schema. All existing UI patterns (DaisyUI, Tailwind CSS) must be preserved.

### Stories

#### Story 1.1 Prepare Project for Svelte 5 Upgrade

As a Developer,
I want to set up the project environment and update core dependencies,
so that the project is ready for Svelte 5 migration.

*   **Acceptance Criteria**
    1.  Project dependencies updated to Svelte 5 compatible versions.
    2.  `svelte.config.js`, `vite.config.ts`, `tsconfig.json` updated for Svelte 5.
    3.  ESLint and Prettier configurations updated for Svelte 5.
    4.  `npx sv migrate svelte-5` command executed successfully.
    5.  Application still builds (even if not fully functional yet).
*   **Integration Verification**
    1.  IV1: Verify `package.json` reflects Svelte 5 dependencies.
    2.  IV2: Verify project builds without critical errors.

#### Story 1.2 Migrate Core Layout and Authentication Components to Svelte 5 Runes

As a Developer,
I want to refactor essential layout and authentication-related Svelte components,
so that they use Svelte 5 runes and snippets and maintain existing functionality.

*   **Acceptance Criteria**
    1.  `src/hooks.server.ts` (theme loading logic) refactored to Svelte 5.
    2.  `SidebarLayout.svelte` refactored to Svelte 5 runes and snippets.
    3.  `ThemePicker.svelte` and `UserMenu.svelte` refactored to Svelte 5 runes and snippets.
    4.  Authentication flow (login/logout) remains fully functional.
    5.  Basic layout and theme switching function correctly.
*   **Integration Verification**
    1.  IV1: Verify user can log in and log out successfully.
    2.  IV2: Verify sidebar functionality and theme switching work as expected.
    3.  IV3: Verify no visual regressions in core layout.

#### Story 1.3 Migrate Data Display Components (SuperTable) to Svelte 5 Runes

As a Developer,
I want to refactor complex data display components, specifically `SuperTable` and its subcomponents,
so that they use Svelte 5 runes and snippets and maintain existing functionality.

*   **Acceptance Criteria**
    1.  `SuperTable.svelte` and its subcomponents (`TableHeader.svelte`, `TableRowDesktop.svelte`, `TableRowMobileCard.svelte`, `PaginationControls.svelte`, etc.) refactored to Svelte 5 runes and snippets.
    2.  Data filtering, sorting, pagination, and selection functionality in `SuperTable` remains fully functional.
    3.  All data display components render correctly without visual regressions.
*   **Integration Verification**
    1.  IV1: Verify data tables display correctly with all features (sorting, filtering, pagination, selection).
    2.  IV2: Verify no regressions in data manipulation or display.

#### Story 1.4 Migrate Remaining Svelte Components to Svelte 5 Runes

As a Developer,
I want to refactor all other Svelte components in `src/lib/components` and `src/routes`,
so that they use Svelte 5 runes and snippets and maintain existing functionality.

*   **Acceptance Criteria**
    1.  All `.svelte` files in the project refactored to Svelte 5.
    2.  All application features function identically to their Svelte 4 counterparts.
    3.  No visual or functional regressions introduced.
*   **Integration Verification**
    1.  IV1: Conduct comprehensive end-to-end testing of all application features.
    2.  IV2: Verify all forms, data entry, and interactive elements function correctly.

#### Story 1.5 Final Testing, Deployment Verification, and Documentation Update

As a Developer,
I want to perform final comprehensive testing, verify successful deployment on Vercel, and update project documentation,
so that the Svelte 5 upgrade is complete and the application is fully functional and deployable.

*   **Acceptance Criteria**
    1.  All automated and manual tests pass.
    2.  Application successfully deployed to Vercel.
    3.  `brownfield-architecture.md` updated to reflect Svelte 5 upgrade.
    4.  No critical bugs or regressions identified.
*   **Integration Verification**
    1.  IV1: Verify application is accessible and fully functional on Vercel.
    2.  IV2: Verify `brownfield-architecture.md` accurately reflects the Svelte 5 tech stack.
