# ONBOARDING CODEBASE TDMI4

> Terakhir diperbarui: 2026-06-29 (setelah implementasi 8 rekomendasi)

## APA INI?

TDMI4 adalah sistem informasi internal untuk **Thariqah Dusuqiyah Muhammadiyah Indonesia (TDMI)** -- lembaga thariqah. Aplikasi web yang menangani:

- Manajemen data murid/santri (pendataan)
- Pencatatan kegiatan/aktivitas (nasyath)
- Jadwal piket
- Pertanyaan publik (Ayyu Su'aal / Ahbab)
- User management + RBAC
- Export/import Excel & PDF
- Visualisasi graf jaringan murid

---

## TECH STACK

| Layer           | Teknologi                                 |
|-----------------|-------------------------------------------|
| Framework       | SvelteKit 2.48+ (Svelte 5 dengan runes)   |
| Language        | TypeScript 5.9+                           |
| Build           | Vite 7.1+                                 |
| Database        | Turso (LibSQL) via Drizzle ORM            |
| Auth            | Lucia Auth v3 (Argon2id, session cookie)  |
| Styling         | Tailwind CSS 3.4 + DaisyUI 4.12           |
| Charts          | Chart.js + Cytoscape.js (graf jaringan)   |
| Icons           | Lucide Svelte                             |
| File Upload     | Cloudinary + Sharp                        |
| Excel           | ExcelJS (import/export)                   |
| PDF             | pdf-lib + html2pdf.js                     |
| Email           | Nodemailer (Gmail SMTP)                   |
| CAPTCHA         | Cloudflare Turnstile                      |
| Offline Cache   | Dexie (IndexedDB)                         |
| Deploy          | Vercel (@sveltejs/adapter-vercel)         |
| Package Manager | pnpm                                      |
| Monitoring      | @vercel/speed-insights + custom error_log |
| Testing         | Vitest 4.1 + @testing-library/svelte 5.4  |
| Validation      | Zod 4.4 (API input validation + type inference) |
---

## STRUKTUR DIREKTORI

```
src/
├── app.css / app.html / app.d.ts      # Shell app
├── hooks.server.ts                     # Auth middleware global
├── hooks.client.ts                     # Client hooks
├── lib/
│   ├── components/                     # 74 komponen Svelte
│   │   ├── SuperTable/                 # Tabel canggih (681 lines main)
│   │   ├── toast/                      # Toast notification system
│   │   ├── data-entry/                 # Form murid (multi-step)
│   │   ├── forms/                      # Sub-form (PersonalInfo, Contact, dll)
│   │   ├── charts/                     # BaseChart, IndonesiaMap, DistributionBar
│   │   ├── layout/                     # AdminHeader, AdminLayout
│   │   └── navigation/                # Breadcrumb, SidebarNav
│   ├── drizzle/                        # DB layer
│   │   ├── schema.ts                   # 14 tabel, definisi lengkap
│   │   ├── index.ts                    # DB client init
│   │   ├── migrations/                 # 7 migrasi SQL
│   │   └── scripts/                    # Seed, check, migrate, backfill
│   ├── server/                         # Server-only code (TIDAK ke client)
│   │   ├── auth.ts                     # Lucia config
│   │   ├── accessControl.ts/DB.ts      # RBAC logic + hierarchy
│   │   ├── cloudinary.ts               # Image upload/delete
│   │   ├── email.ts                    # Nodemailer (ticket konfirmasi)
│   │   ├── murid.ts                    # Server-side murid queries
│   │   └── nasyath.ts/nasyath-data.ts  # Nasyath queries + access
│   ├── stores/                         # 7 Svelte stores
│   │   ├── themeStore.ts               # Theme (localStorage per-user)
│   │   ├── tablePersistence.svelte.ts  # SuperTable state ($state rune)
│   │   ├── muridForm.ts               # Form state client
│   │   ├── muridModalStore.ts         # Modal data + API fetch
│   │   ├── preferenceService.ts       # localStorage wrapper
│   │   ├── absoluteDropdown.ts        # Dropdown overlay state
│   │   └── tooltipStore.ts            # Tooltip state
│   ├── utils/                          # Utility functions
│   │   ├── api.ts, date.ts, string.ts  # General utils
│   │   ├── arabic-shaper.ts            # Arabic text shaping (TypeScript)
│   │   ├── toHindi.ts                  # Hindi numerals
│   │   └── formatMurid.ts             # Murid data formatter
│   ├── schemas/                        # Zod validation schemas
│   │   └── api.ts                      # API input/output type definitions
│   └── constants/                      # Country codes dll
├── routes/
│   ├── login/                          # Halaman login (public)
│   ├── tanya/                          # Form pertanyaan (public + Turnstile)
│   ├── member/                         # Area member (protected)
│   │   ├── pendataan/                  # CRUD murid + map + tabel + import/export
│   │   ├── nasyath_mun/               # CRUD nasyath + charts + export
│   │   ├── ayyu-sual/                  # Manajemen pertanyaan
│   │   └── profile/                    # Ubah password
│   ├── admin/                          # Area admin (perm-admin-access)
│   │   ├── users/                      # User CRUD
│   │   ├── rbac/                       # Role & permission management
│   │   ├── piket/                      # Jadwal piket
│   │   ├── backup/                     # Database dump
│   │   └── error-logs/                 # Error log viewer
│   └── api/                            # REST API (20+ endpoints)
├── static/                             # Fonts (Arabic), logo, geo JSON
├── docs/                               # PRD, arsitektur, catatan teknis
└── tests/                              # Custom test scripts (.mjs)
```

**Statistik**: ~320 file source, 74 komponen .svelte, 121 file .ts

---

## DATABASE SCHEMA (14 TABEL)

### Hierarki Wilayah

```
propinsi -> kokab -> kecamatan -> deskel
```

### Tabel Utama

- **murid** -- Data santri dengan 4 self-reference (muhrim, mursyid, baiat, wirid), foto via Cloudinary, territory scoping via deskel_id
- **nasyath** -- Kegiatan santri (FK ke murid + users sebagai updater)
- **users** -- Akun login (FK opsional ke murid)
- **session** -- Session cookies (Lucia)
- **piket_schedule** -- Jadwal piket (FK ke users + roles)
- **pertanyaan_ahbab** -- Pertanyaan publik dengan status hijau/kuning/merah

### RBAC

- **roles** -- Nama + deskripsi
- **permissions** -- Daftar permission (perm-*)
- **user_roles** -- Mapping user <-> role
- **role_permissions** -- Mapping role <-> permission
- **role_hierarchy** -- Parent-child role (recursive CTE untuk inheritance)
- **error_log** -- Error logging (client + server, resolvable)

### Self-References Murid

Self-references murid adalah fitur kunci: muhrim (wali), mursyid (guru), baiat (pembaiat), wirid (pembimbing wirid) -- semuanya merujuk ke murid lain.

### Relationship Summary

| Parent | Child | Type | On Delete |
|--------|-------|------|-----------|
| prop | kokab | 1:N | - |
| kokab | kecamatan | 1:N | - |
| kecamatan | deskel | 1:N | - |
| deskel | murid | 1:N | SET NULL |
| murid | murid (self: muhrim) | 1:N | SET NULL |
| murid | murid (self: mursyid) | 1:N | SET NULL |
| murid | murid (self: baiat) | 1:N | SET NULL |
| murid | murid (self: wirid) | 1:N | SET NULL |
| murid | nasyath | 1:N | CASCADE |
| users | session | 1:N | CASCADE |
| users | murid | 1:1 (optional) | SET NULL |
| users | nasyath (as updater) | 1:N | NO ACTION |
| users | piket_schedule | 1:N | CASCADE |
| roles | piket_schedule | 1:N | CASCADE |
| users | user_roles | 1:N | CASCADE |
| roles | user_roles | 1:N | CASCADE |
| roles | role_permissions | 1:N | CASCADE |
| permissions | role_permissions | 1:N | CASCADE |
| roles | role_hierarchy (parent) | 1:N | CASCADE |
| roles | role_hierarchy (child) | 1:N | CASCADE |
| users | error_log | 1:N | SET NULL |

---

## ARSITEKTUR AUTENTIKASI & RBAC

### Auth Flow

1. `hooks.server.ts` -- Validasi session cookie di SETIAP request (Lucia)
2. `+layout.server.ts` -- Inject user + 4 permission flags ke layout data
3. Route-specific `+layout.server.ts` (admin/) -- Guard tambahan
4. Individual server loads/actions -- `requirePermission(locals, perm, resource?)` (preferred) atau `userHasPermission(userId, perm, resource?)` (manual)

### RBAC Helper Functions

**`requireAuth(locals)`** -- Cek user sudah login, throw 401 jika belum. Return user object.

**`requirePermission(locals, permissionId, resource?)`** -- Cek auth + permission sekaligus. Throw 401/403 jika gagal. Return user object. Ini cara yang direkomendasikan untuk API endpoint.

```typescript
// Cara baru (recommended):
const user = await requirePermission(locals, 'perm-backup-create');

// Cara lama (masih valid tapi lebih verbose):
if (!locals.user) throw error(401, 'Unauthorized');
const canBackup = await userHasPermission(locals.user.id, 'perm-backup-create');
if (!canBackup) throw error(403, 'Forbidden');
```

### RBAC Decision Flow

1. Get static roles (user_roles)
2. Get dynamic piket roles (jika tanggal sekarang dalam range jadwal)
3. Merge jadi effectiveRoles
4. Get permissions untuk semua effective roles
5. Base permission check
6. Territory check (untuk role `-propinsi`, bandingkan propinsi user vs resource)
7. Hierarchy check (untuk write, cek apakah target role adalah sub-role via recursive CTE)

### Role Hierarchy

```
role-admin
  ├── role-naib
  │     ├── role-pendataan
  │     │     └── role-pendataan-propinsi
  │     ├── role-nasyath
  │     │     └── role-nasyath-propinsi
  │     ├── role-legalitas
  │     │     └── role-legalitas-propinsi
  │     ├── role-maaliyah
  │     │     └── role-maaliyah-propinsi
  │     └── role-lajnah-ilqo
  ├── role-wakil-naib
  ├── role-piket-admin
  ├── role-manager
  ├── role-editor
  ├── role-viewer
  ├── role-territory-manager
  ├── role-territory-editor
  └── role-piket-manager
```

### Permission Categories

- `perm-user-read/write` -- User management
- `perm-role-read/write` -- Role management
- `perm-territory-read` -- Territory viewing
- `perm-data-read-all` -- Read all data
- `perm-data-write-scoped` -- Write within scope
- `perm-pendataan-access/write/read` -- Pendataan section
- `perm-nasyath-access/write/read` -- Nasyath section
- `perm-admin-access` -- Admin area access
- `perm-piket-read/write` -- Piket schedule management
- `perm-backup-create` -- Database backup
- `perm-ayyu-sual-access` -- Ayyu Su'aal

---

## KOMPONEN KUNCI

### SuperTable

Komponen paling kompleks (681 lines). Fitur:

- Server-side pagination/filter/sorting via POST
- Responsive: table (desktop) vs card (mobile)
- Multi-select dengan bulk actions
- Advanced filter modal (AND/OR logic, drag-drop reorder)
- State persistence via tablePersistence store
- Snippet-based customization (Svelte 5)
- Swipe & long-press untuk mobile

### AddMuridForm

Multi-step form (4 step): Personal Info -> Contact & Alamat -> Irsyadiyah -> Status. Punya navigation guard dan similar-name detection.

### Wilayah

Cascading dropdown 4-level (Propinsi -> Kokab -> Kecamatan -> Deskel) dengan caching.

### IndonesiaMap

Peta SVG interaktif dengan color scale 5-level, tooltip, keyboard accessible.

### Toast System

Full-featured: info/success/warning/error/loading, action buttons, progress bar, pause-on-hover, position configurable.

---

## OFFLINE-FIRST CACHE

Dexie (IndexedDB) menyimpan:

- Murid compact data (untuk autocomplete)
- Wilayah data (cascading dropdown cache)
- Versi-based invalidation
- Auto-sync 30 menit di background

---

## PATTERN-PATTERN PENTING

1. **Server-only isolation** -- `src/lib/server/` TIDAK PERNAH diimport ke client bundle
2. **Form Actions** -- SvelteKit form actions + `use:enhance` + toast feedback
3. **Territory-Based Access** -- Write operation cek deskel_id scope
4. **Self-Edit Guards** -- Admin tidak bisa hapus role admin sendiri / deaktivasi akun sendiri
5. **3-Step Import** -- Upload -> Preview -> Import (dengan backup/rollback)
6. **Arabic Support** -- Noto Naskh Arabic font, Arabic text shaping, Hindi numeral conversion
7. **Multi-Theme** -- DaisyUI themes: tdmi-aurora, tdmi-night-glow, slack-pro-light/dark + semua built-in
8. **UI Scaling** -- 80%/90%/100% scale toggle
9. **requirePermission Pattern** -- Gunakan `requirePermission(locals, perm)` daripada manual auth+perm check. Lihat section RBAC Helper Functions.
10. **Zod Validation** -- Input API divalidasi dengan Zod schema (`$lib/schemas/api`). Gunakan `safeParse()` di endpoint, bukan `parse()` (supaya bisa return 400 yang bersih).
11. **RBAC Sync** -- Data master RBAC di `accessControlData.ts` adalah source of truth. Setelah edit, jalankan `pnpm db:sync-rbac` (idempotent). Jangan pakai `pnpm db:seed` kecuali dari nol (destruktif).
12. **Error Boundaries** -- Setiap area punya `+error.svelte`: root (generic), member (login redirect untuk 401), admin (admin-specific messages).

---

## ENVIRONMENT VARIABLES

```
TURSO_CONNECTION_URL    # libsql://...  (database URL)
TURSO_AUTH_TOKEN        # Token autentikasi Turso
CLOUDINARY_URL          # cloudinary://...  (auto-config)
SMTP_EMAIL              # Gmail address
SMTP_PASSWORD           # App password
TURNSTILE_SECRET_KEY    # Cloudflare Turnstile (jika dipakai)
```

---

## SCRIPTS

```
pnpm dev          # Development server
pnpm build        # Production build
pnpm preview      # Preview build
pnpm check        # Type check Svelte
pnpm lint         # ESLint + Prettier
pnpm format       # Auto-format
pnpm test         # Run Vitest
pnpm test:watch   # Run Vitest in watch mode
pnpm test:coverage # Run Vitest with coverage
pnpm db:generate  # Generate Drizzle migration
pnpm db:migrate   # Run migration
pnpm db:seed      # Seed database (DESTRUKTIF - hapus semua RBAC data lalu insert ulang)
pnpm db:sync-rbac # Sync RBAC data ke DB (IDEMPOTEN - aman dijalankan berulang, upsert)
pnpm db:studio    # Drizzle Studio (DB GUI)
```

---

## API ENDPOINTS

### Public (no auth)

- `POST /tanya` -- Submit pertanyaan ahbab

### Authenticated

- `POST /api/logout` -- Destroy session
- `GET /api/propinsi` -- List all propinsi
- `GET /api/kokab?id_prop=` -- List kokab by propinsi
- `GET /api/kecamatan?id_kokab=` -- List kecamatan by kokab
- `GET /api/deskel?id_kecamatan=` -- List deskel by kecamatan
- `GET /api/wilayah-by-deskel?deskelId=` -- Get full territory path
- `GET /api/murid` -- List murid (paginated)
- `POST /api/murid` -- Create murid (perm: write)
- `GET /api/murid/[id]` -- Get single murid
- `POST /api/murid/delete` -- Batch delete (perm: write)
- `GET /api/murid/compact` -- Compact list (for IndexedDB cache)
- `GET /api/murid/search?q=` -- Search by name
- `GET /api/murid/similar?q=` -- Fuzzy search (Levenshtein)
- `POST /api/murid/fotos` -- Upload foto (Cloudinary)
- `GET /api/murid-network` -- Murid relationship network
- `GET /api/piket-schedule` -- List piket schedules
- `POST /api/piket-schedule` -- Create schedule (perm: write)
- `PUT /api/piket-schedule/[id]` -- Update schedule
- `DELETE /api/piket-schedule/[id]` -- Delete schedule
- `POST /api/piket-schedule/batch` -- Batch create schedules
- `POST /api/backup` -- Download DB dump (perm: backup)
- `GET /api/error-log` -- List error logs
- `POST /api/error-log` -- Log client error
- `PATCH /api/error-log/[id]` -- Resolve error
- `DELETE /api/error-log/[id]` -- Delete error

### Member Server-Side Endpoints

- `POST /member/pendataan/table` -- Server-side table data
- `GET /member/pendataan/export` -- Export data (Excel)
- `GET /member/pendataan/template` -- Download import template
- `POST /member/pendataan/import` -- Import data from file
- `POST /member/nasyath_mun/table` -- Server-side nasyath table
- `GET /member/nasyath_mun/export` -- Export nasyath data (Excel)

### Admin Only (perm-admin-access)

- `/admin/**` -- Admin dashboard
- `/admin/users/**` -- User management
- `/admin/rbac/**` -- Role/permission management
- `/admin/piket/**` -- Piket management
- `/admin/backup/**` -- Backup management

---

## ROUTE TREE

```
src/routes/
├── +error.svelte                   # Root error page (status-aware, DaisyUI)
├── +layout.svelte                  # Root layout (global)
├── +layout.server.ts               # Root server load (auth guard + permissions)
├── +layout.ts                      # Root client load (Vercel Speed Insights)
├── +page.svelte                    # Root page (redirect only)
│
├── login/                          # Login form (public)
├── tanya/                          # Public question form (Turnstile + email)
│
├── member/                         # Protected area (requires login)
│   ├── +error.svelte               # Member error page (401->login, 403 message)
│   ├── +layout.svelte              # SidebarLayout wrapper
│   ├── +page.svelte                  # Dashboard (stats, charts, activities)
│   ├── profile/                      # Change password
│   ├── users/                        # User listing
│   ├── ayyu-sual/                    # Question management
│   ├── nasyath/                      # Nasyath placeholder
│   ├── nasyath_mun/                  # Nasyath CRUD + charts + export
│   │   ├── new/                      # Create
│   │   ├── [nasyathId]/edit/         # Edit
│   │   ├── [nasyathId]/delete/       # Delete
│   │   ├── export/                   # Excel export
│   │   ├── table/                    # Server-side table
│   │   ├── components/               # NasyathCharts, KPIs, RecentTable
│   │   └── config/                   # columns, chartConfig
│   └── pendataan/                    # Student data CRUD
│       ├── new/                      # Create
│       ├── [muridId]/                # Detail
│       ├── [muridId]/edit/           # Edit
│       ├── [muridId]/delete/         # Delete
│       ├── [muridId]/jaringan/       # Network graph (Cytoscape)
│       ├── import/                   # 3-step Excel import
│       ├── export/                   # Excel export
│       ├── template/                 # Download import template
│       ├── table/                    # Server-side table
│       ├── components/               # InsightPanel, PrintReport, TableSection
│       ├── config/                   # columns, constants
│       └── actions/                  # printTable, exportExcel, downloadPDF
│
└── admin/                            # Admin area (perm-admin-access)
    ├── +error.svelte                 # Admin error page (DaisyUI-styled, 403 specific)
    ├── +layout.svelte                # AdminLayout wrapper
    ├── +layout.server.ts             # Admin permission guard
    ├── +page.svelte                  # Admin dashboard
    ├── users/                        # User CRUD
    │   ├── new/                      # Create
    │   ├── table/                    # Server-side table
    │   └── [userId]/edit/ + delete/  # Edit + delete
    ├── rbac/                         # Role & permission CRUD
    ├── piket/                        # Schedule list
    │   └── susun/                    # Schedule builder
    ├── error-logs/                   # Error log viewer
    └── backup/                       # Database backup
```

---

## STORE DEPENDENCY GRAPH

**Persistent Stores (localStorage):**
- `themeStore` -- Key: `{userId}-theme`, default: `tdmi-aurora`
- `preferenceService` -- Key: `{userId}-{key}`, centralizes UI prefs

**Ephemeral Stores (UI-only):**
- `absoluteDropdown` -- Dropdown overlay positioning
- `tooltipStore` -- Tooltip visibility/position

**Data Stores (with API):**
- `muridModalStore` -- POST /member/pendataan/table, lazy-loads murid data
- `muridFormStore` -- Client-side form state + territory cascading

**State Rune (Svelte 5):**
- `tablePersistence` -- $state class, in-memory, auto-clears on area navigation

---

## REQUEST LIFECYCLE

```
Request → hooks.server.ts (Lucia auth)
    │
    ▼
+layout.server.ts (root)
    ├── Public route? → PASS
    ├── Auth-only + logged in → REDIRECT /member
    ├── Not logged in + private → REDIRECT /login
    └── Logged in → Check 4 permissions in parallel
        ├── perm-admin-access
        ├── perm-pendataan-access
        ├── perm-piket-read
        └── perm-ayyu-sual-access
    │
    ▼
/admin/+layout.server.ts (if admin route)
    ├── Not logged in → REDIRECT /login
    ├── No perm-admin-access → 403
    └── Return piket/backup permissions
    │
    ▼
Individual server loads/actions
    └── userHasPermission(userId, perm, resource?)
        → true: proceed
        → false: 403/401
```

---

## TESTING

Framework: Vitest 4.1 + @testing-library/svelte 5.4 + jsdom 29

Initial test coverage (37 tests passing):
- `src/lib/utils/__tests__/date.test.ts` -- 6 tests (formatDateShort)
- `src/lib/utils/__tests__/string.test.ts` -- 6 tests (toTitleCase)
- `src/lib/utils/__tests__/toHindi.test.ts` -- 7 tests (toHindi)
- `src/lib/utils/__tests__/formatMurid.test.ts` -- 18 tests (calculateAge, renderReferencedMurid, formatMuridGender, formatMuridMarhalah, formatMuridAlamat, formatMuridBoolean)

Run with: `pnpm test` | `pnpm test:watch` | `pnpm test:coverage`

---

## API VALIDATION (Zod)

Schemas: `src/lib/schemas/api.ts`

Schema tersedia untuk:
- **Murid**: `createMuridSchema`, `muridCompactSchema`, `muridListResponseSchema`, `muridSearchQuerySchema`
- **Piket**: `createPiketScheduleSchema`, `batchPiketScheduleSchema`, `updatePiketScheduleSchema`, `piketScheduleSchema`
- **Error Log**: `clientErrorLogSchema`
- **Wilayah**: `wilayahSchema`, `wilayahByDeskelResponseSchema`
- **User**: `createUserSchema`, `loginSchema`
- **Nasyath**: `createNasyathSchema`
- **Tanya**: `pertanyaanAhbabSchema`
- **Table**: `tableRequestSchema`, `filterConditionSchema`, `sortConfigSchema`

Cara pakai di API endpoint:
```typescript
import { clientErrorLogSchema } from '$lib/schemas/api';

export const POST: RequestHandler = async ({ request }) => {
    const rawBody = await request.json();
    const parsed = clientErrorLogSchema.safeParse(rawBody);
    if (!parsed.success) {
        return json({ ok: false, errors: parsed.error.issues }, { status: 400 });
    }
    const body = parsed.data; // fully typed
    // ... use body
};
```

Cara pakai di client:
```typescript
import { muridListResponseSchema } from '$lib/schemas/api';
import type { MuridListResponse } from '$lib/schemas/api';

const res = await fetch('/api/murid');
const data: MuridListResponse = muridListResponseSchema.parse(await res.json());
```
