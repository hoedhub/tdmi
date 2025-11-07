<script lang="ts">
	import { Pie, getElementAtEvent } from 'svelte-chartjs';
	import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';

	interface Props {
		data: any;
		options: any;
	}

	let { data, options }: Props = $props();

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
</script>

{#if data && data.datasets[0].data.length > 0}
	<Pie {data} {options} />
{/if}
