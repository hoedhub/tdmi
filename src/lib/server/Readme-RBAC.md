# Arsitektur Role-Based Access Control (RBAC)

Dokumen ini menjelaskan arsitektur dan cara penggunaan sistem Role-Based Access Control (RBAC) dalam aplikasi ini. Sistem ini dirancang untuk memberikan kontrol akses yang granular dan fleksibel terhadap berbagai fitur dan data.

## Daftar Isi

1.  [Gambaran Umum](#1-gambaran-umum)
2.  [Konsep Inti](#2-konsep-inti)
3.  [Struktur Database](#3-struktur-database)
4.  [Alur Logika](#4-alur-logika-bagaimana-cara-kerjanya)
5.  [Panduan Penggunaan untuk Developer](#5-panduan-penggunaan-untuk-developer)
    - [Melindungi Halaman (Routes)](#a-melindungi-halaman-routes)
    - [Melindungi Aksi Form (Actions)](#b-melindungi-aksi-form-actions)
    - [Menampilkan/Menyembunyikan UI secara Kondisional](#c-menampilkanmenyembunyikan-ui-secara-kondisional)
6.  [Mengelola Peran & Izin](#6-mengelola-peran--izin)

### 1. Gambaran Umum

Sistem RBAC kita sepenuhnya berbasis database dan tidak lagi menggunakan file JSON statis. Tujuannya adalah untuk memisahkan **siapa pengguna itu (User)** dari **apa yang bisa mereka lakukan (Permissions)** melalui sebuah lapisan abstraksi yang disebut **Peran (Roles)**.

**Prinsip Utama:**

- Pengguna diberi satu atau lebih **Peran**.
- Setiap **Peran** diberi satu atau lebih **Izin**.
- Aplikasi tidak pernah memeriksa peran pengguna secara langsung (misalnya, `if user.role === 'admin'`), melainkan memeriksa apakah pengguna memiliki **Izin** yang diperlukan untuk suatu aksi.

### 2. Konsep Inti

- **Users (`users`)**: Entitas yang mencoba mengakses aplikasi. Diidentifikasi dengan `id` unik.

- **Roles (`roles`)**: Label atau "topi" yang bisa dipakai oleh pengguna. Contoh: `role-admin`, `role-pendataan`, `role-nasyath-propinsi`. Sebuah peran tidak memiliki kekuatan apa pun tanpa izin.

- **Permissions (`permissions`)**: Aksi spesifik dan granular yang dapat dilakukan dalam aplikasi. Contoh: `perm-user-read`, `perm-user-write`, `perm-pendataan-access`. Ini adalah "kunci" untuk setiap fitur.

- **Role Hierarchy (`role_hierarchy`)**: Struktur parent-child antar peran. Ini memungkinkan **pewarisan izin (permission inheritance)**.
  - **Contoh:** Jika `role-admin` adalah parent dari `role-nasyath`, maka setiap pengguna dengan peran `role-admin` secara otomatis memiliki semua izin yang dimiliki oleh `role-nasyath` (dan semua anak-anaknya), tanpa perlu menetapkannya secara eksplisit.

### 3. Struktur Database

Sistem ini didukung oleh 5 tabel utama di database:

1.  `roles`: Menyimpan daftar semua peran yang ada.
    - `id`, `name`, `description`
2.  `permissions`: Menyimpan daftar semua izin yang ada.
    - `id`, `name`, `description`
3.  `user_roles`: Tabel penghubung (many-to-many) yang mencatat peran apa yang dimiliki oleh setiap pengguna.
    - `user_id`, `role_id`
4.  `role_permissions`: Tabel penghubung (many-to-many) yang mencatat izin apa yang dimiliki oleh setiap peran.
    - `role_id`, `permission_id`
5.  `role_hierarchy`: Tabel penghubung (many-to-many) yang mendefinisikan hubungan parent-child antar peran.
    - `parent_role_id`, `child_role_id`

### 4. Alur Logika: Bagaimana Cara Kerjanya?

Semua logika pengecekan terpusat pada fungsi `userHasPermission(userId, permissionId)` di `$lib/server/accessControl.ts`. Saat dipanggil, fungsi ini melakukan langkah-langkah berikut:

1.  **Dapatkan Peran Langsung:** Mengambil semua peran yang ditugaskan langsung ke `userId` dari tabel `user_roles`.
2.  **Dapatkan Peran Efektif:** Memeriksa tabel `role_hierarchy` secara rekursif untuk menemukan semua peran turunan (anak, cucu, dst.) dari peran yang dimiliki pengguna. Ini menghasilkan satu set "peran efektif".
3.  **Periksa Izin:** Mengambil semua izin yang terkait dengan _setiap_ peran efektif dari tabel `role_permissions`.
4.  **Putuskan:** Jika `permissionId` yang dicari ada di dalam kumpulan izin tersebut, fungsi mengembalikan `true`. Jika tidak, `false`.

### 5. Panduan Penggunaan untuk Developer

Berikut adalah cara menggunakan sistem RBAC dalam pengembangan sehari-hari.

#### A. Melindungi Halaman (Routes)

Gunakan `userHasPermission` di dalam `load` function pada file `+page.server.ts` atau `+layout.server.ts`.

**Contoh: Melindungi seluruh area `/admin`**

```typescript
// src/routes/admin/+layout.server.ts
import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { userHasPermission } from '$lib/server/accessControl';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	// Periksa apakah pengguna memiliki izin untuk mengakses area admin
	const canAccess = await userHasPermission(locals.user.id, 'perm-admin-access');

	if (!canAccess) {
		// Jika tidak, hentikan dengan halaman error 403 Forbidden
		throw error(403, 'Akses Ditolak. Anda tidak memiliki izin.');
	}

	return { user: locals.user };
};
```

#### B. Melindungi Aksi Form (Actions)

Gunakan `userHasPermission` di awal fungsi `actions` Anda.

**Contoh: Melindungi aksi pembuatan pengguna baru**

```typescript
// src/routes/admin/users/new/+page.server.ts
import { fail } from '@sveltejs/kit';
import { userHasPermission } from '$lib/server/accessControl';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Unauthorized' });
		}

		// Periksa izin untuk menulis data pengguna
		const canWrite = await userHasPermission(locals.user.id, 'perm-user-write');

		if (!canWrite) {
			return fail(403, { message: 'Akses Ditolak. Anda tidak memiliki izin.' });
		}

		// ... Lanjutkan dengan logika form jika diizinkan ...
	}
};
```

#### C. Menampilkan/Menyembunyikan UI secara Kondisional

Jangan pernah melakukan pengecekan izin di frontend. Sebaliknya, lakukan pengecekan di `+layout.server.ts` root dan teruskan hasilnya sebagai flag boolean ke UI.

**Contoh: Menampilkan menu "Admin" di sidebar**

1.  **Sediakan data di `+layout.server.ts` root:**

    ```typescript
    // src/routes/+layout.server.ts
    import type { LayoutServerLoad } from './$types';
    import { userHasPermission } from '$lib/server/accessControl';

    export const load: LayoutServerLoad = async ({ locals }) => {
    	const canAccessAdmin = locals.user
    		? await userHasPermission(locals.user.id, 'perm-admin-access')
    		: false;

    	return { user: locals.user, canAccessAdmin };
    };
    ```

2.  **Gunakan data di komponen `.svelte`:**

    ```html
    <!-- src/lib/components/SidebarLayout.svelte -->
    <script lang="ts">
    	import { page } from '$app/stores';
    </script>

    <!-- ... -->

    {#if $page.data.canAccessAdmin}
    <li>
    	<a href="/admin">Admin</a>
    </li>
    {/if}
    ```

### 6. Mengelola Peran & Izin

Semua manajemen dilakukan langsung di database, misalnya melalui konsol SQL Turso.

- **Menambah Peran Baru:**
  ```sql
  INSERT INTO roles (id, name, description) VALUES ('role-baru', 'Peran Baru', 'Deskripsi peran baru');
  ```
- **Memberi Izin ke Peran:**
  ```sql
  INSERT INTO role_permissions (role_id, permission_id) VALUES ('role-baru', 'perm-user-read');
  ```
- **Menugaskan Peran ke Pengguna:**
  ```sql
  INSERT INTO user_roles (user_id, role_id) VALUES ('id_pengguna_disini', 'role-baru');
  ```
- **Membuat Hubungan Hierarki:**
  ```sql
  -- Membuat 'role-baru' menjadi anak dari 'role-admin'
  INSERT INTO role_hierarchy (parent_role_id, child_role_id) VALUES ('role-admin', 'role-baru');
  ```
