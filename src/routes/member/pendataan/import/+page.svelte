<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import {
		Download, ArrowLeft, CheckCircle, XCircle, AlertTriangle,
		FileSpreadsheet, Upload, Table, Database
	} from 'lucide-svelte';
	import type { ActionData } from './$types';

	const FIELD_OPTIONS: { value: string; label: string; required: boolean }[] = [
		{ value: '', label: '— Lewati kolom ini —', required: false },
		{ value: 'nama', label: 'Nama', required: true },
		{ value: 'namaArab', label: 'Nama Arab', required: false },
		{ value: 'gender', label: 'Jenis Kelamin', required: false },
		{ value: 'nik', label: 'NIK', required: false },
		{ value: 'tglLahir', label: 'Tanggal Lahir', required: false },
		{ value: 'propinsi', label: 'Provinsi', required: false },
		{ value: 'kokab', label: 'Kabupaten/Kota', required: false },
		{ value: 'kecamatan', label: 'Kecamatan', required: false },
		{ value: 'deskel', label: 'Desa/Kelurahan', required: false },
		{ value: 'alamat', label: 'Alamat', required: false },
		{ value: 'nomorTelepon', label: 'Nomor Telepon', required: false },
		{ value: 'mursyidNama', label: 'Mursyid', required: false },
		{ value: 'baiatNama', label: 'Baiat', required: false },
		{ value: 'wiridNama', label: 'Wirid', required: false },
		{ value: 'muhrimNama', label: 'Muhrim', required: false },
		{ value: 'qari', label: 'Status Qari', required: false },
		{ value: 'marhalah', label: 'Marhalah', required: false },
		{ value: 'aktif', label: 'Aktif', required: false },
		{ value: 'partisipasi', label: 'Partisipasi', required: false }
	];

	const FIELDS_WITH_DEFAULTS = new Set(['gender', 'qari', 'marhalah', 'aktif', 'partisipasi']);
	const FIELD_DEFAULT_LABELS: Record<string, string> = {
		gender: 'Laki-laki',
		qari: 'Qāri\'/Qāri\'ah',
		marhalah: '1',
		aktif: 'Ya',
		partisipasi: 'Ya'
	};

	function colLetter(n: number): string {
		let s = '';
		let i = n;
		while (i >= 0) {
			s = String.fromCharCode(65 + (i % 26)) + s;
			i = Math.floor(i / 26) - 1;
		}
		return s;
	}

	function colLetterToIndex(letter: string): number {
		let idx = 0;
		for (const c of letter.toUpperCase()) {
			idx = idx * 26 + (c.charCodeAt(0) - 64);
		}
		return idx - 1;
	}

	let { form }: { form: ActionData } = $props();

	let selectedFile: File | undefined = $state.raw();
	let fileError = $state('');
	let isSubmitting = $state(false);
	let step: 'upload' | 'mapping' | 'result' = $state('upload');
	let validated = $state(false);
	let previewData: any = $state(null);
	let importResult: any = $state(null);

	let selectedSheetIndex = $state(0);
	let mapping: Record<string, string> = $state({});
	let customValues: Record<string, string> = $state({});
	let dataStartRow = $state(2);

	let sheets: {
		index: number; name: string; headers: string[];
		sampleRows: { rowNum: number; cells: string[] }[];
		detectedMapping: Record<string, string>
	}[] = $state([]);

	function handleFileChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		fileError = '';
		if (file) {
			const ext = file.name.split('.').pop()?.toLowerCase();
			if (!['xlsx', 'xls', 'csv'].includes(ext || '')) { fileError = 'Format file harus .xlsx, .xls, atau .csv.'; return; }
			if (file.size > 100 * 1024 * 1024) { fileError = 'File terlalu besar. Maksimal 100MB.'; return; }
			selectedFile = file;
		}
	}

	function handleEnhance({ formElement, formData }: { formElement: HTMLFormElement; formData: FormData }) {
		if (isSubmitting) return;
		isSubmitting = true;

		// Re-attach the file from memory for non-upload forms
		const hasVisibleFile = formElement.querySelector('input[type="file"]:not(.hidden)');
		if (!hasVisibleFile && selectedFile) {
			formData.set('file', selectedFile);
		}

		return async ({ result, update }: { result: any; update: () => void }) => {
			update();
			if (result.type === 'success' && result.data) {
				if (result.data.uploaded) {
					sheets = result.data.sheets;
					selectedSheetIndex = 0;
					mapping = { ...result.data.sheets[0].detectedMapping };
					customValues = {};
					dataStartRow = 2;
					validated = false;
					step = 'mapping';
				} else if (result.data.preview) {
					previewData = result.data;
					validated = true;
				} else if (result.data.success) {
					importResult = result.data;
					step = 'result';
				}
			}
			isSubmitting = false;
		};
	}

	function handleSheetChange(index: number) {
		selectedSheetIndex = index;
		const s = sheets[index];
		if (s) { mapping = { ...s.detectedMapping }; customValues = {}; validated = false; }
	}

	function handleDataStartRowChange(v: number) {
		dataStartRow = Math.max(1, Math.floor(v));
		validated = false;
	}

	function handleMappingChange(field: string, value: string) {
		mapping = { ...mapping, [field]: value };
		validated = false;
	}

	function handleCustomValueChange(field: string, value: string) {
		customValues = { ...customValues, [field]: value };
		validated = false;
	}

	const hasHeader = $derived(dataStartRow > 1);

	const sheet = $derived(sheets[selectedSheetIndex]);
	const curHeaders = $derived(sheet?.headers || []);
	const curSamples = $derived(sheet?.sampleRows || []);
	const curName = $derived(sheet?.name || '');
	const maxCols = $derived(curHeaders.length);

	const previewHeaders = $derived([
		'#',
		...Array.from({ length: maxCols }, (_, i) => `${colLetter(i)}`)
	]);

	const headerOffset = $derived(Math.max(0, dataStartRow - 1));
	const previewRows = $derived(
		curSamples.slice(headerOffset, headerOffset + 5).map((r) => ({
			rowNum: r.rowNum,
			cells: r.cells
		}))
	);
	const previewEmpty = $derived(previewRows.length === 0);

	function exampleValue(field: string): string {
		const v = mapping[field];
		if (!v) return '';
		if (v === 'default') return FIELD_DEFAULT_LABELS[field] || '';
		if (v === '__custom__') return '';
		const ci = colLetterToIndex(v);
		return (ci >= 0 && curSamples[headerOffset]?.cells[ci]) || '';
	}

	function downloadRollbackSQL(sql: string, name: string) {
		const blob = new Blob([sql], { type: 'application/sql' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${name}.sql`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Import Data Murid — TDMI</title>
</svelte:head>

<div class="mb-6 flex items-center gap-3">
	<button onclick={() => goto('/member/pendataan')} class="btn btn-ghost btn-sm">
		<ArrowLeft class="h-4 w-4" /> Kembali
	</button>
	<h1 class="card-title text-2xl">Import Data Murid</h1>
</div>

<div class="mx-auto max-w-6xl">
	<ul class="steps mb-8 w-full">
		<li class="step step-primary"><Upload class="h-4 w-4" /> Upload</li>
		<li class="step {step === 'mapping' ? 'step-primary' : step === 'result' ? 'step-primary' : ''}"><Table class="h-4 w-4" /> Preview & Mapping</li>
		<li class="step {step === 'result' ? 'step-primary' : ''}"><CheckCircle class="h-4 w-4" /> Selesai</li>
	</ul>

	{#if step === 'upload'}
		<div in:fade class="space-y-4">
			<div class="rounded-lg border border-dashed p-8 text-center">
				<FileSpreadsheet class="mx-auto mb-3 h-12 w-12 text-base-content/40" />
				<p class="mb-4 text-base-content/70">
					Upload file Excel untuk mengimport data murid.
					<br />Format: <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>
				</p>
				{#if fileError}<div class="mb-3 text-sm text-error">{fileError}</div>{/if}
				<form method="POST" enctype="multipart/form-data" action="?/upload" use:enhance={handleEnhance}>
					<input type="file" name="file" accept=".xlsx,.xls,.csv" onchange={handleFileChange} class="file-input file-input-bordered w-full max-w-xs" required />
					{#if selectedFile}<p class="mt-2 text-sm text-base-content/60">Terpilih: {selectedFile.name}</p>{/if}
					{#if form && 'errors' in form && form.errors?._form}<div class="mt-3 text-sm text-error">{form.errors._form[0]}</div>{/if}
					<div class="mt-4 flex justify-center gap-2">
						<button type="submit" disabled={!selectedFile || isSubmitting} class="btn btn-primary">
							{#if isSubmitting}<span class="loading loading-spinner loading-sm"></span>{/if}
							Upload File
						</button>
					</div>
				</form>
			</div>
			<div class="flex justify-center">
				<a href="/member/pendataan/template" data-sveltekit-preload-data="off" class="btn btn-outline btn-sm">
					<Download class="h-4 w-4" /> Download Template
				</a>
			</div>
		</div>

	{:else if step === 'mapping'}
		<div in:fade class="space-y-4">
			{#if sheets.length > 1}
				<div class="rounded-lg border p-3">
					<h2 class="mb-2 text-sm font-semibold">Pilih Sheet</h2>
					<div class="flex flex-wrap gap-2">
						{#each sheets as s}
							<button class="btn btn-xs {selectedSheetIndex === s.index ? 'btn-primary' : 'btn-outline'}" onclick={() => handleSheetChange(s.index)}>
								<FileSpreadsheet class="h-3 w-3" /> {s.name}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Data Start Row Config -->
			<div class="rounded-lg border p-3">
				<label class="flex items-center gap-2">
					<span class="text-sm font-medium">Data dimulai dari baris ke-</span>
					<input type="number" value={dataStartRow} min="1" max="9999" oninput={(e) => handleDataStartRowChange(parseInt((e.target as HTMLInputElement).value) || 1)} class="input input-bordered input-sm w-20 text-center" />
					{#if hasHeader}<span class="text-xs text-base-content/50">(baris 1 = header)</span>{/if}
				</label>
			</div>

			<!-- Preview -->
			<div class="rounded-lg border p-4">
				<h2 class="mb-3 text-lg font-semibold">Pratinjau — <span class="text-base-content/60">{curName}</span></h2>
				{#if previewEmpty}
					<p class="text-sm text-base-content/50">Tidak ada data untuk ditampilkan pada baris ke-{dataStartRow}.</p>
				{:else}
					<p class="mb-2 text-xs text-base-content/50">Menampilkan {previewRows.length} baris.</p>
					<div class="overflow-x-auto">
						<table class="table table-xs">
							<thead>
								<tr>
									{#each previewHeaders as h}
										<th class="whitespace-nowrap text-xs">{h || '—'}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each previewRows as row}
									<tr>
										<td class="text-base-content/40 text-xs text-right pr-2 select-none w-10">{row.rowNum}</td>
										{#each row.cells as c}
											<td class="max-w-[120px] truncate text-xs">{c || '—'}</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</div>

			<!-- Column Mapping -->
			<div class="rounded-lg border p-4">
				<h2 class="mb-3 text-lg font-semibold">Mapping Kolom</h2>
				<p class="mb-3 text-sm text-base-content/70">
					Tentukan kolom Excel yang sesuai untuk setiap field database.
					<span class="text-error">*</span> wajib diisi.
				</p>
				<div class="overflow-x-auto">
					<table class="table table-xs" style="table-layout: fixed">
						<colgroup>
							<col class="w-36" />
							<col class="w-56" />
							<col />
						</colgroup>
						<thead><tr><th class="whitespace-nowrap">Field Database</th><th class="whitespace-nowrap">Kolom Excel</th><th>Contoh</th></tr></thead>
						<tbody>
							{#each FIELD_OPTIONS as opt}
								{#if opt.value}
									<tr>
										<td class="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis">{opt.label}{#if opt.required} <span class="text-error">*</span>{/if}</td>
										<td class="whitespace-nowrap">
											<select class="select select-bordered select-xs w-full max-w-48" value={mapping[opt.value] || ''} onchange={(e) => handleMappingChange(opt.value, (e.target as HTMLSelectElement).value)}>
												<option value="" disabled={opt.required}>— Kosongkan (null) —</option>
												{#if FIELDS_WITH_DEFAULTS.has(opt.value)}
													<option value="default">— Gunakan default ({FIELD_DEFAULT_LABELS[opt.value]}) —</option>
												{/if}
												{#each Array.from({ length: maxCols }, (_, i) => i) as i}
													<option value={colLetter(i)}>Kolom {colLetter(i)}</option>
												{/each}
												<option value="__custom__">— Isi nilai kustom —</option>
											</select>
											{#if mapping[opt.value] === '__custom__'}
												<input type="text" value={customValues[opt.value] || ''} oninput={(e) => handleCustomValueChange(opt.value, (e.target as HTMLInputElement).value)} placeholder="Masukkan nilai default..." class="input input-bordered input-xs mt-1 w-full max-w-48" />
											{/if}
										</td>
										<td class="max-w-[160px] truncate text-xs text-base-content/60 {mapping[opt.value] === '__custom__' ? 'border-0' : ''}">
											{#if mapping[opt.value] === '__custom__'}{:else}{exampleValue(opt.value) || '—'}{/if}
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			<!-- Validation Results -->
			{#if validated && previewData}
				<div class="rounded-lg border border-success/30 bg-success/5 p-4">
					<h2 class="mb-2 text-lg font-semibold">Hasil Validasi</h2>
					<div class="flex flex-wrap gap-3 text-sm">
						<div class="flex items-center gap-1 rounded-lg bg-success/10 px-3 py-1.5 text-success font-medium">
							<CheckCircle class="h-4 w-4" /> Valid: {previewData.validCount}
						</div>
						<div class="flex items-center gap-1 rounded-lg bg-error/10 px-3 py-1.5 text-error font-medium">
							<XCircle class="h-4 w-4" /> Error: {previewData.errorCount}
						</div>
						<div class="flex items-center gap-1 rounded-lg bg-info/10 px-3 py-1.5 text-info font-medium">
							<Database class="h-4 w-4" /> Total: {previewData.totalRows}
						</div>
					</div>
				</div>

				{#if previewData.errorRows.length > 0}
					<div class="rounded-lg border border-error/30 bg-error/5 p-4">
						<h3 class="mb-2 flex items-center gap-2 font-semibold text-error">
							<AlertTriangle class="h-4 w-4" /> Baris Bermasalah ({previewData.errorRows.length})
						</h3>
						<div class="max-h-48 overflow-y-auto text-sm">
							{#each previewData.errorRows as er}
								<div class="border-b border-base-300 py-1 last:border-0">
									<span class="font-medium text-xs">Baris {er.row}:</span>
									{#each er.errors as e}<span class="ml-1 text-xs text-error">{e.message}</span>{/each}
								</div>
							{/each}
						</div>
					</div>
				{/if}
			{/if}

			<!-- Actions -->
			{#if validated && previewData}
				<form method="POST" enctype="multipart/form-data" action="?/import" use:enhance={handleEnhance}>
					<input type="hidden" name="sheetIndex" value={selectedSheetIndex} />
					<input type="hidden" name="mapping" value={JSON.stringify(mapping)} />
					<input type="hidden" name="customValues" value={JSON.stringify(customValues)} />
					<input type="hidden" name="dataStartRow" value={dataStartRow} />
					<input type="hidden" name="confirmed" value="true" />
					<div class="flex gap-2">
						<button type="submit" disabled={previewData.validCount === 0 || isSubmitting} class="btn btn-primary">
							{#if isSubmitting}<span class="loading loading-spinner loading-sm"></span>{/if}
							Import {previewData.validCount} Data
						</button>
						<button type="button" onclick={() => { validated = false; previewData = null; }} class="btn btn-ghost">Ubah Mapping</button>
					</div>
				</form>
			{:else}
				<form method="POST" enctype="multipart/form-data" action="?/preview" use:enhance={handleEnhance}>
					<input type="hidden" name="sheetIndex" value={selectedSheetIndex} />
					<input type="hidden" name="mapping" value={JSON.stringify(mapping)} />
					<input type="hidden" name="customValues" value={JSON.stringify(customValues)} />
					<input type="hidden" name="dataStartRow" value={dataStartRow} />
					<div class="flex gap-2">
						<button type="submit" disabled={!mapping['nama'] || mapping['nama'] === '' || isSubmitting} class="btn btn-primary">
							{#if isSubmitting}<span class="loading loading-spinner loading-sm"></span>{/if}
							Validasi & Lanjutkan
						</button>
						<button type="button" onclick={() => { step = 'upload'; selectedFile = undefined; validated = false; previewData = null; }} class="btn btn-ghost">Upload Ulang</button>
					</div>
				</form>
			{/if}
		</div>

	{:else if step === 'result'}
		<div in:fade class="space-y-4">
			{#if importResult}
				<div class="rounded-lg border border-success/30 bg-success/5 p-6 text-center">
					<CheckCircle class="mx-auto mb-2 h-12 w-12 text-success" />
					<h2 class="text-xl font-semibold">Import Selesai!</h2>
					<p class="mt-1 text-base-content/70">
						{importResult.importedCount} data berhasil diimport.
						{#if importResult.failedCount > 0}&nbsp;{importResult.failedCount} data gagal.{/if}
					</p>
				</div>
				{#if importResult.importErrors?.length > 0}
					<div class="rounded-lg border border-warning/30 bg-warning/5 p-4">
						<h3 class="mb-2 flex items-center gap-2 font-semibold text-warning"><AlertTriangle class="h-4 w-4" /> Detail Error ({importResult.importErrors.length})</h3>
						<div class="max-h-48 overflow-y-auto text-sm">
							{#each importResult.importErrors as ie}
								<div class="border-b border-base-300 py-1 last:border-0"><span class="font-medium text-xs">Baris {ie.row}:</span> {ie.message}</div>
							{/each}
						</div>
					</div>
				{/if}
				{#if importResult.backupTable}
					<div class="rounded-lg border border-info/30 bg-info/5 p-4">
						<h3 class="mb-2 flex items-center gap-2 font-semibold text-info"><Database class="h-4 w-4" /> Backup & Rollback</h3>
						<p class="mb-1 text-sm">Tabel <code class="rounded bg-base-300 px-1 text-xs">{importResult.backupTable}</code> telah dibuat sebagai cadangan sebelum import.</p>
						<p class="mb-3 text-xs text-base-content/60">Klik tombol di bawah untuk mendownload file SQL rollback. Jalankan di Turso console jika terjadi kesalahan.</p>
						<button onclick={() => downloadRollbackSQL(importResult.rollbackSQL, importResult.backupTable)} class="btn btn-outline btn-info btn-sm gap-2">
							<Download class="h-4 w-4" /> Download Rollback SQL
						</button>
					</div>
				{/if}
				<a href="/member/pendataan" class="btn btn-primary w-full">Kembali ke Pendataan</a>
			{/if}
		</div>
	{/if}
</div>
