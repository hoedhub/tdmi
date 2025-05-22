<script lang="ts">
	interface Props {
		value: number; // The raw cell value (balance)
		// rowData?: any; // You can receive the full row data if needed
		// column?: any; // You can receive the column definition if needed
	}
	const { value }: Props = $props();

	const colorClass = value >= 0 ? 'text-success' : 'text-error';
	const formattedValue = value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
</script>

<span class="{colorClass} font-medium">{formattedValue}</span>
