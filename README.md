# Sistem Manajemen TDMI

Aplikasi web internal yang dirancang untuk manajemen data anggota (murid), aktivitas (nasyath), dan administrasi pengguna dalam organisasi TDMI. Dibangun menggunakan SvelteKit dengan fokus pada reaktivitas, keamanan, dan skalabilitas.

## Daftar Isi

- [Teknologi Utama](#teknologi-utama)
- [Fitur Kunci](#fitur-kunci)
- [Arsitektur Sistem](#arsitektur-sistem)
  - [Otentikasi](#otentikasi)
  - [Kontrol Akses Berbasis Peran (RBAC)](#kontrol-akses-berbasis-peran-rbac)
- [Panduan Instalasi](#panduan-instalasi)
- [Perintah yang Tersedia](#perintah-yang-tersedia)

## Teknologi Utama

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Database**: [Turso](https://turso.tech/) (melalui LibSQL) dengan [Drizzle ORM](https://orm.drizzle.team/)
- **Otentikasi**: [Lucia Auth](https://lucia-auth.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) dengan [DaisyUI](https://daisyui.com/)
- **Bahasa**: TypeScript
- **Linting & Formatting**: ESLint & Prettier

## Fitur Kunci

- **Otentikasi & Manajemen Sesi**: Proses login, logout, dan validasi sesi yang aman.
- **Manajemen Pengguna**: CRUD (Create, Read, Update, Delete) untuk data pengguna oleh admin.
- **Manajemen Data Murid**: Modul `Pendataan` untuk mengelola data anggota (murid) secara terperinci.
- **Manajemen Aktivitas (Nasyath)**: Pengguna dapat mencatat dan mengelola data aktivitas dakwah (`nasyath`) mereka sendiri.
- **Kontrol Akses Berbasis Peran (RBAC)**: Sistem izin yang fleksibel dan berbasis database untuk mengontrol akses ke berbagai fitur dan data.
- **Admin Dashboard**: Halaman khusus admin untuk melihat ringkasan sistem dan mengelola data master.
- **Manajemen Profil**: Pengguna dapat mengubah password mereka sendiri.
- **Antarmuka Responsif**: Komponen tabel dan layout yang dapat beradaptasi di perangkat desktop maupun mobile.

## Arsitektur Sistem

### Otentikasi

Sistem otentikasi ditangani oleh **Lucia Auth**, yang terintegrasi dengan Drizzle ORM. Alurnya sebagai berikut:
1.  Pengguna memasukkan username dan password.
2.  Server memverifikasi kredensial menggunakan `Argon2id` untuk hashing password.
3.  Jika berhasil, Lucia membuat sesi di database (`sessionTable`) dan mengirimkan *session cookie* ke browser.
4.  Pada setiap permintaan berikutnya, *hook* di SvelteKit (`src/hooks.server.ts`) memvalidasi sesi. Jika valid, data pengguna akan tersedia di `event.locals`.
5.  Pengguna yang sudah login akan otomatis diarahkan ke halaman member jika mencoba mengakses halaman login.

### Kontrol Akses Berbasis Peran (RBAC)

Aplikasi ini mengimplementasikan sistem RBAC yang sepenuhnya dikelola melalui database, memungkinkan manajemen izin yang dinamis tanpa perlu mengubah kode.

-   **Konsep Inti**:
    -   **Users**: Pengguna aplikasi.
    -   **Roles**: Label yang diberikan kepada pengguna (misal: `role-admin`, `role-pendataan`).
    -   **Permissions**: Izin granular untuk melakukan aksi spesifik (misal: `perm-user-read`, `perm-pendataan-write`).
    -   **Role Hierarchy**: Peran dapat mewarisi izin dari peran lain (misal, `role-admin` mewarisi semua izin dari `role-pendataan`).

-   **Alur Kerja**:
    1.  Setiap halaman atau aksi yang dilindungi akan memanggil fungsi `userHasPermission(userId, permissionId)`.
    2.  Fungsi ini akan memeriksa semua peran yang dimiliki pengguna (termasuk peran turunan dari hierarki).
    3.  Kemudian, fungsi akan memeriksa apakah salah satu dari peran tersebut memiliki izin yang diperlukan.
    4.  Pengecekan tambahan seperti **lingkup wilayah (territory scope)** dan **hierarki peran untuk aksi tulis** juga diterapkan untuk keamanan yang lebih ketat.

## Panduan Instalasi

Untuk menjalankan proyek ini secara lokal, ikuti langkah-langkah berikut:

1.  **Prasyarat**:
    -   Node.js (versi 18 atau lebih baru)
    -   `pnpm` sebagai package manager (`npm install -g pnpm`)

2.  **Clone Repository**:
    ```bash
    git clone <URL_REPOSITORY_ANDA>
    cd <NAMA_FOLDER_PROYEK>
    ```

3.  **Instalasi Dependensi**:
    ```bash
    pnpm install
    ```

4.  **Konfigurasi Environment**:
    -   Buat file `.env` di root proyek dengan menyalin dari `.env.example` (jika ada).
    -   Isi variabel yang dibutuhkan, terutama untuk koneksi database Turso:
        ```env
        TURSO_CONNECTION_URL="<URL_DB_TURSO_ANDA>"
        TURSO_AUTH_TOKEN="<TOKEN_AUTH_TURSO_ANDA>"
        ```

5.  **Migrasi Database**:
    -   Jalankan migrasi untuk membuat skema tabel di database Turso Anda.
    ```bash
    pnpm db:migrate
    ```

6.  **Jalankan Server Development**:
    ```bash
    pnpm dev
    ```
    Aplikasi akan berjalan di `http://localhost:5173`.

## Perintah yang Tersedia

Berikut adalah daftar skrip utama dari `package.json`:

-   `pnpm dev`: Menjalankan aplikasi dalam mode development dengan hot-reloading.
-   `pnpm build`: Membuat build aplikasi untuk production.
-   `pnpm preview`: Menjalankan server lokal untuk melihat hasil production build.
-   `pnpm check`: Menjalankan Svelte check untuk validasi tipe.
-   `pnpm lint`: Menjalankan ESLint untuk memeriksa kesalahan kode.
-   `pnpm format`: Memformat seluruh kode menggunakan Prettier.
-   `pnpm db:generate`: Membuat file migrasi SQL baru berdasarkan perubahan skema Drizzle.
-   `pnpm db:migrate`: Menjalankan file migrasi ke database.
-   `pnpm db:studio`: Membuka Drizzle Studio untuk melihat dan mengelola data di database.
