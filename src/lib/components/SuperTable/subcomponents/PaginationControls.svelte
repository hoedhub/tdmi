<!-- PaginationControls.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';
	import { generatePageNumbers } from '../features/pagination';

	export let currentPage: number;
	export let totalPages: number;
	export let itemsPerPage: number;
	export let totalItems: number;

	const dispatch = createEventDispatcher();

	$: pages = generatePageNumbers(currentPage, totalPages);
	$: startItem = (currentPage - 1) * itemsPerPage + 1;
	$: endItem = Math.min(currentPage * itemsPerPage, totalItems);

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			dispatch('pageChange', page);
		}
	}
</script>

<div
	class="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
	role="navigation"
	aria-label="Pagination"
>
	<div class="text-sm text-base-content/70" aria-live="polite">
		Showing {#if totalItems >= 1}<b>{startItem}-{endItem}</b> of
		{/if}<b>{totalItems}</b> items
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-4 sm:w-auto sm:justify-end">
		<div class="join" role="group" aria-label="Pagination controls">
			<!-- Previous page -->
			<button
				class="btn join-item btn-sm {currentPage === 1 ? 'btn-disabled' : ''}"
				on:click={() => goToPage(currentPage - 1)}
				disabled={currentPage === 1}
				aria-label="Previous page"
			>
				<ChevronLeft size={16} />
			</button>

			<!-- Page numbers -->
			{#each pages as page}
				{#if page === '...'}
					<button class="btn btn-disabled join-item btn-sm">...</button>
				{:else}
					<button
						class="btn join-item btn-sm {page === currentPage ? 'btn-active' : ''}"
						on:click={() => goToPage(page)}
						aria-label={`Page ${page}`}
						aria-current={page === currentPage ? 'page' : undefined}
					>
						{page}
					</button>
				{/if}
			{/each}

			<!-- Next page -->
			<button
				class="btn join-item btn-sm {currentPage === totalPages ? 'btn-disabled' : ''}"
				on:click={() => goToPage(currentPage + 1)}
				disabled={currentPage === totalPages}
				aria-label="Next page"
			>
				<ChevronRight size={16} />
			</button>
		</div>

		<div class="flex items-center gap-2">
			<span class="text-sm text-base-content/70">Items per page:</span>
			<select
				class="select select-bordered select-sm"
				value={itemsPerPage}
				aria-label="Items per page"
				on:change={(e) => dispatch('itemsPerPageChange', parseInt(e.currentTarget.value))}
			>
				<option value={5}>5</option>
				<option value={10}>10</option>
				<option value={25}>25</option>
				<option value={50}>50</option>
				<option value={100}>100</option>
			</select>
		</div>
	</div>
</div>
