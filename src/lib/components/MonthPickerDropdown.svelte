<script lang="ts">
	import { absoluteDropdownStore } from '$lib/stores/absoluteDropdown';

	interface Props {
		initialDate?: Date;
		onChange?: (date: Date) => void;
	}

	let { initialDate = new Date(), onChange = () => {} }: Props = $props();

	let selectedDate = initialDate;
	let pickerYear = $state(selectedDate.getFullYear());

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
		<button class="btn btn-ghost btn-xs" onclick={decrementPickerYear}>◀</button>
		<span class="font-semibold">{pickerYear}</span>
		<button class="btn btn-ghost btn-xs" onclick={incrementPickerYear}>▶</button>
	</div>
	<div class="grid grid-cols-3 gap-1">
		{#each monthNames as month, i}
			<button
				class="btn btn-ghost btn-sm"
				class:btn-active={i === selectedDate.getMonth() &&
					pickerYear === selectedDate.getFullYear()}
				onclick={() => selectMonth(i)}
			>
				{month}
			</button>
		{/each}
	</div>
</div>
