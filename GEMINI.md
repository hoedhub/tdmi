# Project Overview

This is a SvelteKit web application for "Sistem Manajemen TDMI", an internal tool for managing member data (murid), activities (nasyath), and user administration.

**Key Technologies:**

*   **Framework:** SvelteKit
*   **Database:** Turso (via LibSQL) with Drizzle ORM
*   **Authentication:** Lucia Auth
*   **Styling:** Tailwind CSS with DaisyUI
*   **Language:** TypeScript

**Architecture:**

*   The application uses a server-side authentication model with Lucia Auth, handling sessions via cookies as seen in `src/hooks.server.ts`.
*   It features a database-driven Role-Based Access Control (RBAC) system, allowing for dynamic permission management.
*   The database schema, defined in `src/lib/drizzle/schema.ts`, includes tables for users, roles, permissions, members, activities, and territorial data.
*   Drizzle ORM is used for database interaction, with configuration in `drizzle.config.ts` pointing to a Turso database.

# Building and Running

**Installation:**

1.  Install dependencies:
    ```bash
    pnpm install
    ```

2.  Configure environment variables by creating a `.env` file. It should contain:
    ```
    TURSO_CONNECTION_URL="<your_turso_db_url>"
    TURSO_AUTH_TOKEN="<your_turso_auth_token>"
    ```

**Development:**

*   Run the development server:
    ```bash
    pnpm dev
    ```

**Production:**

*   Build the application:
    ```bash
    pnpm build
    ```

*   Preview the production build:
    ```bash
    pnpm preview
    ```

**Database:**

*   Generate database migrations:
    ```bash
    pnpm db:generate
    ```

*   Apply database migrations:
    ```bash
    pnpm db:migrate
    ```

*   Seed the database:
    ```bash
    pnpm db:seed
    ```

*   Open Drizzle Studio:
    ```bash
    pnpm db:studio
    ```

# Development Conventions

*   **Linting and Formatting:** The project uses ESLint and Prettier for code quality.
    *   Check for linting errors: `pnpm lint`
    *   Format code: `pnpm format`
*   **Type Checking:** Svelte Check is used for type validation.
    *   Run type checking: `pnpm check`
