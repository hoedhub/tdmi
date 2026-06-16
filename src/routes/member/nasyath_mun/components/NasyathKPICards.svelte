<script lang="ts">
	import { Calendar, UserCheck, Route, Clock } from 'lucide-svelte';
	import { toHindi } from '$lib/utils/toHindi';

	interface Props {
		totalThisMonth: number;
		totalThisYear: number;
		kpiTitle: string;
		uniqueMuridCount: number;
		totalJarak: number;
		avgDurasi: number;
	}

	let { totalThisMonth, totalThisYear, kpiTitle, uniqueMuridCount, totalJarak, avgDurasi }: Props = $props();
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
		<div class="stat-figure text-primary"><Calendar class="h-8 w-8 opacity-20" /></div>
		<div class="stat-title text-xs font-bold uppercase tracking-wider">{kpiTitle}</div>
		<div class="stat-value text-primary text-3xl">{toHindi(totalThisMonth)}</div>
		<div class="stat-desc text-xs mt-1">من إجمالي {toHindi(totalThisYear)} هذا العام</div>
	</div>

	<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
		<div class="stat-figure text-secondary"><UserCheck class="h-8 w-8 opacity-20" /></div>
		<div class="stat-title text-xs font-bold uppercase tracking-wider">الأعضاء المشاركون</div>
		<div class="stat-value text-secondary text-3xl">{toHindi(uniqueMuridCount)}</div>
		<div class="stat-desc text-xs mt-1">عضو نشط في هذه الفترة</div>
	</div>

	<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
		<div class="stat-figure text-accent"><Route class="h-8 w-8 opacity-20" /></div>
		<div class="stat-title text-xs font-bold uppercase tracking-wider">إجمالي المسافة</div>
		<div class="stat-value text-accent text-3xl">{toHindi(totalJarak)} <span class="text-sm font-normal">كم</span></div>
		<div class="stat-desc text-xs mt-1">المسافة المقطوعة للأنشطة</div>
	</div>

	<div class="stat rounded-xl bg-base-100 shadow-md border border-base-200">
		<div class="stat-figure text-warning"><Clock class="h-8 w-8 opacity-20" /></div>
		<div class="stat-title text-xs font-bold uppercase tracking-wider">متوسط المدة</div>
		<div class="stat-value text-warning text-3xl">{toHindi(avgDurasi)} <span class="text-sm font-normal">ساعة</span></div>
		<div class="stat-desc text-xs mt-1">لكل نشاط في المتوسط</div>
	</div>
</div>
