<script lang="ts">
	import type { PageData } from './$types';
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
	import { Calendar, TrendingUp, Eye, Users } from 'lucide-svelte';
	import { toHindi } from '$lib/utils/toHindi';

	export let data: PageData;

	// Register Chart.js components
	ChartJS.register(
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		ArcElement
	);

	// --- Prepare data for Bar Chart (Activities per Month) ---
	const activitiesPerMonth = {
		labels: data.charts.activitiesPerMonth.map((item) => {
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

	// --- **LOGIKA BARU PIE CHART** (Most Active Members) ---
	$: mostActiveMembers = {
		labels: data.charts.mostActiveMembers.map((item) => item.muridName || 'Tanpa Nama'),
		datasets: [
			{
				data: data.charts.mostActiveMembers.map((item) => item.activityCount),
				backgroundColor: [
					'rgba(255, 99, 132, 0.7)',
					'rgba(54, 162, 235, 0.7)',
					'rgba(255, 206, 86, 0.7)',
					'rgba(75, 192, 192, 0.7)',
					'rgba(153, 102, 255, 0.7)',
					'rgba(255, 159, 64, 0.7)',
					'rgba(199, 199, 199, 0.7)'
				],
				hoverOffset: 4
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				position: 'top' as const
			}
		}
	};
</script>

<div class="container mx-auto p-4" dir="rtl">
	<!-- Header -->
	<div class="mb-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
		<h1 class="text-2xl font-bold">لوحة معلومات النشاط</h1>
		<a href="/member/nasyath_mun/data" class="btn btn-outline btn-sm">
			<Eye class="h-4 w-4" /> عرض كل البيانات
		</a>
	</div>

	<!-- KPI Cards -->
	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<div class="stat bg-base-200 rounded-lg shadow">
			<div class="stat-figure text-primary"><Calendar class="h-8 w-8" /></div>
			<div class="stat-title">نشاط هذا الشهر</div>
			<div class="stat-value text-primary">{toHindi(data.kpi.totalThisMonth)}</div>
		</div>
		<div class="stat bg-base-200 rounded-lg shadow">
			<div class="stat-figure text-secondary"><Calendar class="h-8 w-8" /></div>
			<div class="stat-title">نشاط هذا العام</div>
			<div class="stat-value text-secondary">{toHindi(data.kpi.totalThisYear)}</div>
		</div>
		<div class="stat bg-base-200 rounded-lg shadow">
			<div class="stat-figure text-accent"><TrendingUp class="h-8 w-8" /></div>
			<div class="stat-title">النشاط الأكثر شيوعًا</div>
			<div class="stat-value text-accent truncate">{data.kpi.mostFrequentActivity}</div>
		</div>
	</div>

	<!-- Charts -->
	<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-5">
		<div class="card bg-base-200 shadow-lg lg:col-span-3">
			<div class="card-body">
				<h2 class="card-title">النشاط الشهري (آخر 6 أشهر)</h2>
				<div class="h-64">
					<Bar data={activitiesPerMonth} options={chartOptions} />
				</div>
			</div>
		</div>
		<div class="card bg-base-200 shadow-lg lg:col-span-2">
			<div class="card-body">
				<h2 class="card-title">الأعضاء الأكثر نشاطًا</h2>
				{#if data.canReadAll}
					<div class="h-64">
						<Pie data={mostActiveMembers} options={chartOptions} />
					</div>
				{:else}
					<div class="flex h-full flex-col items-center justify-center text-center">
						<Users class="h-12 w-12 text-base-content/30" />
						<p class="mt-2 text-sm text-base-content/60">
							Tampilan ini hanya tersedia untuk admin.
						</p>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Recent Activities Table -->
	<div class="card bg-base-200 shadow-lg mt-6">
		<div class="card-body">
			<h2 class="card-title mb-4">أحدث 5 أنشطة</h2>
			<div class="overflow-x-auto">
				<table class="table w-full">
					<thead>
						<tr>
							<th>النشاط</th>
							<th>تاريخ البدء</th>
							<th>المكان</th>
						</tr>
					</thead>
					<tbody>
						{#each data.recentActivities as activity}
							<tr>
								<td>{activity.kegiatan}</td>
								<td>
									{#if activity.tanggalMulai}
										{new Date(activity.tanggalMulai).toLocaleDateString('ar-EG')}
									{:else}
										-
									{/if}
								</td>
								<td>{activity.tempat || '-'}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="3" class="text-center">لا توجد أنشطة حديثة.</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>