export function calculateAge(tglLahir: string | null): number | null {
	if (!tglLahir) return null;
	const birthDate = new Date(tglLahir);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const m = today.getMonth() - birthDate.getMonth();
	if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}
	return age;
}

function escapeHtml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderReferencedMurid(name: string | null, marhalah: number | null, qari: boolean | null): string {
	if (!name) return '-';
	const safeName = escapeHtml(name);
	const isLowMarhalah = marhalah !== null && marhalah < 3;
	const isGhoiruQari = qari === false;
	if (isLowMarhalah || isGhoiruQari) {
		let tip = 'Peringatan:';
		if (isLowMarhalah) tip += ' Belum Marhalah 3.';
		if (isGhoiruQari) tip += ' Ghoiru Qari.';
		return [
			`<div class="tooltip tooltip-warning" data-tip="${tip}">`,
			`<span class="inline-flex items-center gap-1 text-warning font-medium">`,
			`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
			safeName,
			`</span></div>`
		].join('');
	}
	return safeName;
}

export function formatMuridGender(val: boolean): string {
	return val ? 'Pria' : 'Wanita';
}

export function formatMuridMarhalah(val: 1 | 2 | 3): string {
	return val.toString();
}

export function formatMuridAlamat(row: {
	alamat?: string | null;
	deskelName?: string | null;
	kecamatanName?: string | null;
	kokabName?: string | null;
	propinsiName?: string | null;
}): string {
	return [row.alamat, row.deskelName, row.kecamatanName, row.kokabName, row.propinsiName]
		.filter(Boolean)
		.join(', ');
}

export function formatMuridBoolean(val: boolean): string {
	return val ? 'Ya' : 'Tidak';
}
