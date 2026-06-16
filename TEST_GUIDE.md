# Test Guide: Manajemen Data Murid (Pendataan)

## Overview

Test guide for the pendataan module (`/member/pendataan`). This covers the main dashboard (table + map tabs), detail page, CRUD forms, print/PDF features, and the relation network graph. Use this to verify all features remain functional after refactoring.

---

## 1. Main Dashboard (`/member/pendataan`)

### 1.1 Page Load
- [ ] Page loads without error (check console for 404s/500s)
- [ ] Toast appears if server load returns `dbError: true`
- [ ] "Manajemen Data Murid" heading visible
- [ ] Tab buttons: "Daftar" and "Peta Sebaran" visible
- [ ] If user has write permission, "Tambah Murid Baru" button visible
- [ ] Print (printer icon) button visible when "Daftar" tab active
- [ ] Recent activity cards visible at bottom: "Murid Baru" and "Baru Diperbarui"
- [ ] Activity cards link to correct detail pages

### 1.2 Table Tab — Data Loading
- [ ] Table loads data on page mount
- [ ] Loading spinner shown while data loads
- [ ] "No data" state handled gracefully
- [ ] Rows show correct values per column definition
- [ ] Pagination controls visible (prev/next, page numbers, per-page selector)
- [ ] Column headers clickable for sorting

### 1.3 Table Tab — Sorting
- [ ] Single click column header: sort ascending
- [ ] Click again: sort descending
- [ ] Click again: remove sort
- [ ] Ctrl+click: add secondary sort (multi-sort)
- [ ] Sort indicators (arrows) visible on active sort columns

### 1.4 Table Tab — Filtering
- [ ] Text filters: type in filter input under column header
- [ ] Debounced API call fires after ~300ms
- [ ] Select filters (Gender, Marhalah, Aktif, etc.): dropdown works
- [ ] Filters persist across page navigation (via persistence store)
- [ ] Clear/reset filters: reset button clears all filters
- [ ] Advanced filter modal (icon in filter row): AND/OR conditions work
- [ ] Province filter: clicking a province on the map then "Lihat Semua" sets filter

### 1.5 Table Tab — Row Actions
- [ ] Click row navigates to `/member/pendataan/{id}`
- [ ] Edit button (per row) navigates to `/member/pendataan/{id}/edit?from=table`
- [ ] Delete button shows confirmation dialog
- [ ] Confirmed delete calls DELETE API and refreshes table
- [ ] Delete cancelled: no action taken

### 1.6 Table Tab — Selection
- [ ] Checkbox selects individual rows
- [ ] Header checkbox selects/deselects all visible rows
- [ ] When exactly 1 row selected + write permission: "Edit Selected" button appears
- [ ] Clicking "Edit Selected" navigates to edit page of selected row

### 1.7 Table Tab — Page Size & Navigation
- [ ] Per-page dropdown: 5, 10, 25, 50, 100
- [ ] Changing per-page resets to page 1
- [ ] Page navigation buttons work correctly
- [ ] "Showing X-Y of Z" summary accurate

### 1.8 Table Tab — Column Visibility
- [ ] Column visibility toggle available (gear icon or context menu)
- [ ] Toggling columns adds/removes them from the table
- [ ] Hidden columns remembered during session

### 1.9 Table Tab — Print
- [ ] Printer icon button triggers loading toast "Memuat semua data untuk dicetak..."
- [ ] Print dialog opens with formatted table (not the web page UI)
- [ ] Printed table shows: title "Data Murid - TDMI", date, filter info, data rows, footer
- [ ] After print dialog closes/clicks Save/Cancel, page restores normally (no broken layout)
- [ ] Page title restored after print
- [ ] If data fetch fails, error toast shown
- [ ] Print works on mobile Chrome (no popup blocker)
- [ ] **Verify**: filename in print dialog is "Data Murid - TDMI"
- [ ] 60s timeout fallback works if print dialog left open

### 1.10 Map Tab — Peta Sebaran
- [ ] Switching to Map tab shows interactive Indonesia map
- [ ] Map renders with province boundaries
- [ ] Provinces color-coded by density (lighter → darker for higher counts)
- [ ] View mode selector (dropdown): Total, Pria, Wanita, Marhalah 1/2/3
- [ ] Changing view mode updates map colors and insight panel
- [ ] Hovering a province shows tooltip with name + count
- [ ] Clicking a province: sidebar appears with province stats + filtered murid list

### 1.11 Map Tab — Province Sidebar
- [ ] Province name displayed
- [ ] Stats: total murid, marhalah breakdown (M1/M2/M3), gender ratio (P/W)
- [ ] "Tutup" button dismisses province selection
- [ ] "Lihat Semua" button switches to table tab with province filter applied
- [ ] Province data table: Nama, Gender, Marhalah, Daerah columns
- [ ] Province pagination: "Sebelumnya" / "Selanjutnya" for >5 murid
- [ ] "Tidak ada data murid di provinsi ini." shown when empty

### 1.12 Map Tab — Insight Panel
- [ ] National summary visible: total, gender bar, marhalah distribution
- [ ] Top 5 provinces listed with colored bars and counts
- [ ] "Lainnya" segment shows aggregated non-top-5 count
- [ ] Province names in top list are clickable → same behavior as clicking map
- [ ] Download PDF button visible
- [ ] PDF generation: loading state shown, PDF downloaded, success toast
- [ ] If PDF generation fails, error toast shown
- [ ] Downloaded PDF filename: `Laporan-Sebaran-TDMI-{mode}-{timestamp}.pdf`
- [ ] PDF content: header, stats, map, top provinces table

### 1.13 Province Filter on Table Tab
- [ ] When province filter active from map, warning alert shown at top
- [ ] Alert shows province name
- [ ] × button clears province filter
- [ ] Removing filter refreshes table with all data
- [ ] Switching from map to table (with province selected) applies filter correctly

---

## 2. Murid Detail Page (`/member/pendataan/{id}`)

- [ ] Page loads with full murid data
- [ ] Header: avatar (photo or initials), name, Arabic name (RTL), badges (Aktif/Partisipasi/Qari/Marhalah)
- [ ] Personal Info: NIK, birth date + age, gender
- [ ] Contact & Address: phone, full address (deskel → kecamatan → kokab → propinsi)
- [ ] Irsyadiyah: Mursyid, Muhrim, Baiat, Wirid shown in 2×2 grid
- [ ] Each relation shows warning icon if marhalah < 3 or qari = false
- [ ] Relation names link to their detail pages
- [ ] Mustarsyad table: lists all murid with this murid as mursyid
- [ ] Mustarsyad split into two tables if both genders present
- [ ] Each mustarsyad row: name, phone, age, qari, marhalah, irsyad status, active, participation
- [ ] Mustarsyad names link to their detail pages
- [ ] Recent Nasyath: up to 5 recent activities with date, name, location
- [ ] "Lihat Semua Kegiatan" link → `/member/nasyath_mun?muridId={id}`
- [ ] "Kembali" link → `/member/pendataan`
- [ ] "Jaringan Relasi" button → `/member/pendataan/{id}/jaringan`
- [ ] "Edit Data" button → `/member/pendataan/{id}/edit`

---

## 3. Add Murid (`/member/pendataan/new`)

- [ ] Form renders with all fields
- [ ] Province dropdown loads provinces
- [ ] Required fields: Nama, Deskel (via location picker)
- [ ] Save creates new murid and redirects to `/member/pendataan`
- [ ] "Save & Add Another" saves and stays on form
- [ ] Validation errors shown for required fields
- [ ] NIK duplicate: specific error message shown
- [ ] Photo upload works (Cloudinary)
- [ ] After successful save, form feedback shown (alert or flavor message)

---

## 4. Edit Murid (`/member/pendataan/{id}/edit`)

- [ ] Form pre-filled with existing murid data
- [ ] All fields editable
- [ ] Photo: existing photo displayed, can be replaced or removed
- [ ] Save updates murid and redirects to detail page
- [ ] "Save & Close" returns to list (with `?from=table`)
- [ ] Relation data (muhrim, mursyid, baiat, wirid) shown correctly
- [ ] NIK duplicate: specific error message shown

---

## 5. Delete Murid

- [ ] Delete via table row action: confirmation dialog shown
- [ ] After deletion, table refreshes; murid no longer in list
- [ ] Attempt to delete without permission: 403 error
- [ ] Delete non-existent murid: 404 error

---

## 6. Jaringan Relasi (`/member/pendataan/{id}/jaringan`)

- [ ] Network graph loads with relation nodes
- [ ] Depth slider (1-5) changes graph depth
- [ ] Layout toggle: hierarchical (silsilah) vs network (jaring)
- [ ] Direction toggle: top-down vs bottom-up
- [ ] Physics toggle: enable/disable animation
- [ ] Export PNG: downloads network image
- [ ] Zoom controls: zoom in, zoom out, fit to screen
- [ ] Filter panel: toggle edges by type (Mursyid, Muhrim, Baiat, Wirid), toggle labels
- [ ] Double-click node: navigates to that murid's detail page
- [ ] Refresh button reloads graph data

---

## 7. Permission — Access Control

### Read-Only User
- [ ] "Tambah Murid Baru" button hidden
- [ ] Edit/Delete buttons hidden in table rows
- [ ] "Edit Selected" bulk action hidden
- [ ] Can view table, map, detail page

### Write User
- [ ] All CRUD actions available
- [ ] Territory scope enforced (can only edit/delete murid in their wilayah)

### Level 3 (Propinsi) User
- [ ] Table data auto-filtered to their province only
- [ ] Can only see murid in their province

### No-Access User
- [ ] Redirected to `/login` if not authenticated
- [ ] Forbidden page if no `perm-pendataan-access`

---

## 8. Responsive / Mobile

- [ ] Tab icons hidden on small screens (`hidden sm:inline`)
- [ ] Font sizes smaller on mobile (`text-[0.7rem]`)
- [ ] Table switches to card view on mobile (<768px)
- [ ] Province table columns collapse on mobile
- [ ] Insight panel stacks below map on mobile
- [ ] Province sidebar is full-width on mobile
- [ ] Print button works on mobile Chrome (no popup blocker, no iframe)
- [ ] Touch interactions: clicking, scrolling work on mobile

---

## 9. Error States

- [ ] Server load failure: `dbError` state shows toast
- [ ] API fetch (table) failure: error toast shown
- [ ] Province data fetch failure: error toast shown
- [ ] Print data fetch failure: error toast with message
- [ ] PDF generation failure: error toast
- [ ] Delete failure: error toast
- [ ] Network disconnected: appropriate error messages
- [ ] 404 for non-existent murid detail page
- [ ] 403 for unauthorized actions

---

## 10. Edge Cases

- [ ] **Empty list**: No murid data in table → "No data" state or empty table
- [ ] **Empty provinces**: No sebaran data → insight panel shows "Tidak ada data"
- [ ] **Large dataset**: Table with 1000+ rows, pagination and sorting still responsive
- [ ] **Race conditions**: Rapid filter/sort/page changes handled correctly
- [ ] **Browser back/forward**: Navigation state maintained
- [ ] **Print cancelled**: User closes print dialog → page restored normally
- [ ] **PDF cancelled**: User navigates away during generation → no zombie state
- [ ] **Session timeout**: Redirected to login on next action
- [ ] **Concurrent edits**: Two users edit same murid → last write wins (no conflict detection)

---

## Anomalies & Issues Found During Review

### 🔴 Critical — Must Fix Before Release

| # | File | Issue | Status |
|---|------|-------|--------|
| 1 | `config/columns.ts:80,88` | **baiatName/wiridName formatter uses wrong row fields.** Line 80: `renderReferencedMurid(v, row.marhalah, row.qari)` should be `renderReferencedMurid(v, row.baiatMarhalah, row.baiatQari)`. Line 88: same for wirid — should use `row.wiridMarhalah`/`row.wiridQari`. This means the warning icon in the table (for baiat/wirid columns) shows warnings based on the current murid's own status instead of the relation's status. | ✅ Fixed |
| 2 | `config/columns.ts` (and `+page.svelte`) | **XSS via `{@html}`** — `renderReferencedMurid` returns HTML with unsanitized `name`. Added `escapeHtml()` to sanitize `name` in both HTML-wrapped and non-wrapped return paths. | ✅ Fixed |
| 3 | `new/+page.server.ts` | **Potential null crash on foto upload.** `fotoFile.size` accessed without null guard — if `foto` field not present in multipart form, `fotoFile` could be `null`. | ✅ Already safe (line 94: `if (fotoFile && fotoFile.size > 0)`) |

### 🟡 Moderate — Should Fix

| # | File | Issue |
|---|------|-------|
| 4 | `+page.svelte:332-338` | **Native `alert()` used instead of toast.** The `run()` block uses `alert(form.message)` for form feedback from new/edit pages. Inconsistent with the toast system used everywhere else. |
| 5 | `actions/printTable.ts:37` | **100k row limit is arbitrary and fragile.** `pageSize: 100000` fetches all data into memory. On large datasets, this will timeout or crash the browser. Should use progressive loading or server-side paginated PDF generation. |
| 6 | `table/+server.ts` | **Level 3 territory bypass possible.** If `locals.user.muridId` is null/undefined for a role-nasyath-propinsi user, the province filter is silently skipped instead of denying access. |
| 7 | `new/+page.server.ts` vs edit | **Inconsistent boolean parsing.** `aktif`/`partisipasi` use `=== 'on'` (checkbox convention) but `qari` uses `=== 'true'` (string boolean). Should be consistent. |

### 🟢 Minor — Note

| # | File | Issue |
|---|------|-------|
| 8 | `components/MuridPrintReport.svelte` | **561 lines** — exceeds the 500-line modular limit. Needs refactoring (extract CSS? extract sections?). |
| 9 | `[muridId]/+page.svelte:34` | **Duplicate `calculateAge`** — defined locally instead of importing from `$lib/utils/formatMurid`. |
| 10 | `components/MuridInsightPanel.svelte` | **Division by zero fallbacks used** (`modeTotal || 1`, `wanita || 1`) — works but indicates the need for explicit zero-state handling. |
| 11 | `actions/downloadPDF.ts` | **OKLCH/color-mix replacements are hardcoded hex values.** If the app's theme colors change, the PDF output will diverge from the UI. Should derive colors from CSS variables at runtime. |

---

## Regression Test Checklist

These are the areas most likely to break after the refactoring (extracting utils, config, actions):

- [ ] **Print Table**: The `printMuridTable` action was extracted to `actions/printTable.ts`. Verify it receives correct `sort`, `filters`, `columns`, and `api` parameters and that all cell formatting works.
- [ ] **Download PDF**: The `downloadMuridPDF` action was extracted to `actions/downloadPDF.ts`. Verify PDF still generates with correct filename, content, and Vercel CSS fix.
- [ ] **Column Definitions**: The `MURID_COLUMNS` constant was extracted to `config/columns.ts`. Verify all formatters, especially `calculateAge` (now imported from `$lib/utils/formatMurid`), `renderReferencedMurid`, and `formatMuridBoolean`.
- [ ] **Formatting Utilities**: `formatMuridGender`, `formatMuridMarhalah`, `formatMuridAlamat`, `formatMuridBoolean` extracted to `$lib/utils/formatMurid.ts`. Verify SuperTable columns still render correctly.
- [ ] **Constants**: `MAP_LABELS`, `TOP_COLORS`, `PROVINCE_PAGE_SIZE` extracted to `config/constants.ts`. Verify insight panel, map, and province pagination still work.
- [ ] **Prop names**: `columns={columns}` changed to `columns={MURID_COLUMNS}`, `{mapLabels}` changed to `mapLabels={MAP_LABELS}`, `{topColors}` changed to `topColors={TOP_COLORS}`. Verify no "undefined variable" runtime errors.

---

## 11. Error Reporting System (`/admin/error-logs`)

### 11.1 Server-Side Auto-Capture
- [ ] Session validation failure in `hooks.server.ts` triggers `reportError()`
- [ ] Resolve error in `hooks.server.ts` triggers `reportError()` with URL context
- [ ] Error includes: message, stack trace, URL, timestamp, source='server'

### 11.2 Client-Side Auto-Capture
- [ ] Uncaught JS errors trigger `reportClientError()` via `window.onerror`
- [ ] Unhandled Promise rejections trigger `reportClientError()` via `unhandledrejection`
- [ ] Error includes: message, stack, URL, userAgent, source='client'

### 11.3 Admin Page — List & Filter
- [ ] `/admin/error-logs` loads with table of recent errors (newest first)
- [ ] Level filter: Error / Warning / Info
- [ ] Source filter: Server / Client
- [ ] Status filter: Unresolved / Resolved
- [ ] Search: text search across error messages
- [ ] Pagination works for large datasets
- [ ] Each row shows: level badge, source badge, message (truncated), URL, status, timestamp

### 11.4 Admin Page — Detail View
- [ ] Click row expands to show full stack trace
- [ ] Stack trace rendered in monospace with scroll for long traces
- [ ] Metadata JSON shown if present (pretty-printed)
- [ ] User Agent shown if present
- [ ] User ID shown if present
- [ ] Resolved by / at info shown if resolved

### 11.5 Admin Page — Actions
- [ ] "Resolve" button marks error as resolved (badge turns green)
- [ ] "Delete" button shows confirmation, then removes error log
- [ ] Resolved errors don't show "Resolve" button

### 11.6 API — POST `/api/error-log`
- [ ] Accepts JSON body with `level`, `message`, `stack`, `url`, `userAgent`, `metadata`
- [ ] Returns `{ ok: true, id }` on success
- [ ] Returns `{ ok: false }` on failure (doesn't crash)

### 11.7 API — PATCH `/api/error-log/[id]`
- [ ] Requires auth (401 if not logged in)
- [ ] Sets `resolved=true`, `resolvedAt`, `resolvedBy`

### 11.8 API — DELETE `/api/error-log/[id]`
- [ ] Requires auth (401 if not logged in)
- [ ] Removes entry from database

### 11.9 Sidebar Navigation
- [ ] "Error Logs" link visible in admin sidebar
- [ ] Link uses `Bug` icon
- [ ] Active state highlighted when on `/admin/error-logs`

