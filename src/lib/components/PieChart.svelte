<script lang="ts">
    import { Pie, getElementAtEvent } from 'svelte-chartjs';
    import {
        Chart as ChartJS,
        Title,
        Tooltip,
        Legend,
        ArcElement,
        CategoryScale
    } from 'chart.js';

    export let data: any;
    export let options: any;

    ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);
</script>

{#if data && data.datasets[0].data.length > 0}
    <Pie {data} {options} />
{/if}
