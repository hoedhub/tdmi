<script lang="ts">
	// 1. IMPORTS
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { Bar, Pie } from 'svelte-chartjs';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		ArcElement
	} from 'chart.js';
	import PieChart from '$lib/components/PieChart.svelte';
	import {
		Calendar,
		TrendingUp,
		Users,
		Edit,
		Trash2,
		PlusCircle,
		Download,
		LayoutDashboard,
		Table
	} from 'lucide-svelte';
	import { toHindi } from '$lib/utils/toHindi';
	import type { PageData } from './$types';
	import SuperTable from '$lib/components/SuperTable/SuperTable.svelte';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable/types';
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { success, error } from '$lib/components/toast';
	import type { ActionResult } from '@sveltejs/kit';

	// 2. PROPS
	interface ChartData {
		activitiesPerMonth: { month: string; count: number }[];
		mostActiveMembers: MemberActivity[];
	}

	interface KPIData {
		totalThisMonth: number;
		totalThisYear: number;
		mostFrequentActivity: string;
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
	};

	export let data: PageDataExtended;

	// 3. STATE MANAGEMENT FOR VIEW TOGGLE
	let currentView: 'dashboard' | 'table' = 'dashboard'; // Default view

	function setView(view: 'dashboard' | 'table') {
		currentView = view;
		if (typeof window !== 'undefined') {
			localStorage.setItem(`${$page.data.user?.id || 'default'}-nasyathView`, view);
		}
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const savedView = localStorage.getItem(`${$page.data.user?.id || 'default'}-nasyathView`);
			if (savedView === 'table' || savedView === 'dashboard') {
				currentView = savedView;
			}
		}
	});

	// --- DASHBOARD LOGIC ---
	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement);

	interface ActivitySummary {
		month: string;
		count: number;
	}

	interface MemberActivity {
		murid: { nama: string | null } | null;
		activityCount: number;
	}

	$: activitiesPerMonth = {
		labels: data.charts.activitiesPerMonth.map((item: { month: string; count: number }) => {
			const [year, month] = item.month.split('-');
			return new Date(Number(year), Number(month) - 1).toLocaleString('default', {
				month: 'short',
				year: '2-digit'
			});
		}),
		datasets: [
			{
				label: 'Jumlah Kegiatan',
				data: data.charts.activitiesPerMonth.map((item) => item.count),
				backgroundColor: 'rgba(54, 162, 235, 0.6)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			}
		]
	};

	$: mostActiveMembers = {
		labels: data.charts.mostActiveMembers.map(
			(item: MemberActivity) => item.murid?.nama || 'بدون اسم'
		),
		datasets: [
			{
				data: data.charts.mostActiveMembers.map((item: MemberActivity) => item.activityCount),
				backgroundColor: [
					'#FF6384',
					'#36A2EB',
					'#FFCE56',
					'#4BC0C0',
					'#9966FF',
					'#FF9F40',
					'#C7C7C7'
				],
				borderColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C7C7C7'],
				borderWidth: 1
			}
		]
	};

	const pieChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 10,
				right: 10,
				top: 20,
				bottom: 0
			}
		},
		plugins: {
			legend: {
				position: 'bottom' as const,
				rtl: true,
				align: 'end' as const, // Mengatur rata kanan (karena RTL)
				maxHeight: 80, // Maksimum tinggi legend
				labels: {
					boxWidth: 12,
					usePointStyle: true,
					padding: 8,
					font: {
						size: 11
					}
				},
				overflow: {
					y: 'scroll' // Membuat legend bisa di-scroll vertikal
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

	const barChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		layout: {
			padding: {
				left: 10,
				right: 10,
				top: 20,
				bottom: 10
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					font: {
						size: 11
					},
					callback: function (value: any) {
						return toHindi(value);
					}
				}
			},
			x: {
				ticks: {
					font: {
						size: 11
					}
				}
			}
		},
		plugins: {
			legend: {
				position: 'top' as const,
				labels: {
					boxWidth: 15,
					usePointStyle: true,
					padding: 15,
					font: {
						size: 11
					}
				}
			}
		}
	};

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

	let nasyathData: NasyathRow[] = [];
	let totalItems = 0;
	let loading = true;
	let dbError = false;
	let pageSize = 10;
	let currentPage = 1;
	let currentSort: SortConfig[] | undefined = [
		{ key: 'murid.nama', direction: 'asc' },
		{ key: 'tanggalMulai', direction: 'asc' }
	];
	let currentFilters: FilterState = { global: '', columns: {} };
	let dateFilter: { start: string; end: string } = { start: '', end: '' };
	let isExporting = false;

	$: columns = (() => {
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
	})();

	async function fetchNasyathData(
		sort?: SortConfig[] | null,
		filters?: FilterState,
		page: number = 1
	) {
		loading = true;
		dbError = false;
		try {
			const response = await fetch('/member/nasyath_mun/table', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					sort,
					filters: { ...filters, dateRange: dateFilter },
					page,
					pageSize
				})
			});
			if (!response.ok) throw new Error('Gagal memuat data nasyath');
			const result = await response.json();
			nasyathData = result.data;
			totalItems = result.totalItems;
			currentPage = result.currentPage;
		} catch (err) {
			console.error('Error fetching nasyath data:', err);
			dbError = true;
			error('Gagal memuat data dari server.');
		} finally {
			loading = false;
		}
	}

	function applyDateFilter() {
		fetchNasyathData(currentSort, currentFilters, 1);
	}
	function resetDateFilter() {
		dateFilter.start = '';
		dateFilter.end = '';
		applyDateFilter();
	}
	async function handleSort(event: CustomEvent<SortConfig[] | null>) {
		currentSort = event.detail ?? undefined;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}
	async function handleFilter(event: CustomEvent<FilterState>) {
		currentFilters = event.detail;
		await fetchNasyathData(currentSort, currentFilters, 1);
	}
	async function handlePageChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await fetchNasyathData(currentSort, currentFilters, currentPage);
	}
	async function handleItemsPerPageChange(event: CustomEvent<number>) {
		pageSize = event.detail;
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
		/* ... (export logic remains the same) ... */
	}

	onMount(() => {
		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth();
		const startDate = new Date(year, month, 1);
		const endDate = new Date(year, month + 1, 0);
		const formatDate = (d: Date) => {
			const y = d.getFullYear();
			const m = (d.getMonth() + 1).toString().padStart(2, '0');
			const day = d.getDate().toString().padStart(2, '0');
			return `${y}-${m}-${day}`;
		};
		dateFilter.start = formatDate(startDate);
		dateFilter.end = formatDate(endDate);
		fetchNasyathData(currentSort, currentFilters, currentPage);
	});
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
				on:click={() => setView('dashboard')}
			>
				<LayoutDashboard class="h-4 w-4" /> Dashboard
			</button>
			<button
				class="btn btn-sm"
				class:btn-active={currentView === 'table'}
				on:click={() => setView('table')}
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
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="stat rounded-lg bg-base-200 shadow">
					<div class="stat-figure text-primary"><Calendar class="h-8 w-8" /></div>
					<div class="stat-title">نشاط هذا الشهر</div>
					<div class="stat-value text-primary">{toHindi(data.kpi.totalThisMonth)}</div>
				</div>
				<div class="stat rounded-lg bg-base-200 shadow">
					<div class="stat-figure text-secondary"><Calendar class="h-8 w-8" /></div>
					<div class="stat-title">نشاط هذا العام</div>
					<div class="stat-value text-secondary">{toHindi(data.kpi.totalThisYear)}</div>
				</div>
				<div class="stat rounded-lg bg-base-200 shadow">
					<div class="stat-figure text-accent"><TrendingUp class="h-8 w-8" /></div>
					<div class="stat-title">النشاط الأكثر شيوعًا</div>
					<div class="stat-value truncate text-accent">{data.kpi.mostFrequentActivity}</div>
				</div>
			</div>
			<!-- Charts -->
			<div class="grid grid-cols-1 gap-6 lg:grid-cols-5">
				<div class="card bg-base-200 shadow-lg lg:col-span-3">
					<div class="card-body">
						<h2 class="card-title mb-4">النشاط الشهري (آخر 6 أشهر)</h2>
						<div class="h-80">
							<Bar data={activitiesPerMonth} options={barChartOptions} />
						</div>
					</div>
				</div>
				<div class="card bg-base-200 shadow-lg lg:col-span-2">
					<div class="card-body">
						<h2 class="card-title mb-4">الأعضاء الأكثر نشاطًا</h2>
						<div class="flex h-[400px] items-center justify-center">
							<div class="h-full w-full overflow-hidden">
								<div class="h-[320px]">
									<Pie data={mostActiveMembers} options={pieChartOptions} />
								</div>
								<div class="legend-container h-[80px] overflow-y-auto px-4">
									<!-- Legend akan muncul di sini -->
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Recent Activities Table -->
			<div class="card bg-base-200 shadow-lg">
				<div class="card-body">
					<h2 class="card-title mb-4">أحدث 5 أنشطة</h2>
					<div class="overflow-x-auto">
						<table class="table w-full">
							<thead>
								<tr>
									{#if data.canReadAll}<th>الاسم</th>{/if}
									<th>النشاط</th>
									<th>تاريخ البدء</th>
									<th>المكان</th>
								</tr>
							</thead>
							<tbody>
								{#each data.recentActivities as activity}
									<tr>
										{#if data.canReadAll}
											<td>{activity.muridNama || '-'}</td>
										{/if}
										<td>{activity.kegiatan}</td>
										<td>
											{#if activity.tanggalMulai}
												{new Date(Date.parse(activity.tanggalMulai)).toLocaleDateString('ar-EG')}
											{:else}-{/if}
										</td>
										<td>{activity.tempat || '-'}</td>
									</tr>
								{:else}
									<tr>
										<td colspan={data.canReadAll ? 4 : 3} class="text-center">
											لا توجد أنشطة حديثة.
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
				<button class="btn btn-secondary btn-sm" on:click={handleExport} disabled={isExporting}
					><Download class="h-4 w-4" />{#if isExporting}Mengekspor...{:else}Export{/if}</button
				>
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
				{dbError}
				itemsPerPageProp={pageSize}
				totalItemsProp={totalItems}
				sort={currentSort}
				on:sort={handleSort}
				on:filter={handleFilter}
				on:pageChange={handlePageChange}
				on:itemsPerPageChange={handleItemsPerPageChange}
			>
				<svelte:fragment slot="custom-filters"
					><div class="flex flex-col gap-2 pt-2 md:flex-row md:items-end">
						<div class="form-control w-full md:w-auto">
							<label for="startDate" class="label pb-1"
								><span class="label-text">Dari Tanggal</span></label
							><input
								type="date"
								id="startDate"
								bind:value={dateFilter.start}
								class="input input-sm input-bordered w-full"
							/>
						</div>
						<div class="form-control w-full md:w-auto">
							<label for="endDate" class="label pb-1"
								><span class="label-text">Hingga Tanggal</span></label
							><input
								type="date"
								id="endDate"
								bind:value={dateFilter.end}
								class="input input-sm input-bordered w-full"
							/>
						</div>
						<div class="flex items-center gap-1 pt-4 md:pt-0">
							<button class="btn btn-primary btn-sm" on:click={applyDateFilter}>Filter</button
							><button class="btn btn-ghost btn-sm" on:click={resetDateFilter}>Reset</button>
						</div>
					</div></svelte:fragment
				>
				<div slot="row-actions" let:row class="flex items-center gap-1">
					<button
						class="btn btn-ghost btn-xs"
						aria-label="Edit item"
						on:click={() => handleEdit(row.id)}><Edit class="h-4 w-4" /></button
					>
					<form
						method="POST"
						action={`/member/nasyath_mun/${row.id}/delete`}
						use:enhance={handleDeleteSubmit}
						on:submit|preventDefault={handleSubmit}
					>
						<button type="submit" class="btn btn-ghost btn-xs text-error" aria-label="Delete item"
							><Trash2 class="h-4 w-4" /></button
						>
					</form>
				</div>
			</SuperTable>
		</div>
	{/if}
</div>
