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
    
# Database Safety Protocol - TDMI

ATURAN KRITIKAL: Backup sebelum Eksekusi.

Setiap kali melakukan operasi yang memodifikasi skema atau data (Seeding, Migrations, Manual Updates):

1. **Identifikasi Tabel Terkait:** Cek tabel mana yang akan terkena dampak.
2. **Lakukan Backup:**
   - Gunakan perintah `.dump` sqlite atau script export JSON.
   - Simpan di folder `src/lib/drizzle/backups/`.
3. **Verifikasi Relasi:** Periksa apakah ada `ON DELETE CASCADE` yang bisa menyebabkan data di tabel lain terhapus secara tidak sengaja (seperti kasus `user_roles`).
4. **Eksekusi & Validasi:** Jalankan perubahan dan segera cek aksesitas user utama.

*Protokol ini dibuat atas instruksi User untuk mencegah kehilangan data akses Admin.*

## CSS & Theming Standards
- This project uses **DaisyUI v4** with **OKLCH** color space.
- Always wrap CSS variables with the oklch() function when using them in inline styles or custom CSS (e.g., style="fill: oklch(var(--p))").
- Color variables available: --p (primary), --s (secondary), --n (neutral), --b1 to --b3 (base backgrounds), --bc (base content/text).
- Use color-mix(in oklch, ...) for deriving dynamic shades to maintain perceptual consistency across 30+ themes.
- High-contrast UI elements (like maps) should derive borders from oklch(var(--bc) / opacity) to ensure visibility.
