import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
import { calculateAge } from '$lib/utils/formatMurid';
import { formatDateShort } from '$lib/utils/date';

interface PrintTableParams {
	sort: SortConfig[];
	filters: FilterState;
	columns: ColumnDef<any>[];
	api: (url: string, opts?: any) => Promise<Response>;
}

function formatCellValue(row: any, col: ColumnDef<any>): string {
	const raw = (row as any)[col.key];
	if (col.key === 'gender') return raw ? 'Pria' : 'Wanita';
	if (col.key === 'marhalah') return `M${raw}`;
	if (col.key === 'aktif') return raw ? 'Aktif' : 'Tidak Aktif';
	if (col.key === 'partisipasi' || col.key === 'qari') return raw ? 'Ya' : 'Tidak';
	if (col.key === 'tglLahir') {
		const age = calculateAge(raw);
		return age !== null ? `${age} tahun` : '-';
	}
	if (col.key === 'alamat') {
		return [row.alamat, row.deskelName, row.kecamatanName, row.kokabName, row.propinsiName]
			.filter(Boolean)
			.join(', ');
	}
	if (col.key === 'updatedAt') return formatDateShort(raw);
	if (raw === null || raw === undefined) return '-';
	return String(raw).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function printMuridTable(params: PrintTableParams): Promise<void> {
	const { sort, filters, columns, api } = params;
	const response = await api('/member/pendataan/table', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ sort, filters, page: 1, pageSize: 100000 })
	});
	if (!response.ok) throw new Error('Gagal mengambil data');
	const result = await response.json();

	const visibleColumns = columns.filter(c => !c.hidden);
	let filterHtml = '';
	if (filters?.columns) {
		const active = Object.entries(filters.columns).filter(([, v]: any) => v?.value);
		if (active.length > 0) {
			filterHtml = `<p class="print-fi">Filter: ${active.map(([k, v]: any) => `${k}: ${v.value}`).join(' | ')}</p>`;
		}
	}

	let rowsHtml = '';
	for (const row of result.murid) {
		rowsHtml += '<tr>';
		for (const col of visibleColumns) {
			rowsHtml += `<td>${formatCellValue(row, col)}</td>`;
		}
		rowsHtml += '</tr>';
	}

	const dateStr = new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' });
	const theadHtml = visibleColumns.map(c => `<th>${c.label}</th>`).join('');

	const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Data Murid - TDMI</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,sans-serif;padding:15px 20px;color:#1e293b;font-size:10px}
h1{font-size:16px;margin:0 0 2px;font-weight:800}
.print-meta{font-size:11px;color:#64748b;margin-bottom:10px}
.print-fi{font-size:10px;color:#94a3b8;margin-bottom:10px}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #cbd5e1;padding:3px 5px;text-align:left}
th{background:#f1f5f9;font-weight:700;color:#1e293b}
tr:nth-child(even) td{background:#f8fafc}
.print-foot{font-size:9px;color:#94a3b8;margin-top:10px;text-align:center;font-style:italic}
@media print{@page{margin:10mm}}
</style></head>
<body>
<h1>Data Murid - TDMI</h1>
<p class="print-meta">${dateStr} &mdash; Total: ${result.totalItems} murid</p>
${filterHtml}
<table><thead><tr>${theadHtml}</tr></thead>
<tbody>${rowsHtml}</tbody></table>
<p class="print-foot">Dicetak dari Sistem Manajemen TDMI</p>
</body></html>`;

	const prevTitle = document.title;
	document.title = 'Data Murid - TDMI';

	const container = document.createElement('div');
	container.id = 'print-container';
	container.innerHTML = html;
	Object.assign(container.style, {
		position: 'fixed', left: '-9999px', top: '0', width: '1px', height: '1px', overflow: 'hidden', zIndex: '-1'
	});
	document.body.appendChild(container);

	await new Promise(r => setTimeout(r, 200));

	const hiddenNodes: { el: HTMLElement; orig: string | null }[] = [];
	for (const child of Array.from(document.body.children)) {
		if (child.id !== 'print-container' && child instanceof HTMLElement) {
			hiddenNodes.push({ el: child, orig: child.style.display });
			child.style.display = 'none';
		}
	}
	Object.assign(container.style, {
		position: 'static', left: '', top: '', width: 'auto', height: 'auto', overflow: 'visible', zIndex: 'auto', display: 'block'
	});

	return new Promise<void>((resolve, reject) => {
		const cleanup = () => {
			document.title = prevTitle;
			hiddenNodes.forEach(({ el, orig }) => { el.style.display = orig ?? ''; });
			container.remove();
			window.removeEventListener('afterprint', cleanup);
			resolve();
		};
		window.addEventListener('afterprint', cleanup);
		setTimeout(() => { try { cleanup(); } catch {} }, 60000);
		try {
			window.print();
		} catch (e) {
			cleanup();
			reject(e);
		}
	});
}
