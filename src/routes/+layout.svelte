<script lang="ts">
	import '../app.css';
	import SidebarLayout from '$lib/components/SidebarLayout.svelte';
	// For non-SvelteKit, adjust path: import SidebarLayout from './components/SidebarLayout.svelte';

	// Example of different content for different pages
	let pageTitle = 'Dashboard Overview';
	let cardData = [
		{ title: 'Total Users', value: '1,250', change: '+5%', color: 'bg-primary' },
		{ title: 'Revenue', value: '$15,670', change: '+2.1%', color: 'bg-secondary' },
		{ title: 'New Orders', value: '340', change: '-1.5%', color: 'bg-accent' },
		{ title: 'Pending Tasks', value: '12', change: '+0', color: 'bg-info' }
	];
</script>

<SidebarLayout>
	<div slot="main-content">
		<slot></slot>
	</div>
</SidebarLayout>
