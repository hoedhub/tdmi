import { api } from '$lib/utils/api';
import { loading as showLoadingToast, update } from '$lib/components/toast';

export async function exportMuridToXLSX(): Promise<void> {
	const toastId = showLoadingToast('Menyiapkan data untuk diekspor...', { duration: 0 });

	try {
		const response = await api('/member/pendataan/export', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({})
		});

		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const contentDisposition = response.headers.get('content-disposition');
			let fileName = 'pendataan-murid.xlsx';
			if (contentDisposition) {
				const match = contentDisposition.match(/filename="?([^"]+)"?/);
				if (match && match[1]) {
					fileName = match[1];
				}
			}
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			a.remove();
			update(toastId, {
				type: 'success',
				message: 'Ekspor berhasil! File sedang diunduh.',
				duration: 5000
			});
		} else {
			const errorText = await response.text();
			throw new Error(errorText);
		}
	} catch (err) {
		const e = err as Error;
		update(toastId, {
			type: 'error',
			message: `Gagal mengekspor: ${e.message}`,
			duration: 8000
		});
		throw e;
	}
}
