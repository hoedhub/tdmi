<!-- FilterInput.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Search, X } from 'lucide-svelte';

	interface Props {
		value?: string;
		placeholder?: string;
		id?: string;
		label?: string;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		id = 'filter-input',
		label = 'Search'
	}: Props = $props();

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
		oninput={handleInput}
		role="searchbox"
	/>

	{#if value}
		<button
			type="button"
			class="absolute inset-y-0 right-0 flex items-center px-2 opacity-50 hover:opacity-100"
			onclick={clearInput}
			aria-label="Clear search"
		>
			<X size={16} />
		</button>
	{/if}
</div>
