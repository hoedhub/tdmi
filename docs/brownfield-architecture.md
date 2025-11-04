# Sistem Manajemen TDMI Brownfield Architecture Document

## Introduction

This document captures the CURRENT STATE of the Sistem Manajemen TDMI codebase, including technical debt, workarounds, and real-world patterns. It serves as a reference for AI agents working on enhancements, particularly the upcoming upgrade to Svelte 5.

### Document Scope

Comprehensive documentation of the entire system, with a focus on areas relevant to upgrading to Svelte 5.

### Change Log

| Date       | Version | Description                 | Author |
|------------|---------|-----------------------------|--------|
| 2025-11-04 | 1.0     | Initial brownfield analysis | Mary   |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry (SvelteKit)**: `src/routes/+layout.svelte` and `src/routes/+page.svelte`
- **Configuration**: `svelte.config.js`, `vite.config.ts`, `tailwind.config.ts`, `drizzle.config.ts`
- **Core Business Logic**: `src/lib/server/`, `src/lib/utils/`
- **API Definitions**: SvelteKit API routes in `src/routes/api/`
- **Database Models**: `src/lib/drizzle/schema.ts`
- **Authentication**: `src/hooks.server.ts` (Lucia Auth)

## High Level Architecture

### Technical Summary

This is a SvelteKit web application for "Sistem Manajemen TDMI", an internal tool for managing member data (murid), activities (nasyath), and user administration. It uses a server-side authentication model with Lucia Auth and a database-driven Role-Based Access Control (RBAC) system. The database is Turso (via LibSQL) with Drizzle ORM.

### Actual Tech Stack (from package.json)

| Category      | Technology              | Version      | Notes                                            |
|---------------|-------------------------|--------------|--------------------------------------------------|
| Runtime       | Node.js                 | >=22         | As specified in `package.json`                   |
| Framework     | SvelteKit               | ^2.44.0      | Core application framework                       |
| Database      | Turso (LibSQL)          | ^0.15.8      | Database provider                                |
| ORM           | Drizzle ORM             | ^0.44.3      | Database object-relational mapper                |
| Authentication| Lucia Auth              | ^3.2.2       | Authentication and session management            |
| Styling       | Tailwind CSS            | ^3.4.17      | CSS framework                                    |
| UI Components | DaisyUI                 | ^4.12.24     | Tailwind CSS component library                   |
| Language      | TypeScript              | ^5.8.3       | Primary language                                 |
| Bundler       | Vite                    | ^5.4.10      | Build tool                                       |
| Linting       | ESLint                  | ^8.57.1      | Code linting                                     |
| Formatting    | Prettier                | ^3.5.3       | Code formatting                                  |

### Repository Structure Reality Check

- **Type**: Monorepo
- **Package Manager**: pnpm
- **Notable**: The project uses a `.bmad-core` directory for AI agent configurations.

## Source Tree and Module Organization

### Project Structure (Actual)

```text
project-root/
├── src/
│   ├── lib/
│   │   ├── components/    # Reusable Svelte components
│   │   ├── drizzle/       # Drizzle ORM schema and configuration
│   │   ├── server/        # Server-side logic (e.g., auth)
│   │   └── utils/         # Utility functions
│   ├── routes/            # SvelteKit routes (pages and API endpoints)
│   ├── app.css            # Global styles
│   ├── app.d.ts           # Global type definitions
│   ├── app.html           # Main HTML template
│   └── hooks.server.ts    # Server-side hooks (authentication)
├── static/                # Static assets (images, fonts)
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Project dependencies and scripts
├── svelte.config.js       # SvelteKit configuration
└── tailwind.config.ts     # Tailwind CSS configuration
```

### Key Modules and Their Purpose

- **User Management**: Logic is likely distributed between `src/routes/admin/` for UI and `src/lib/server/` for backend operations.
- **Authentication**: `src/hooks.server.ts` and `src/lib/server/auth.ts` (inferred) handle authentication using Lucia Auth.
- **Database**: `src/lib/drizzle/schema.ts` defines the database schema, and Drizzle ORM is used for database interactions throughout the app.
- **RBAC**: The RBAC logic is implemented based on the schema in `src/lib/drizzle/schema.ts` and likely enforced in server-side code within the `src/routes/` directory.

## Data Models and APIs

### Data Models

The single source of truth for data models is the Drizzle schema.

- **See `src/lib/drizzle/schema.ts` for all data models.**

### API Specifications

- API endpoints are defined as SvelteKit API routes within the `src/routes/api/` directory. There is no separate OpenAPI or Postman collection.

## Technical Debt and Known Issues

### Critical Technical Debt

1.  **Svelte Version**: The project is on Svelte 4, and the user wants to upgrade to Svelte 5. This will require a significant refactoring effort.
2.  **Lack of Tests**: The `package.json` file does not contain any scripts for running tests, indicating a lack of automated testing. This increases the risk of regressions during bug fixes and feature additions.
3.  **Manual Database Seeding**: The `db:seed` script runs a TypeScript file. While this works, it might be less robust than using a dedicated seeding library.

### Workarounds and Gotchas

- **Theme Loading**: The theme is loaded via a script injected into the HTML head in `src/hooks.server.ts`. This is a workaround to prevent flashing of the wrong theme on page load.

## Integration Points and External Dependencies

### External Services

| Service    | Purpose         | Integration Type | Key Files/Dependencies |
|------------|-----------------|------------------|------------------------|
| Turso      | Database        | SDK              | `@libsql/client`       |
| Cloudinary | Image Storage   | SDK              | `cloudinary`           |
| Google APIs| (Not specified) | SDK              | `googleapis`           |

### Internal Integration Points

- **Frontend-Backend**: Communication is handled by SvelteKit's server-side rendering and API routes.
- **Authentication-Database**: Lucia Auth is tightly integrated with the Drizzle ORM and the Turso database.

## Development and Deployment

### Local Development Setup

1.  Install dependencies with `pnpm install`.
2.  Set up the `.env` file with `TURSO_CONNECTION_URL` and `TURSO_AUTH_TOKEN`.
3.  Run database migrations with `pnpm db:migrate`.
4.  Run the development server with `pnpm dev`.

### Build and Deployment Process

- **Build Command**: `pnpm build`
- **Deployment**: The project uses `@sveltejs/adapter-vercel`, so it's likely deployed to Vercel.

## Testing Reality

### Current Test Coverage

- There are no automated tests configured in this project.

### Running Tests

- No test scripts are available.

## If Enhancement PRD Provided - Impact Analysis (Svelte 5 Upgrade)

### Files That Will Need Modification

Upgrading to Svelte 5 will likely require changes to all `.svelte` files to adopt the new features like runes.

- **All files in `src/lib/components/` and `src/routes/` will need to be reviewed and potentially refactored.**
- `svelte.config.js` and `vite.config.ts` may need adjustments.
- `package.json` will need to be updated with the new Svelte and SvelteKit versions.

### New Files/Modules Needed

- No new files are strictly necessary for the upgrade, but it might be a good opportunity to refactor and create new, more modular components.

### Integration Considerations

- The upgrade should not directly affect the backend logic (database, authentication, RBAC), but it's crucial to ensure that the frontend continues to interact with the backend correctly.
- All Svelte-related dependencies will need to be checked for compatibility with Svelte 5.

## Appendix - Useful Commands and Scripts

### Frequently Used Commands

```bash
pnpm dev         # Start development server
pnpm build       # Production build
pnpm preview     # Preview production build
pnpm check       # Type-check the project
pnpm lint        # Lint the project
pnpm format      # Format the project
pnpm db:generate # Generate database migrations
pnpm db:migrate  # Apply database migrations
pnpm db:seed     # Seed the database
pnpm db:studio   # Open Drizzle Studio
```
