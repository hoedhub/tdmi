<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import { Edit, Trash2, PlusCircle, Download, LayoutDashboard, Table, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { toHindi } from '$lib/utils/toHindi';
	import type { PageData } from './$types';
	import SuperTable from '$lib/components/SuperTable/SuperTable.svelte';
	import type { SortConfig, FilterState } from '$lib/components/SuperTable/types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { loading as showLoadingToast, update, success, error } from '$lib/components/toast';
	import type { ActionResult } from '@sveltejs/kit';
	import { api } from '$lib/utils/api';
	import MonthPickerDropdown from '$lib/components/MonthPickerDropdown.svelte';
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	import type { NasyathRow } from './config/columns';
	import { buildColumns } from './config/columns';
	import { exportNasyathToXLSX } from './actions/exportNasyath';
	import NasyathKPICards from './components/NasyathKPICards.svelte';
	import NasyathCharts from './components/NasyathCharts.svelte';
	import NasyathRecentTable from './components/NasyathRecentTable.svelte';

	interface Props {
		data: PageData & {
			charts: {
				activitiesPerMonth: { month: string; count: number }[];
				mostActiveMembers: { murid: { nama: string | null } | null; activityCount: number }[];
				activitiesByDay: { dayOfWeek: number; count: number }[];
				topPlaces: { tempat: string; count: number }[];
			};
			kpi: {
				totalThisMonth: number;
				totalThisYear: number;
				mostFrequentActivity: string;
				kpiTitle: string;
				totalJarak: number;
				avgDurasi: number;
				uniqueMuridCount: number;
			};
			canReadAll: boolean;
			recentActivities: {
				id: number;
				kegiatan: string;
				tanggalMulai: string | null;
				tempat: string | null;
				muridNama: string | null;
			}[];
			dbError?: boolean;
			message?: string;
		};
	}

	let { data }: Props = $props();

	let currentView: 'dashboard' | 'table' = $state('dashboard');

	function setView(view: 'dashboard' | 'table') {
		currentView = view;
		if (typeof window !== 'undefined') {
			localStorage.setItem(`${$page.data.user?.id || 'default'}-nasyathView`, view);
		}
	}

	onMount(async () => {
		if (data.dbError) {
			error(data.message || 'Gagal memuat data dashboard.');
		}

		if (typeof window !== 'undefined') {
			const savedView = localStorage.getItem(`${$page.data.user?.id || 'default'}-nasyathView`);
			if (savedView === 'table' || savedView === 'dashboard') {
				currentView = savedView;
			}
		}

		const searchParams = $page.url.searchParams;
		const startStr = searchParams.get('start');
		const endStr = searchParams.get('end');

		if (startStr && endStr) {
			const startDate = new Date(startStr + 'T00:00:00');
			const endDate = new Date(endStr + 'T00:00:00');
			const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
			const lastDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
			if (
				startDate.getTime() === firstDayOfMonth.getTime() &&
				endDate.getTime() === lastDayOfMonth.getTime()
			) {
				periodType = 'bulan';
				selectedDate = startDate;
			} else {
				periodType = 'rentang';
				dateFilter.start = startStr;
				dateFilter.end = endStr;
			}
		} else {
			periodType = 'bulan';
			selectedDate = new Date();
		}

		await tick();
		fetchNasyathData(currentSort, currentFilters, currentPage);
	});

	// --- DERIVED CHART DATA ---
	const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

	let activitiesPerMonth = $derived({
		labels: data.charts.activitiesPerMonth.map((item) => {
			const [year, month] = item.month.split('-');
			return new Date(Number(year), Number(month) - 1).toLocaleString('ar-EG', {
				month: 'short',
				year: '2-digit'
			});
		}),
		datasets: [{
			label: 'عدد الأنشطة',
			data: data.charts.activitiesPerMonth.map((item) => item.count),
			backgroundColor: 'rgba(54, 162, 235, 0.5)',
			borderColor: 'rgba(54, 162, 235, 1)',
			borderWidth: 2,
			fill: true,
			tension: 0.4
		}]
	});

	let mostActiveMembers = $derived({
		labels: data.charts.mostActiveMembers.map((item) => item.murid?.nama || 'بدون اسم'),
		datasets: [{
			data: data.charts.mostActiveMembers.map((item) => item.activityCount),
			backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C7C7C7']
		}]
	});

	let activitiesByDay = $derived({
		labels: dayNames,
		datasets: [{
			label: 'الأنشطة حسب اليوم',
			data: dayNames.map((_, i) => {
				const found = data.charts.activitiesByDay.find(d => Number(d.dayOfWeek) === i);
				return found ? found.count : 0;
			}),
			backgroundColor: 'rgba(75, 192, 192, 0.6)',
			borderColor: 'rgba(75, 192, 192, 1)',
			borderWidth: 1
		}]
	});

	let topPlaces = $derived({
		labels: data.charts.topPlaces.map(p => p.tempat),
		datasets: [{
			label: 'الأماكن الأكثر زيارة',
			data: data.charts.topPlaces.map(p => p.count),
			backgroundColor: 'rgba(255, 159, 64, 0.6)',
			borderColor: 'rgba(255, 159, 64, 1)',
			borderWidth: 1
		}]
	});

	// --- TABLE LOGIC ---
	let nasyathData: NasyathRow[] = $state([]);
	let totalItems = $state(0);
	let loading = $state(true);
	let pageSize = $state(10);
	let currentPage = $state(1);
	let currentSort: SortConfig[] = $state([
		{ key: 'murid.nama', direction: 'asc' },
		{ key: 'tanggalMulai', direction: 'asc' }
	]);
	let currentFilters: FilterState = $state({ global: '', columns: {} });
	let dateFilter: { start: string; end: string } = $state({ start: '', end: '' });
	let isExporting = $state(false);

	async function fetchNasyathData(
		sort: SortConfig[] | undefined = currentSort,
		filters: FilterState = currentFilters,
		page: number = currentPage,
		limit: number = pageSize
	) {
		loading = true;
		let finalDateFilter = {};
		if (periodType === 'bulan') {
			const year = selectedDate.getFullYear();
			const month = selectedDate.getMonth();
			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);
			finalDateFilter = { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] };
		} else {
			finalDateFilter = { ...dateFilter };
		}

		try {
			const response = await api('/member/nasyath_mun/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ sort, filters: { ...filters, dateRange: finalDateFilter }, page, pageSize: limit })
			});
			if (!response.ok) throw new Error('Gagal memuat data nasyath dari server');
			const result = await response.json();
			nasyathData = result.data;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (err) {
			const e = err as Error;
			error(e.message || 'Gagal memuat data dari server.');
		} finally {
			loading = false;
		}
	}

	async function applyFilters() {
		const params = new URLSearchParams($page.url.searchParams);
		let finalDateFilter: { start: string; end: string } = { start: '', end: '' };

		if (periodType === 'bulan') {
			const year = selectedDate.getFullYear();
			const month = selectedDate.getMonth();
			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);
			const fmt = (d: Date) => {
				const y = d.getFullYear();
				const m = (d.getMonth() + 1).toString().padStart(2, '0');
				const day = d.getDate().toString().padStart(2, '0');
				return `${y}-${m}-${day}`;
			};
			finalDateFilter = { start: fmt(startDate), end: fmt(endDate) };
		} else {
			finalDateFilter = { ...dateFilter };
		}

		if (finalDateFilter.start) params.set('start', finalDateFilter.start);
		else params.delete('start');
		if (finalDateFilter.end) params.set('end', finalDateFilter.end);
		else params.delete('end');

		if (params.toString() !== $page.url.searchParams.toString()) {
			await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		}
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	async function resetFilters() {
		periodType = 'bulan';
		selectedDate = new Date();
		dateFilter.start = '';
		dateFilter.end = '';
		if ($page.url.searchParams.toString() !== '') {
			await goto('?', { keepFocus: true, noScroll: true });
		}
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	async function handleSort(sort: SortConfig[] | null) {
		currentSort = sort ?? [];
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}

	async function handleFilter(filters: FilterState) {
		currentFilters = filters;
		currentPage = 1;
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	async function handlePageChange(page: number) {
		currentPage = page;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}

	async function handleItemsPerPageChange(newSize: number) {
		pageSize = newSize;
		currentPage = 1;
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	function handleEdit(id: number) {
		goto(`/member/nasyath_mun/${id}/edit`);
	}

	function handleDeleteSubmit() {
		return async ({ result }: { result: ActionResult }) => {
			if (result.type === 'redirect') {
				success('Data berhasil dihapus.');
				await fetchNasyathData(currentSort, currentFilters, currentPage);
			} else if (result.type === 'error' && result.error) {
				error(result.error.message || 'Gagal menghapus data.');
			}
		};
	}

	const handleSubmit = (e: Event) => {
		if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) {
			e.preventDefault();
		}
	};

	async function handleExport() {
		isExporting = true;
		try {
			await exportNasyathToXLSX({
				periodType,
				selectedDate,
				dateFilter,
				currentFilters,
				currentSort
			});
		} catch {
			// Toast already handled in exportNasyathToXLSX
		} finally {
			isExporting = false;
		}
	}

	// --- MONTH PICKER LOGIC ---
	let selectedDate = $state(new Date());
	const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
	let periodType: 'bulan' | 'rentang' = $state('bulan');

	function handleMonthChange(newDate: Date) {
		selectedDate = newDate;
	}

	function showMonthPicker(event: MouseEvent) {
		const btn = event.currentTarget as HTMLElement;
		const rect = btn.getBoundingClientRect();
		absoluteDropdownStore.toggle(rect, MonthPickerDropdown, 'down', {
			initialDate: selectedDate,
			onChange: handleMonthChange
		});
	}

	function previousMonth() {
		selectedDate = new Date(selectedDate.setMonth(selectedDate.getMonth() - 1));
	}

	function nextMonth() {
		selectedDate = new Date(selectedDate.setMonth(selectedDate.getMonth() + 1));
	}

	let columns = $derived(buildColumns(data.canReadAll));
	let monthYearDisplay = $derived(`${monthNames[selectedDate.getMonth()]} ${toHindi(selectedDate.getFullYear())}`);
</script>

<div class="container mx-auto p-4" dir="rtl">
	<div class="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
		<h1 class="text-2xl font-bold">
			{currentView === 'dashboard' ? 'لوحة معلومات النشاط' : 'قائمة نشاط الأعضاء'}
		</h1>
		<div class="btn-group">
			<button class="btn btn-sm" class:btn-active={currentView === 'dashboard'} onclick={() => setView('dashboard')}>
				<LayoutDashboard class="h-4 w-4" /> Dashboard
			</button>
			<button class="btn btn-sm" class:btn-active={currentView === 'table'} onclick={() => setView('table')}>
				<Table class="h-4 w-4" /> Tabel
			</button>
		</div>
	</div>

	{#if currentView === 'dashboard'}
		<div class="space-y-6">
			<NasyathKPICards
				totalThisMonth={data.kpi.totalThisMonth}
				totalThisYear={data.kpi.totalThisYear}
				kpiTitle={data.kpi.kpiTitle}
				uniqueMuridCount={data.kpi.uniqueMuridCount}
				totalJarak={data.kpi.totalJarak}
				avgDurasi={data.kpi.avgDurasi}
			/>
			<NasyathCharts {activitiesPerMonth} {mostActiveMembers} {topPlaces} {activitiesByDay} />
			<NasyathRecentTable activities={data.recentActivities} canReadAll={data.canReadAll} />
		</div>
	{:else if currentView === 'table'}
		<div class="space-y-4">
			<div class="flex items-center justify-end gap-2">
				<button class="btn btn-secondary btn-sm" onclick={handleExport} disabled={isExporting || nasyathData.length === 0 || loading} title={nasyathData.length === 0 ? 'Tidak ada data untuk diekspor' : 'Ekspor data'}>
					<Download class="h-4 w-4" />
					{#if isExporting}Mengekspor...{:else}Export ke XLSX{/if}
				</button>
				<a href="/member/nasyath_mun/new" class="btn btn-primary btn-sm"><PlusCircle class="h-4 w-4" /> Tambah Baru</a>
			</div>
			<SuperTable
				data={nasyathData}
				{columns}
				rowKey="id"
				serverSide={true}
				isSelectable={true}
				isLoadingProp={loading}
				bind:itemsPerPageProp={pageSize}
				bind:currentPageProp={currentPage}
				totalItemsProp={totalItems}
				bind:sort={currentSort}
				bind:filterStateProp={currentFilters}
				onsort={handleSort}
				onfilter={handleFilter}
				onpageChange={handlePageChange}
				onitemsPerPageChange={handleItemsPerPageChange}
			>
				{#snippet customFilters()}
					<div class="flex flex-col flex-wrap items-start gap-4 pt-2 md:flex-row md:items-end">
						<div class="form-control">
							<label class="label pb-1" for="period-type-select"><span class="label-text">تحديد الفترة</span></label>
							<select id="period-type-select" class="select select-bordered select-sm" bind:value={periodType}>
								<option value="bulan">شهري</option>
								<option value="rentang">نطاق تاريخ</option>
							</select>
						</div>

						{#if periodType === 'bulan'}
							<div class="form-control">
								<label class="label pb-1" for="month-select"><span class="label-text">تحديد الشهر</span></label>
								<div class="join">
									<button class="btn join-item btn-sm" onclick={previousMonth} aria-label="Bulan sebelumnya"><ChevronRight class="h-4 w-4" /></button>
									<button class="btn join-item btn-sm w-36 font-normal" onclick={showMonthPicker} aria-label="Pilih bulan">{monthYearDisplay}</button>
									<button class="btn join-item btn-sm" onclick={nextMonth} aria-label="Bulan berikutnya"><ChevronLeft class="h-4 w-4" /></button>
								</div>
							</div>
						{:else if periodType === 'rentang'}
							<div class="form-control w-full md:w-auto">
								<label for="startDate" class="label pb-1"><span class="label-text">من تاريخ</span></label>
								<input type="date" id="startDate" bind:value={dateFilter.start} class="input input-sm input-bordered w-full" />
							</div>
							<div class="form-control w-full md:w-auto">
								<label for="endDate" class="label pb-1"><span class="label-text">إلى تاريخ</span></label>
								<input type="date" id="endDate" bind:value={dateFilter.end} class="input input-sm input-bordered w-full" />
							</div>
						{/if}

						<div class="flex items-center gap-1">
							<button class="btn btn-primary btn-sm" onclick={applyFilters}>تصفية</button>
							<button class="btn btn-ghost btn-sm" onclick={resetFilters}>إعادة تعيين</button>
						</div>
					</div>
				{/snippet}

				{#snippet rowActions({ row })}
					<div class="flex items-center gap-1">
						<button class="btn btn-ghost btn-sm" aria-label="Edit item" onclick={() => handleEdit(row.id)}><Edit class="h-4 w-4" /></button>
						<form method="POST" action={`/member/nasyath_mun/${row.id}/delete`} use:enhance={handleDeleteSubmit} onsubmit={handleSubmit}>
							<button type="submit" class="btn btn-ghost btn-sm text-error" aria-label="Delete item"><Trash2 class="h-4 w-4" /></button>
						</form>
					</div>
				{/snippet}
			</SuperTable>
		</div>
	{/if}
</div>
