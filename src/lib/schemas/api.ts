/**
 * Shared Zod schemas untuk API request validation dan response type inference.
 *
 * CARA PAKAI:
 * 1. Import schema: `import { muridListResponseSchema } from '$lib/schemas/api';`
 * 2. Parse response: `const data = muridListResponseSchema.parse(await res.json())`
 * 3. Infer type: `type MuridListResponse = z.infer<typeof muridListResponseSchema>`
 * 4. Validate input: `const body = createMuridSchema.parse(await request.json())`
 *
 * NOTE: Tidak semua endpoint langsung di-wrapping schema. Mulai dari yang kritis
 * (input validation) dan yang paling sering dipakai (responses). Endpoint lainnya
 * bisa ditambahkan bertahap.
 */
import { z } from 'zod/v4';

// =================================================================
// COMMON SCHEMAS
// =================================================================

/** Error response dari API */
export const apiErrorSchema = z.object({
	error: z.string()
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** Success response generik */
export const apiSuccessSchema = z.object({
	ok: z.literal(true),
	message: z.string().optional()
});
export type ApiSuccess = z.infer<typeof apiSuccessSchema>;

// =================================================================
// MURID SCHEMAS
// =================================================================

/** Murid compact (untuk autocomplete / IndexedDB cache) */
export const muridCompactSchema = z.object({
	id: z.number(),
	nama: z.string(),
	namaArab: z.string().nullable(),
	gender: z.boolean(),
	deskelId: z.number().nullable(),
	aktif: z.boolean()
});
export type MuridCompact = z.infer<typeof muridCompactSchema>;

/** Response GET /api/murid (paginated list) */
export const muridListResponseSchema = z.object({
	murid: z.array(z.unknown()), // shape terlalu dinamis, pakai unknown dulu
	filteredTotalCount: z.number(),
	totalCount: z.number(),
	pageSize: z.number(),
	currentPage: z.number()
});
export type MuridListResponse = z.infer<typeof muridListResponseSchema>;

/** Input POST /api/murid (create new murid) */
export const createMuridSchema = z.object({
	nama: z.string().min(1, 'Nama wajib diisi'),
	namaArab: z.string().nullable().optional(),
	gender: z.boolean(),
	deskelId: z.number().nullable().optional(),
	alamat: z.string().nullable().optional(),
	nomorTelepon: z.string().nullable().optional(),
	muhrimId: z.number().nullable().optional(),
	mursyidId: z.number().nullable().optional(),
	baiatId: z.number().nullable().optional(),
	wiridId: z.number().nullable().optional(),
	qari: z.boolean().optional(),
	marhalah: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
	tglLahir: z.string().nullable().optional(),
	aktif: z.boolean().optional(),
	partisipasi: z.boolean().optional(),
	nik: z.string().length(16, 'NIK harus 16 digit').nullable().optional()
});
export type CreateMuridInput = z.infer<typeof createMuridSchema>;

/** Search query params GET /api/murid/search */
export const muridSearchQuerySchema = z.object({
	q: z.string().min(1)
});
export type MuridSearchQuery = z.infer<typeof muridSearchQuerySchema>;

/** Similar murid query params GET /api/murid/similar */
export const muridSimilarQuerySchema = z.object({
	q: z.string().min(1)
});

// =================================================================
// PIKET SCHEDULE SCHEMAS
// =================================================================

/** Piket schedule item */
export const piketScheduleSchema = z.object({
	id: z.number(),
	startDate: z.string(),
	endDate: z.string(),
	groupId: z.string().nullable(),
	description: z.string().nullable(),
	userId: z.string(),
	username: z.string().nullable(),
	roleId: z.string(),
	roleName: z.string().nullable()
});
export type PiketSchedule = z.infer<typeof piketScheduleSchema>;

/** Input POST /api/piket-schedule (create single) */
export const createPiketScheduleSchema = z.object({
	userId: z.string().min(1, 'User ID wajib'),
	startDate: z.string().min(1, 'Tanggal mulai wajib'),
	endDate: z.string().min(1, 'Tanggal selesai wajib'),
	description: z.string().nullable().optional()
});
export type CreatePiketScheduleInput = z.infer<typeof createPiketScheduleSchema>;

/** Input POST /api/piket-schedule/batch */
export const batchPiketScheduleSchema = z.array(
	z.object({
		userId: z.string().min(1),
		startDate: z.string().min(1),
		endDate: z.string().min(1)
	})
).min(1, 'Minimal 1 jadwal');
export type BatchPiketScheduleInput = z.infer<typeof batchPiketScheduleSchema>;

/** Input PUT /api/piket-schedule/:id */
export const updatePiketScheduleSchema = z.object({
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	description: z.string().nullable().optional()
});
export type UpdatePiketScheduleInput = z.infer<typeof updatePiketScheduleSchema>;

// =================================================================
// ERROR LOG SCHEMAS
// =================================================================

/** Input POST /api/error-log (client error reporting) */
export const clientErrorLogSchema = z.object({
	level: z.enum(['error', 'warning', 'info']).optional().default('error'),
	message: z.string().min(1, 'Pesan error wajib'),
	stack: z.string().nullable().optional(),
	url: z.string().nullable().optional(),
	userAgent: z.string().nullable().optional(),
	metadata: z.unknown().nullable().optional()
});
export type ClientErrorLogInput = z.infer<typeof clientErrorLogSchema>;

// =================================================================
// WILAYAH SCHEMAS
// =================================================================

/** Wilayah item (propinsi, kokab, kecamatan, deskel) */
export const wilayahSchema = z.object({
	id: z.number(),
	nama: z.string()
});
export type Wilayah = z.infer<typeof wilayahSchema>;

/** Response GET /api/wilayah-by-deskel */
export const wilayahByDeskelResponseSchema = z.object({
	propinsi: z.string().nullable(),
	kokab: z.string().nullable(),
	kecamatan: z.string().nullable(),
	deskel: z.string().nullable()
});

// =================================================================
// USER SCHEMAS
// =================================================================

/** Input POST /admin/users/new */
export const createUserSchema = z.object({
	username: z.string().min(3, 'Username minimal 3 karakter').max(16, 'Username maksimal 16 karakter'),
	password: z.string().min(6, 'Password minimal 6 karakter'),
	active: z.boolean().optional().default(true)
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

/** Login form input */
export const loginSchema = z.object({
	username: z.string().min(1, 'Username wajib'),
	password: z.string().min(1, 'Password wajib')
});
export type LoginInput = z.infer<typeof loginSchema>;

// =================================================================
// NASYATH SCHEMAS
// =================================================================

/** Input POST /member/nasyath_mun/new */
export const createNasyathSchema = z.object({
	muridId: z.number({ message: 'Murid wajib dipilih' }),
	kegiatan: z.string().min(1, 'Kegiatan wajib diisi'),
	tanggalMulai: z.string().min(1, 'Tanggal mulai wajib'),
	tanggalSelesai: z.string().nullable().optional(),
	durasi: z.string().nullable().optional(),
	tempat: z.string().nullable().optional(),
	jarak: z.string().nullable().optional(),
	keterangan: z.string().nullable().optional(),
	namaKontak: z.string().nullable().optional(),
	teleponKontak: z.string().nullable().optional()
});
export type CreateNasyathInput = z.infer<typeof createNasyathSchema>;

/** Input POST /tanya (public question form) */
export const pertanyaanAhbabSchema = z.object({
	nama: z.string().min(1, 'Nama wajib diisi'),
	alamat: z.string().min(1, 'Alamat wajib diisi'),
	email: z.email('Email tidak valid'),
	namaMursyid: z.string().min(1, 'Nama mursyid wajib'),
	pertanyaan: z.string().min(1, 'Pertanyaan wajib diisi'),
	turnstileToken: z.string().optional()
});
export type PertanyaanAhbabInput = z.infer<typeof pertanyaanAhbabSchema>;

// =================================================================
// TABLE REQUEST/RESPONSE SCHEMAS (server-side table)
// =================================================================

/** Filter condition untuk SuperTable server-side */
export const filterConditionSchema = z.object({
	column: z.string(),
	operator: z.string(),
	value: z.unknown()
});

/** Sort config untuk SuperTable */
export const sortConfigSchema = z.object({
	column: z.string(),
	direction: z.enum(['asc', 'desc'])
});

/** Common server-side table request body */
export const tableRequestSchema = z.object({
	page: z.number().int().positive().default(1),
	pageSize: z.number().int().positive().max(100).default(10),
	filterBy: z.array(filterConditionSchema).optional(),
	sortBy: z.array(sortConfigSchema).optional(),
	search: z.string().optional()
});
export type TableRequest = z.infer<typeof tableRequestSchema>;
