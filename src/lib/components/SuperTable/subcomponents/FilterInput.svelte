<!-- FilterInput.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, X } from 'lucide-svelte';

	export let value = '';
	export let placeholder = 'Search...';
	export let id = 'filter-input';
	export let label = 'Search';

	const dispatch = createEventDispatcher();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		dispatch('input', value);
	}

	function clearInput() {
		value = '';
		dispatch('input', '');
	}
</script>

<div class="relative">
	<span class="absolute inset-y-0 left-0 flex items-center pl-2 opacity-50">
		<Search size={16} />
	</span>

	<input
		{id}
		type="text"
		class="input input-sm input-bordered w-full pl-8 pr-8"
		{placeholder}
		{value}
		aria-label={label}
		on:input={handleInput}
		role="searchbox"
	/>

	{#if value}
		<button
			class="absolute inset-y-0 right-0 flex items-center pr-2 opacity-50 hover:opacity-100"
			on:click={clearInput}
			aria-label="Clear search"
		>
			<X size={16} />
		</button>
	{/if}
</div>
