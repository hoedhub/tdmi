<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		pageSize: number;
		totalItems: number;
		pageSizeOptions?: number[]; // Optional array of page size choices
	}

	const {
		currentPage,
		totalPages,
		pageSize,
		totalItems,
		pageSizeOptions = [10, 25, 50, 100] // Default page size options
	}: Props = $props();

	const dispatch = createEventDispatcher<{ pageChange: number; pageSizeChange: number }>();

	// --- Derived values for display (still using $derived here is fine) ---
	let startItem = $derived(totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1);
	let endItem = $derived(Math.min(currentPage * pageSize, totalItems));

	// --- Logic for Page Number Buttons (using $effect) ---

	const maxVisiblePages = 7; // Max number of page buttons to show (incl. ellipsis)

	// **FIX:** Use a regular variable for the array to iterate over
	let pageNumbers: (number | '...')[] = $state([]); // Use $state for reactivity in the template

	// **FIX:** Use $effect to calculate and update the array when dependencies change
	$effect(() => {
		const currentTotalPages = totalPages; // Capture reactive props
		const currentVisiblePage = currentPage;

		if (currentTotalPages <= 0) {
			pageNumbers = []; // Reset if no pages
			return;
		}

		if (currentTotalPages <= maxVisiblePages) {
			// Show all pages if total is small enough
			pageNumbers = Array.from({ length: currentTotalPages }, (_, i) => i + 1);
			return; // Exit early
		}

		// Calculate pages with ellipsis
		const pages: (number | '...')[] = [];
		const halfVisible = Math.floor((maxVisiblePages - 2) / 2);

		pages.push(1);

		if (currentVisiblePage > halfVisible + 2) {
			pages.push('...');
		}

		let startPage = Math.max(2, currentVisiblePage - halfVisible);
		let endPage = Math.min(currentTotalPages - 1, currentVisiblePage + halfVisible);

		if (currentVisiblePage <= halfVisible + 2) {
			endPage = Math.max(startPage, maxVisiblePages - 2);
		}
		if (currentVisiblePage >= currentTotalPages - halfVisible - 1) {
			startPage = Math.min(endPage, currentTotalPages - maxVisiblePages + 3);
		}

		for (let i = startPage; i <= endPage; i++) {
			pages.push(i);
		}

		if (currentVisiblePage < currentTotalPages - halfVisible - 1) {
			pages.push('...');
		}

		pages.push(currentTotalPages);

		pageNumbers = pages; // Assign the calculated array
	});

	// --- Event Handlers ---

	function goToPage(page: number | '...') {
		// Type should now be correct from the array type
		if (typeof page === 'number' && page !== currentPage && page >= 1 && page <= totalPages) {
			dispatch('pageChange', page);
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			dispatch('pageChange', currentPage - 1);
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			dispatch('pageChange', currentPage + 1);
		}
	}

	function handlePageSizeChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		dispatch('pageSizeChange', Number(target.value));
	}
</script>

<div class="flex flex-wrap items-center justify-between gap-4 p-2 text-sm">
	<!-- Info Text -->
	<div class="opacity-80">
		{#if totalItems > 0}
			Showing {startItem} - {endItem} of {totalItems} items
		{:else}
			No items
		{/if}
	</div>

	<div class="flex flex-wrap items-center gap-4">
		<!-- Page Size Selector -->
		{#if pageSizeOptions.length > 0}
			<div class="flex items-center">
				<label for="pageSizeSelect" class="mr-2 whitespace-nowrap opacity-80">Items per page:</label
				>
				<select
					id="pageSizeSelect"
					class="select select-xs !py-0"
					aria-label="Select page size"
					value={pageSize}
					onchange={handlePageSizeChange}
				>
					{#each pageSizeOptions as size (size)}
						<option value={size}>{size}</option>
					{/each}
				</select>
			</div>
		{/if}

		<!-- Pagination Buttons -->
		{#if totalPages > 1}
			<div class="join">
				<!-- Previous Button -->
				<button
					type="button"
					class="join-item btn btn-sm"
					disabled={currentPage === 1}
					onclick={previousPage}
					aria-label="Go to previous page"
				>
					«
				</button>

				<!-- Page Number Buttons -->
				<!-- Iterate over the state variable holding the array value -->
				{#each pageNumbers as page (page === '...' ? Math.random() : page)}
					{#if page === '...'}
						<button type="button" class="join-item btn btn-sm btn-disabled" aria-hidden="true"
							>...</button
						>
					{:else}
						<button
							type="button"
							class="join-item btn btn-sm"
							class:btn-active={currentPage === page}
							onclick={() => goToPage(page)}
							aria-label={`Go to page ${page}`}
							aria-current={currentPage === page ? 'page' : undefined}
						>
							{page}
						</button>
					{/if}
				{/each}

				<!-- Next Button -->
				<button
					type="button"
					class="join-item btn btn-sm"
					disabled={currentPage === totalPages}
					onclick={nextPage}
					aria-label="Go to next page"
				>
					»
				</button>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Add any specific styles if DaisyUI defaults aren't sufficient */
</style>
