<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	// Optionally import debounce utility from utils.ts later
	import { debounce } from './utils';

	interface Props {
		initialGlobalFilter?: string;
		debounceDelay?: number; // Delay in ms for debouncing filter input
		// Props for other filter types can be added here later
	}

	const {
		initialGlobalFilter = '',
		debounceDelay = 300 // Default debounce time
	}: Props = $props();

	const dispatch = createEventDispatcher<{
		filterChange: { global?: string; [key: string]: any };
	}>();

	// --- State ---
	let localGlobalFilter = $state(initialGlobalFilter);
	let debouncedGlobalFilter = $state(initialGlobalFilter);

	// --- Effects ---

	// Debounce the global filter input
	$effect(() => {
		// Capture the current value to avoid closure issues with timeout
		const currentFilterValue = localGlobalFilter;
		const handler = setTimeout(() => {
			if (currentFilterValue !== debouncedGlobalFilter) {
				debouncedGlobalFilter = currentFilterValue; // Update debounced state
				dispatch('filterChange', { global: currentFilterValue });
			}
		}, debounceDelay);

		// Cleanup function to clear timeout if input changes again quickly
		return () => {
			clearTimeout(handler);
		};
	});

	// Sync initial prop changes (might be less common for filter bar)
	$effect(() => {
		if (
			initialGlobalFilter !== localGlobalFilter &&
			initialGlobalFilter !== debouncedGlobalFilter
		) {
			localGlobalFilter = initialGlobalFilter;
			// Optionally trigger dispatch immediately if needed, or let debounce handle it
			debouncedGlobalFilter = initialGlobalFilter;
			dispatch('filterChange', { global: initialGlobalFilter });
		}
	});
</script>

<div class="filter-bar-component flex flex-wrap items-center gap-4">
	<!-- Global Search Input -->
	<label class="input input-bordered input-sm flex flex-grow items-center gap-2 sm:flex-grow-0">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			fill="currentColor"
			class="h-4 w-4 opacity-70"
			><path
				fill-rule="evenodd"
				d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
				clip-rule="evenodd"
			/></svg
		>
		<input
			type="text"
			class="grow"
			placeholder="Search table..."
			bind:value={localGlobalFilter}
			aria-label="Search table data"
		/>
		{#if localGlobalFilter}
			<!-- Clear button -->
			<button
				class="btn btn-ghost btn-xs btn-circle"
				onclick={() => {
					localGlobalFilter = '';
				}}
				aria-label="Clear search"
			>
				✕ <!-- Simple X -->
			</button>
		{/if}
	</label>

	<!-- Placeholder for other filter controls -->
	<!-- Example: Status filter dropdown -->

	<select class="select select-bordered select-sm">
		<option disabled selected>Status</option>
		<option>Active</option>
		<option>Inactive</option>
		<option>Pending</option>
	</select>
</div>

<style>
	/* Component-specific styles */
</style>
