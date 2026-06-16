<script lang="ts">
	import { toHindi } from '$lib/utils/toHindi';
	import { Calendar, MapPin, Clock } from 'lucide-svelte';

	interface Props {
		activities: {
			id: number;
			kegiatan: string;
			tanggalMulai: string | null;
			tempat: string | null;
			muridNama: string | null;
		}[];
		canReadAll: boolean;
	}

	let { activities, canReadAll }: Props = $props();

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return toHindi(new Date(Date.parse(dateStr)).toLocaleDateString('ar-EG'));
	}
</script>

<div class="card bg-base-100 shadow-md border border-base-200">
	<div class="card-body p-0">
		<div class="p-4 sm:p-6 border-b border-base-200 flex items-center justify-between">
			<h2 class="card-title text-base font-bold flex items-center gap-2">
				<Clock class="h-5 w-5 text-info" />
				أحدث الأنشطة المسجلة
			</h2>
			<div class="badge badge-outline">{toHindi(activities.length)} أنشطة</div>
		</div>
		<div class="overflow-x-auto">
			<table class="table table-zebra w-full">
				<thead>
					<tr class="bg-base-200/50">
						{#if canReadAll}<th class="text-xs uppercase">العضو</th>{/if}
						<th class="text-xs uppercase">النشاط</th>
						<th class="text-xs uppercase">تاريخ البدء</th>
						<th class="text-xs uppercase">المكان</th>
					</tr>
				</thead>
				<tbody class="text-sm">
					{#each activities as activity}
						<tr class="hover">
							{#if canReadAll}
								<td class="font-medium text-primary">{activity.muridNama || '-'}</td>
							{/if}
							<td class="font-medium">{activity.kegiatan}</td>
							<td>
								{#if activity.tanggalMulai}
									<div class="flex items-center gap-2">
										<Calendar class="h-3.5 w-3.5 opacity-50" />
										{formatDate(activity.tanggalMulai)}
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
							<td colspan={canReadAll ? 4 : 3} class="text-center py-8 opacity-50 italic">
								لا توجد أنشطة حديثة متاحة لهذا النطاق.
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</div>
