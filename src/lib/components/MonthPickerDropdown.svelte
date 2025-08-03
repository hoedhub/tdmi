<script lang="ts">
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	export let initialDate: Date;
	export let onChange: (date: Date) => void;

	let selectedDate = initialDate;
	let pickerYear = selectedDate.getFullYear();

	const monthNames = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'Mei',
		'Jun',
		'Jul',
		'Agu',
		'Sep',
		'Okt',
		'Nov',
		'Des'
	];

	function selectMonth(monthIndex: number) {
		const newDate = new Date(pickerYear, monthIndex, 1);
		onChange(newDate);
		absoluteDropdownStore.close();
	}

	function incrementPickerYear() {
		pickerYear++;
	}

	function decrementPickerYear() {
		pickerYear--;
	}
</script>

<div class="p-2">
	<div class="flex items-center justify-between pb-2">
		<button class="btn btn-ghost btn-xs" on:click={decrementPickerYear}>◀</button>
		<span class="font-semibold">{pickerYear}</span>
		<button class="btn btn-ghost btn-xs" on:click={incrementPickerYear}>▶</button>
	</div>
	<div class="grid grid-cols-3 gap-1">
		{#each monthNames as month, i}
			<button
				class="btn btn-sm btn-ghost"
				class:btn-active={i === selectedDate.getMonth() && pickerYear === selectedDate.getFullYear()}
				on:click={() => selectMonth(i)}
			>
				{month}
			</button>
		{/each}
	</div>
</div>
