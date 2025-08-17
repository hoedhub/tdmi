# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-08-17 01:41:35 - Log of updates made will be appended as footnotes to the end of this file.

*

## Project Goal

*   Aplikasi web internal untuk manajemen data anggota (murid), aktivitas (nasyath), dan administrasi pengguna dalam organisasi TDMI.

## Key Features

*   Otentikasi & Manajemen Sesi
*   Manajemen Pengguna (CRUD oleh admin)
*   Manajemen Data Murid (Modul Pendataan)
*   Manajemen Aktivitas (Nasyath)
*   Kontrol Akses Berbasis Peran (RBAC)
*   Admin Dashboard
*   Manajemen Profil (ubah password)
*   Antarmuka Responsif

## Overall Architecture

*   **Framework**: SvelteKit
*   **Database**: Turso (LibSQL) dengan Drizzle ORM
*   **Otentikasi**: Lucia Auth (dengan Argon2id hashing)
*   **Kontrol Akses**: RBAC berbasis database dengan pengecekan `userHasPermission(userId, permissionId)`, termasuk lingkup wilayah dan hierarki peran untuk aksi tulis.
*   **Styling**: Tailwind CSS dengan DaisyUI
*   **Bahasa**: TypeScript
*   **Linting & Formatting**: ESLint & Prettier