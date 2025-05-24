<!-- src/lib/components/toast/ToastContainer.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing'; // A nice easing function

	import Toast from './Toast.svelte';
	import { toastStore, _setMaxToasts } from './toastStore'; // _setMaxToasts is for internal sync
	import type { ToastPosition, ToastContainerProps } from './types';

	/**
	 * Position of the toast container on the screen.
	 * @default 'top-right'
	 */
	export let position: ToastPosition = 'top-right';

	/**
	 * Maximum number of toasts to display at once.
	 * This value is also passed to the toastStore.
	 * @default 5
	 */
	export let maxToasts: number = 5;

	/**
	 * DaisyUI gap class (e.g., 'gap-2', 'gap-4') or any valid CSS gap value
	 * for spacing between toasts within the container.
	 * @default 'gap-2'
	 */
	export let spacing: string = 'gap-2';

	/**
	 * The HTML element tag to use for the main container element.
	 * @default 'div'
	 */
	export let containerElementTag: ToastContainerProps['containerElementTag'] = 'div';

	/**
	 * Custom CSS class(es) to apply to the toast container element itself.
	 */
	export let customClass: string = '';

	// Reactive statement to update the store's maxToasts if the prop changes
	$: _setMaxToasts(maxToasts);

	// Subscribe to the toast store
	const toasts = toastStore; // This is the readable store

	// --- Positioning Logic ---
	let positionClasses = '';
	// Map abstract position to DaisyUI toast classes or custom fixed positioning
	$: {
		// Default to fixed positioning as DaisyUI toast classes are sometimes limiting for dynamic content
		let basePositioning = 'fixed z-[9999] p-4 flex'; // High z-index, padding, flex display
		// DaisyUI specific classes can also be used: `toast`
		// e.g. `basePositioning = 'toast z-[9999]';`

		switch (position) {
			case 'top-left':
				positionClasses = `${basePositioning} top-0 left-0 flex-col items-start`;
				// DaisyUI: `toast-top toast-start`
				break;
			case 'top-center':
				positionClasses = `${basePositioning} top-0 left-1/2 -translate-x-1/2 flex-col items-center`;
				// DaisyUI: `toast-top toast-center`
				break;
			case 'top-right':
				positionClasses = `${basePositioning} top-0 right-0 flex-col items-end`;
				// DaisyUI: `toast-top toast-end`
				break;
			case 'bottom-left':
				positionClasses = `${basePositioning} bottom-0 left-0 flex-col-reverse items-start`; // col-reverse for newest at bottom
				// DaisyUI: `toast-bottom toast-start`
				break;
			case 'bottom-center':
				positionClasses = `${basePositioning} bottom-0 left-1/2 -translate-x-1/2 flex-col-reverse items-center`;
				// DaisyUI: `toast-bottom toast-center`
				break;
			case 'bottom-right':
				positionClasses = `${basePositioning} bottom-0 right-0 flex-col-reverse items-end`;
				// DaisyUI: `toast-bottom toast-end`
				break;
			default: // Default to top-right
				positionClasses = `${basePositioning} top-0 right-0 flex-col items-end`;
		}
		// If using DaisyUI parent 'toast' class, the children don't need flex-col etc.
		// It would be `positionClasses = 'toast z-[9999] ' + daisyPositionClass;`
	}

	// Transition parameters based on position
	let transitionParams: {
		x?: number;
		y?: number;
		duration: number;
		easing: (t: number) => number;
	} = { y: -30, duration: 300, easing: quintOut }; // Default for top positions
	$: {
		if (position.startsWith('bottom-')) {
			transitionParams = { y: 30, duration: 300, easing: quintOut };
		} else if (position.includes('-left')) {
			transitionParams = { x: -30, duration: 300, easing: quintOut };
		} else if (position.includes('-right')) {
			transitionParams = { x: 30, duration: 300, easing: quintOut };
		} else {
			// top-center or other new positions
			transitionParams = { y: -30, duration: 300, easing: quintOut };
		}
	}
</script>

{#if $toasts && $toasts.length > 0}
	<svelte:element
		this={containerElementTag}
		class="{positionClasses} {spacing} {customClass}"
		role="region"
		aria-live="polite"
		aria-label="Notifications"
	>
		{#each $toasts as toast (toast.id)}
			<div
				class="toast-item w-full max-w-md"
				in:fly={transitionParams}
				out:fly={{ ...transitionParams, duration: 200 }}
			>
				<!-- Pass all properties of the toast message object to Toast.svelte -->
				<Toast {...toast} />
			</div>
		{/each}
	</svelte:element>
{/if}

<style>
	/* Add any global styles for the container if needed, e.g., pointer-events */
	/*
  .toast-item {
     max-width: 350px; /* Or as a prop */
	/* }
  */

	/*
    If NOT using DaisyUI's `toast` parent class and instead using fixed positioning directly,
    you might need to manage flex-direction for stacking:

    For top positions: new toasts appear at the top.
    The `toastStore` adds new toasts to the beginning of the array.
    `flex-direction: column;` (default for flex-col) means the first item in DOM is at the top.

    For bottom positions: new toasts appear at the bottom (visually top of the stack).
    The `toastStore` adds new toasts to the beginning of the array.
    `flex-direction: column-reverse;` means the first item in DOM is at the bottom.
  */
</style>
