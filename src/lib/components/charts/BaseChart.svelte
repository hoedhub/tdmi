<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		Chart,
		type ChartConfiguration,
		type ChartType,
		registerables
	} from 'chart.js';

	Chart.register(...registerables);

	interface Props {
		type: ChartType;
		data: any;
		options?: any;
		class?: string;
	}

	let { type, data, options = {}, class: className = '' }: Props = $props();

	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined;

	// Update chart when data or options change
	$effect(() => {
		if (chart) {
			chart.data = data;
			chart.options = {
				...options,
				responsive: true,
				maintainAspectRatio: false
			};
			chart.update('none'); // Update without animation for smoother feel if data changes frequently
		}
	});

	onMount(() => {
		if (canvas) {
			chart = new Chart(canvas, {
				type,
				data,
				options: {
					...options,
					responsive: true,
					maintainAspectRatio: false
				}
			});
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
		}
	});
</script>

<div class="relative h-full w-full {className}">
	<canvas bind:this={canvas}></canvas>
</div>
