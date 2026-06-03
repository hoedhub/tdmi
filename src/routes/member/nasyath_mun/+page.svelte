<script lang="ts">
	// 1. IMPORTS
	import { onMount, tick } from 'svelte';
	import { page } from '$app/stores';
	import {
		Calendar,
		TrendingUp,
		Users,
		Edit,
		Trash2,
		PlusCircle,
		Download,
		LayoutDashboard,
		Table,
		ChevronLeft,
		ChevronRight,
		MapPin,
		Clock,
		Route,
		UserCheck
	} from 'lucide-svelte';
	import { toHindi } from '$lib/utils/toHindi';
	import type { PageData } from './$types';
	import SuperTable from '$lib/components/SuperTable/SuperTable.svelte';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable/types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { loading as showLoadingToast, update, success, error } from '$lib/components/toast';
	import type { ActionResult } from '@sveltejs/kit';
	import { api } from '$lib/utils/api';
	import MonthPickerDropdown from '$lib/components/MonthPickerDropdown.svelte';
	import BaseChart from '$lib/components/charts/BaseChart.svelte';

	interface Props {
		data: PageDataExtended;
	}

	let { data }: Props = $props();

	// 2. PROPS
	interface ChartData {
		activitiesPerMonth: { month: string; count: number }[];
		mostActiveMembers: MemberActivity[];
		activitiesByDay: { dayOfWeek: number; count: number }[];
		topPlaces: { tempat: string; count: number }[];
	}

	interface KPIData {
		totalThisMonth: number;
		totalThisYear: number;
		mostFrequentActivity: string;
		kpiTitle: string;
		totalJarak: number;
		avgDurasi: number;
		uniqueMuridCount: number;
	}

	type PageDataExtended = PageData & {
		charts: ChartData;
		kpi: KPIData;
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


	// 3. STATE MANAGEMENT FOR VIEW TOGGLE
	let currentView: 'dashboard' | 'table' = $state('dashboard'); // Changed default to dashboard

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

		// Initialize view from localStorage
		if (typeof window !== 'undefined') {
			const savedView = localStorage.getItem(`${$page.data.user?.id || 'default'}-nasyathView`);
			if (savedView === 'table' || savedView === 'dashboard') {
				currentView = savedView;
			}
		}

		// Initialize filters from URL on first load
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

	// --- DASHBOARD LOGIC ---
	interface MemberActivity {
		murid: { nama: string | null } | null;
		activityCount: number;
	}

	const commonChartOptions = {
		plugins: {
			legend: {
				position: 'bottom' as const,
				labels: {
					boxWidth: 12,
					usePointStyle: true,
					font: { size: 11 }
				}
			},
			tooltip: {
				callbacks: {
					label: function (context: any) {
						return `${context.label}: ${toHindi(context.raw)}`;
					}
				}
			}
		}
	};

	const pieChartOptions = {
		...commonChartOptions,
		maintainAspectRatio: false,
	};

	const barChartOptions = {
		...commonChartOptions,
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					font: { size: 11 },
					callback: function (value: any) { return toHindi(value); }
				}
			},
			x: {
				ticks: { font: { size: 11 } }
			}
		}
	};

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
	interface NasyathRow {
		id: number;
		kegiatan: string;
		tanggalMulai: string | Date;
		tanggalSelesai: string | Date | null;
		durasi: string | null;
		tempat: string | null;
		murid?: { nama: string | null };
	}

	let nasyathData: NasyathRow[] = $state([]);
	let totalItems = $state(0);
	let loading = $state(true);
	let dbError = false;
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
		dbError = false;

		let finalDateFilter = {};
		if (periodType === 'bulan') {
			const year = selectedDate.getFullYear();
			const month = selectedDate.getMonth();
			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);
			const formatDate = (d: Date) => d.toISOString().split('T')[0];
			finalDateFilter = { start: formatDate(startDate), end: formatDate(endDate) };
		} else {
			finalDateFilter = { ...dateFilter };
		}

		try {
			const response = await api('/member/nasyath_mun/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sort,
					filters: { ...filters, dateRange: finalDateFilter },
					page,
					pageSize: limit
				})
			});
			if (!response.ok) throw new Error('Gagal memuat data nasyath dari server');
			const result = await response.json();
			nasyathData = result.data;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (err) {
			const e = err as Error;
			console.error('Error fetching nasyath data:', e);
			dbError = true;
			error(e.message || 'Gagal memuat data dari server.');
		} finally {
			loading = false;
		}
	}

	async function applyFilters() {
		// This function updates both the dashboard (by reloading page data) and the table.
		const params = new URLSearchParams($page.url.searchParams);

		let finalDateFilter: { start: string; end: string } = { start: '', end: '' };

		if (periodType === 'bulan') {
			const year = selectedDate.getFullYear();
			const month = selectedDate.getMonth();
			const startDate = new Date(year, month, 1);
			const endDate = new Date(year, month + 1, 0);
			const formatDate = (d: Date) => {
				const y = d.getFullYear();
				const m = (d.getMonth() + 1).toString().padStart(2, '0');
				const day = d.getDate().toString().padStart(2, '0');
				return `${y}-${m}-${day}`;
			};
			finalDateFilter = { start: formatDate(startDate), end: formatDate(endDate) };
		} else {
			finalDateFilter = { ...dateFilter };
		}

		// Set params for server `load` function
		if (finalDateFilter.start) params.set('start', finalDateFilter.start);
		else params.delete('start');
		if (finalDateFilter.end) params.set('end', finalDateFilter.end);
		else params.delete('end');

		// Only navigate if params have changed to avoid unnecessary reloads
		if (params.toString() !== $page.url.searchParams.toString()) {
			await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		}

		// Always refetch table data with the correct filters
		await fetchNasyathData(currentSort, currentFilters, 1);
	}

	async function resetFilters() {
		periodType = 'bulan';
		selectedDate = new Date();
		dateFilter.start = '';
		dateFilter.end = '';

		// Navigate to clear URL params. This will trigger a page data reload for the dashboard.
		if ($page.url.searchParams.toString() !== '') {
			await goto('?', { keepFocus: true, noScroll: true });
		}

		// After navigation, fetch the table data for the now-default state.
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
		const toastId = showLoadingToast('Memulai proses ekspor...', { duration: 0 });
		isExporting = true;

		try {
			await new Promise((resolve) => setTimeout(resolve, 100));

			let finalDateFilter = {};
			if (periodType === 'bulan') {
				const year = selectedDate.getFullYear();
				const month = selectedDate.getMonth();
				const startDate = new Date(year, month, 1);
				const endDate = new Date(year, month + 1, 0);
				const formatDate = (d: Date) => d.toISOString().split('T')[0];
				finalDateFilter = { start: formatDate(startDate), end: formatDate(endDate) };
			} else {
				finalDateFilter = { ...dateFilter };
			}

			const response = await api('/member/nasyath_mun/export', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					filters: { ...currentFilters, dateRange: finalDateFilter },
					sort: currentSort,
					periodType: periodType,
					dateInfo:
						periodType === 'bulan'
							? { month: selectedDate.getMonth(), year: selectedDate.getFullYear() }
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
			console.error('Export error:', e);
		} finally {
			isExporting = false;
		}
	}

	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	// --- MONTH PICKER LOGIC ---
	let selectedDate = $state(new Date());
	const monthNames = [
		'يناير',
		'فبراير',
		'مارس',
		'أبريل',
		'مايو',
		'يونيو',
		'يوليو',
		'أغسطس',
		'سبتمبر',
		'أكتوبر',
		'نوفمبر',
		'ديسمبر'
	];

	// Period Selector
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
	let columns = $derived((() => {
		const baseColumns: ColumnDef[] = [
			{ key: 'kegiatan', label: 'النشاط', sortable: true, filterable: 'text' },
			{
				key: 'tanggalMulai',
				label: 'تاريخ البدء',
				sortable: true,
				formatter: (value: any) =>
					value ? toHindi(new Date(value).toLocaleDateString('ar-EG-u-nu-arab')) : '-'
			},
			{
				key: 'tanggalSelesai',
				label: 'تاريخ الانتهاء',
				sortable: true,
				formatter: (value: any) =>
					value ? toHindi(new Date(value).toLocaleDateString('ar-EG-u-nu-arab')) : '-'
			},
			{
				key: 'durasi',
				label: 'المدة',
				sortable: true,
				filterable: 'text',
				formatter: (value: any) => toHindi(value)
			},
			{ key: 'tempat', label: 'المكان', sortable: true, filterable: 'text' }
		];
		if (data && data.canReadAll) {
			return [
				{
					key: 'murid.nama',
					label: 'الاسم',
					sortable: true,
					filterable: 'text',
					formatter: (value: any, row: NasyathRow) => row.murid?.nama || 'N/A'
				} as ColumnDef<NasyathRow>,
				...baseColumns
			];
		}
		return baseColumns;
	})());
	let monthYearDisplay = $derived(`${monthNames[selectedDate.getMonth()]} ${toHindi(
		selectedDate.getFullYear()
	)}`);
</script>

<div class="container mx-auto p-4" dir="rtl">
	<!-- Header with View Toggle -->
	<div class="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
		<h1 class="text-2xl font-bold">
			{currentView === 'dashboard' ? 'لوحة معلومات النشاط' : 'قائمة نشاط الأعضاء'}
		</h1>
		<div class="btn-group">
			<button
				class="btn btn-sm"
				class:btn-active={currentView === 'dashboard'}
				onclick={() => setView('dashboard')}
			>
				<LayoutDashboard class="h-4 w-4" /> Dashboard
			</button>
			<button
				class="btn btn-sm"
				class:btn-active={currentView === 'table'}
				onclick={() => setView('table')}
			>
				<Table class="h-4 w-4" /> Tabel
			</button>
		</div>
	</div>

	<!-- Conditional Rendering -->
	{#if currentView === 'dashboard'}
		<!-- DASHBOARD VIEW -->
		<div class="space-y-6">
			<!-- KPI Cards -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
					<div class="stat-figure text-primary"><Calendar class="h-8 w-8 opacity-20" /></div>
					<div class="stat-title text-xs font-bold uppercase tracking-wider">{data.kpi.kpiTitle}</div>
					<div class="stat-value text-primary text-3xl">{toHindi(data.kpi.totalThisMonth)}</div>
					<div class="stat-desc text-xs mt-1">من إجمالي {toHindi(data.kpi.totalThisYear)} هذا العام</div>
				</div>
				
				<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
					<div class="stat-figure text-secondary"><UserCheck class="h-8 w-8 opacity-20" /></div>
					<div class="stat-title text-xs font-bold uppercase tracking-wider">الأعضاء المشاركون</div>
					<div class="stat-value text-secondary text-3xl">{toHindi(data.kpi.uniqueMuridCount)}</div>
					<div class="stat-desc text-xs mt-1">عضو نشط في هذه الفترة</div>
				</div>

				<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
					<div class="stat-figure text-accent"><Route class="h-8 w-8 opacity-20" /></div>
					<div class="stat-title text-xs font-bold uppercase tracking-wider">إجمالي المسافة</div>
					<div class="stat-value text-accent text-3xl">{toHindi(data.kpi.totalJarak)} <span class="text-sm font-normal">كم</span></div>
					<div class="stat-desc text-xs mt-1">المسافة المقطوعة للأنشطة</div>
				</div>

				<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
					<div class="stat-figure text-warning"><Clock class="h-8 w-8 opacity-20" /></div>
					<div class="stat-title text-xs font-bold uppercase tracking-wider">متوسط المدة</div>
					<div class="stat-value text-warning text-3xl">{toHindi(data.kpi.avgDurasi)} <span class="text-sm font-normal">ساعة</span></div>
					<div class="stat-desc text-xs mt-1">لكل نشاط في المتوسط</div>
				</div>
			</div>

			<!-- Main Charts Grid -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
				<!-- Monthly Trend - Line/Area Chart -->
				<div class="card bg-base-100 shadow-md border border-base-200 lg:col-span-8">
					<div class="card-body p-4 sm:p-6">
						<div class="flex items-center justify-between mb-4">
							<h2 class="card-title text-base font-bold flex items-center gap-2">
								<TrendingUp class="h-5 w-5 text-primary" />
								اتجاه النشاط الشهري
							</h2>
						</div>
						<div class="h-64 sm:h-80">
							<BaseChart type="line" data={activitiesPerMonth} options={barChartOptions} />
						</div>
					</div>
				</div>

				<!-- Most Active Members - Doughnut Chart -->
				<div class="card bg-base-100 shadow-md border border-base-200 lg:col-span-4">
					<div class="card-body p-4 sm:p-6">
						<h2 class="card-title text-base font-bold flex items-center gap-2 mb-4">
							<Users class="h-5 w-5 text-secondary" />
							الأعضاء الأكثر نشاطًا
						</h2>
						<div class="h-64 sm:h-80">
							<BaseChart type="doughnut" data={mostActiveMembers} options={pieChartOptions} />
						</div>
					</div>
				</div>

				<!-- Top Places - Horizontal Bar Chart -->
				<div class="card bg-base-100 shadow-md border border-base-200 lg:col-span-6">
					<div class="card-body p-4 sm:p-6">
						<h2 class="card-title text-base font-bold flex items-center gap-2 mb-4">
							<MapPin class="h-5 w-5 text-accent" />
							الأماكن الأكثر تكراراً
						</h2>
						<div class="h-64 sm:h-80">
							<BaseChart type="bar" data={topPlaces} options={{
								...barChartOptions,
								indexAxis: 'y'
							}} />
						</div>
					</div>
				</div>

				<!-- Activities by Day - Bar Chart -->
				<div class="card bg-base-100 shadow-md border border-base-200 lg:col-span-6">
					<div class="card-body p-4 sm:p-6">
						<h2 class="card-title text-base font-bold flex items-center gap-2 mb-4">
							<Calendar class="h-5 w-5 text-warning" />
							توزيع الأنشطة حسب أيام الأسبوع
						</h2>
						<div class="h-64 sm:h-80">
							<BaseChart type="bar" data={activitiesByDay} options={barChartOptions} />
						</div>
					</div>
				</div>
			</div>

			<!-- Recent Activities Table with Enhanced Styling -->
			<div class="card bg-base-100 shadow-md border border-base-200">
				<div class="card-body p-0">
					<div class="p-4 sm:p-6 border-b border-base-200 flex items-center justify-between">
						<h2 class="card-title text-base font-bold flex items-center gap-2">
							<Clock class="h-5 w-5 text-info" />
							أحدث الأنشطة المسجلة
						</h2>
						<div class="badge badge-outline">{toHindi(data.recentActivities.length)} أنشطة</div>
					</div>
					<div class="overflow-x-auto">
						<table class="table table-zebra w-full">
							<thead>
								<tr class="bg-base-200/50">
									{#if data.canReadAll}<th class="text-xs uppercase">العضو</th>{/if}
									<th class="text-xs uppercase">النشاط</th>
									<th class="text-xs uppercase">تاريخ البدء</th>
									<th class="text-xs uppercase">المكان</th>
								</tr>
							</thead>
							<tbody class="text-sm">
								{#each data.recentActivities as activity}
									<tr class="hover">
										{#if data.canReadAll}
											<td class="font-medium text-primary">{activity.muridNama || '-'}</td>
										{/if}
										<td class="font-medium">{activity.kegiatan}</td>
										<td>
											{#if activity.tanggalMulai}
												<div class="flex items-center gap-2">
													<Calendar class="h-3.5 w-3.5 opacity-50" />
													{toHindi(new Date(Date.parse(activity.tanggalMulai)).toLocaleDateString('ar-EG'))}
												</div>
											{:else}-{/if}
										</td>
										<td>
											{#if activity.tempat}
												<div class="flex items-center gap-2">
													<MapPin class="h-3.5 w-3.5 opacity-50" />
													{activity.tempat}
												</div>
											{:else}-{/if}
										</td>
									</tr>
								{:else}
									<tr>
										<td colspan={data.canReadAll ? 4 : 3} class="text-center py-8 opacity-50 italic">
											لا توجد أنشطة حديثة متاحة لهذا النطاق.
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	{:else if currentView === 'table'}
		<!-- TABLE VIEW -->
		<div class="space-y-4">
			<div class="flex items-center justify-end gap-2">
				<button
					class="btn btn-secondary btn-sm"
					onclick={handleExport}
					disabled={isExporting || nasyathData.length === 0 || loading}
					title={nasyathData.length === 0 ? 'Tidak ada data untuk diekspor' : 'Ekspor data'}
				>
					<Download class="h-4 w-4" />
					{#if isExporting}Mengekspor...{:else}Export ke XLSX{/if}
				</button>
				<a href="/member/nasyath_mun/new" class="btn btn-primary btn-sm"
					><PlusCircle class="h-4 w-4" /> Tambah Baru</a
				>
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
						<!-- Period Selector -->
						<div class="form-control">
							<label class="label pb-1" for="period-type-select"
								><span class="label-text">تحديد الفترة</span></label
							>
							<select
								id="period-type-select"
								class="select select-bordered select-sm"
								bind:value={periodType}
							>
								<option value="bulan">شهري</option>
								<option value="rentang">نطاق تاريخ</option>
							</select>
						</div>

						{#if periodType === 'bulan'}
							<!-- Month Selector Dropdown -->
							<div class="form-control">
								<label class="label pb-1" for="month-select"
									><span class="label-text">تحديد الشهر</span></label
							>
								<div class="join">
									<button class="btn join-item btn-sm" onclick={previousMonth}>
										<ChevronRight class="h-4 w-4" />
									</button>
									<button class="btn join-item btn-sm w-36 font-normal" onclick={showMonthPicker}>
										{monthYearDisplay}
									</button>
									<button class="btn join-item btn-sm" onclick={nextMonth}>
										<ChevronLeft class="h-4 w-4" />
									</button>
								</div>
							</div>
						{:else if periodType === 'rentang'}
							<!-- Date Range Filter -->
							<div class="form-control w-full md:w-auto">
								<label for="startDate" class="label pb-1">
									<span class="label-text">من تاريخ</span>
								</label>
								<input
									type="date"
									id="startDate"
									bind:value={dateFilter.start}
									class="input input-sm input-bordered w-full"
								/>
							</div>
							<div class="form-control w-full md:w-auto">
								<label for="endDate" class="label pb-1">
									<span class="label-text">إلى تاريخ</span>
								</label>
								<input
									type="date"
									id="endDate"
									bind:value={dateFilter.end}
									class="input input-sm input-bordered w-full"
								/>
							</div>
						{/if}

						<div class="flex items-center gap-1">
							<button class="btn btn-primary btn-sm" onclick={applyFilters}>تصفية</button><button
								class="btn btn-ghost btn-sm"
								onclick={resetFilters}>إعادة تعيين</button
							>
						</div>
					</div>
				{/snippet}

				{#snippet rowActions({ row })}
					<div class="flex items-center gap-1">
						<button
							class="btn btn-ghost btn-xs"
							aria-label="Edit item"
							onclick={() => handleEdit(row.id)}><Edit class="h-4 w-4" /></button
						>
						<form
							method="POST"
							action={`/member/nasyath_mun/${row.id}/delete`}
							use:enhance={handleDeleteSubmit}
							onsubmit={handleSubmit}
						>
							<button type="submit" class="btn btn-ghost btn-xs text-error" aria-label="Delete item"
								><Trash2 class="h-4 w-4" /></button
							>
						</form>
					</div>
				{/snippet}
			</SuperTable>
		</div>
	{/if}
</div>
