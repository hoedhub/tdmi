import { api } from '$lib/utils/api';
import { loading as showLoadingToast, update } from '$lib/components/toast';

interface ExportParams {
	periodType: 'bulan' | 'rentang';
	selectedDate: Date;
	dateFilter: { start: string; end: string };
	currentFilters: any;
	currentSort: any;
}

export async function exportNasyathToXLSX(params: ExportParams): Promise<void> {
	const toastId = showLoadingToast('Memulai proses ekspor...', { duration: 0 });

	let finalDateFilter: { start: string; end: string } = { start: '', end: '' };

	if (params.periodType === 'bulan') {
		const year = params.selectedDate.getFullYear();
		const month = params.selectedDate.getMonth();
		const startDate = new Date(year, month, 1);
		const endDate = new Date(year, month + 1, 0);
		finalDateFilter = {
			start: startDate.toISOString().split('T')[0],
			end: endDate.toISOString().split('T')[0]
		};
	} else {
		finalDateFilter = { ...params.dateFilter };
	}

	try {
		const response = await api('/member/nasyath_mun/export', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				filters: { ...params.currentFilters, dateRange: finalDateFilter },
				sort: params.currentSort,
				periodType: params.periodType,
				dateInfo:
					params.periodType === 'bulan'
						? { month: params.selectedDate.getMonth(), year: params.selectedDate.getFullYear() }
						: finalDateFilter
			})
		});

		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			const contentDisposition = response.headers.get('content-disposition');
			let fileName = 'export.xlsx';
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
