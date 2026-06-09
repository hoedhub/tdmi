<script lang="ts">
	import { stopPropagation } from 'svelte/legacy';
	import { fade } from 'svelte/transition';
	import { SuperTable } from '$lib/components/SuperTable';
	import type { ColumnDef, SortConfig, FilterState } from '$lib/components/SuperTable';
	import { Pen, Trash } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	interface Props {
		muridData: any[];
		columns: ColumnDef<any>[];
		pageSize: number;
		currentPage: number;
		totalItems: number;
		loading: boolean;
		currentSort: SortConfig[];
		currentFilters: FilterState;
		canWriteMurid: boolean;
		isNavigating: boolean;
		onsort: (sort: SortConfig[] | null) => void;
		onfilter: (filters: FilterState) => void;
		onpageChange: (page: number) => void;
		onitemsPerPageChange: (pageSize: number) => void;
		ondelete: (id: number, name: string) => void;
		oneditSelected: () => void;
		selectedMuridIds: number[];
		onselectionChange: (ids: number[]) => void;
	}

	let {
		muridData,
		columns,
		pageSize = $bindable(),
		currentPage = $bindable(),
		totalItems,
		loading,
		currentSort = $bindable(),
		currentFilters = $bindable(),
		canWriteMurid,
		isNavigating,
		onsort,
		onfilter,
		onpageChange,
		onitemsPerPageChange,
		ondelete,
		oneditSelected,
		selectedMuridIds,
		onselectionChange
	}: Props = $props();
</script>

<div in:fade={{ duration: 200 }}>
	<SuperTable
		data={muridData}
		{columns}
		rowKey="id"
		bind:itemsPerPageProp={pageSize}
		bind:currentPageProp={currentPage}
		totalItemsProp={totalItems}
		isLoadingProp={loading}
		bind:sort={currentSort}
		serverSide={true}
		bind:filterStateProp={currentFilters}
		{onsort}
		{onfilter}
		{onpageChange}
		{onitemsPerPageChange}
		onrowClick={(row) => {
			goto(`/member/pendataan/${row.id}`);
		}}
		{onselectionChange}
		tableClass={isNavigating
			? 'blur-sm grayscale opacity-50 pointer-events-none transition-all duration-300'
			: 'transition-all duration-300'}
	>
		{#snippet bulkActions({ selectedIds })}
			{#if canWriteMurid && selectedIds.length === 1}
				<button class="btn btn-secondary btn-sm" onclick={oneditSelected}>
					<Pen class="h-4 w-4" />
					Edit Selected
				</button>
			{/if}
		{/snippet}

		{#snippet loadingState()}
			<div class="p-8 text-center">
				<span class="loading loading-spinner mb-4"></span>
				<p class="text-lg font-semibold">Memuat data...</p>
				<p class="text-sm text-base-content/70">Harap tunggu sebentar.</p>
			</div>
		{/snippet}

		{#snippet rowActions({ row })}
			{#if canWriteMurid}
				<div class="flex gap-2">
					<a
						href={`/member/pendataan/${row.id}/edit?from=table`}
						class="btn btn-ghost btn-sm"
						onclick={stopPropagation(() => {})}
					>
						<Pen class="h-4 w-4" />
					</a>
					<button
						class="btn btn-ghost btn-sm text-error"
						onclick={stopPropagation(() => ondelete(row.id, row.nama))}
					>
						<Trash class="h-4 w-4" />
					</button>
				</div>
			{/if}
		{/snippet}
	</SuperTable>
</div>
