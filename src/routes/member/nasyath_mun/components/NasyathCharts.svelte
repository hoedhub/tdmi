<script lang="ts">
	import BaseChart from '$lib/components/charts/BaseChart.svelte';
	import { barChartOptions, pieChartOptions } from '../config/chartConfig';
	import { TrendingUp, Users, MapPin, Calendar } from 'lucide-svelte';

	interface Props {
		activitiesPerMonth: any;
		mostActiveMembers: any;
		topPlaces: any;
		activitiesByDay: any;
	}

	let { activitiesPerMonth, mostActiveMembers, topPlaces, activitiesByDay }: Props = $props();

	let topPlacesOptions = $derived({
		...barChartOptions,
		indexAxis: 'y' as const
	});
</script>

<div class="grid grid-cols-1 gap-6 lg:grid-cols-12">
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

	<div class="card bg-base-100 shadow-md border border-base-200 lg:col-span-6">
		<div class="card-body p-4 sm:p-6">
			<h2 class="card-title text-base font-bold flex items-center gap-2 mb-4">
				<MapPin class="h-5 w-5 text-accent" />
				الأماكن الأكثر تكراراً
			</h2>
			<div class="h-64 sm:h-80">
				<BaseChart type="bar" data={topPlaces} options={topPlacesOptions} />
			</div>
		</div>
	</div>

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
