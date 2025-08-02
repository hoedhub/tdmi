import type { User, Session } from 'lucia';
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: Session | null;
		}
		interface Error {
			message: string;
			code?: string; // Tambahkan properti 'code' di sini. Tanda '?' membuatnya opsional.
			// Anda juga bisa menambahkan properti lain jika perlu
			// someOtherInfo?: any;
		}
		// interface Locals {}
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
