<script lang="ts">
	import '../app.css';
	import { ToastContainer } from '$lib/components/toast';
	import AbsoluteDropdown from '$lib/components/AbsoluteDropdown.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
</script>

<AbsoluteDropdown />
<Tooltip />
<slot></slot>

<ToastContainer position="bottom-center" />
