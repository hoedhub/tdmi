<!-- src/lib/components/toast/ToastContainer.svelte -->
<script lang="ts">
	import ToastComponent from './Toast.svelte';
	import { toast } from './toast.service.svelte'; // Adjust path as necessary

	// Optional: Define this type in your toast.service.ts for better sharing
	type ToastPosition =
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'middle-left'
		| 'middle-center'
		| 'middle-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right';

	// --- Props ---
	let {
		position = 'bottom-right', // Sensible default, often used for notifications
		class: containerClass = '' // Allow passing additional custom classes
	}: {
		position?: ToastPosition;
		class?: string;
	} = $props();

	// --- Derived State ---
	// Calculate the appropriate DaisyUI positioning classes based on the prop
	const positionClasses = $derived(() => {
		switch (position) {
			case 'top-left':
				return 'toast-start toast-top';
			case 'top-center':
				return 'toast-center toast-top';
			case 'top-right':
				return 'toast-end toast-top';
			case 'middle-left':
				return 'toast-start toast-middle';
			case 'middle-center':
				return 'toast-center toast-middle';
			case 'middle-right':
				return 'toast-end toast-middle';
			case 'bottom-left':
				return 'toast-start toast-bottom';
			case 'bottom-center':
				return 'toast-center toast-bottom';
			case 'bottom-right':
				return 'toast-end toast-bottom';
			default:
				console.warn(`Invalid toast position: ${position}. Defaulting to bottom-right.`);
				return 'toast-end toast-bottom'; // Fallback to default
		}
	});

	// Access the reactive list of toasts from the service
	const activeToasts = $derived(toast.list);
</script>

<!--
  The main container element.
  - `toast`: Base DaisyUI class for the container.
  - `{positionClasses}`: Applies dynamic positioning based on the prop.
  - `{containerClass}`: Allows users to add custom styling.
  - `z-50`: High z-index to ensure toasts appear above most other content.
-->
<div class="toast {positionClasses} {containerClass} fixed z-50">
	{#each activeToasts as toastItem (toastItem.id)}
		<!--
      Render the individual Toast component for each item in the list.
      - `toastItem.id` is used as the key for Svelte's keyed each block,
        ensuring efficient updates and correct transition handling.
      - `{...toastItem}` spreads all properties from the toastItem object
        (like id, type, content, _dismiss, etc.) as individual props
        into the ToastComponent.
    -->
		<ToastComponent {...toastItem} />
	{/each}
</div>

<!-- No <style> block is typically needed here unless you want to add
     very specific styles *only* to the container itself, beyond what
     Tailwind/DaisyUI and the passed `containerClass` prop provide. -->
