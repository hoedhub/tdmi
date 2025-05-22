<!-- src/lib/components/toast/Toast.svelte -->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import {
		Info,
		CheckCircle,
		AlertTriangle,
		XCircle,
		LoaderCircle, // Using LoaderCircle for a potentially looping loading icon
		X
	} from 'lucide-svelte';

	// Assuming these types are defined in your service file (e.g., src/lib/toast.service.ts)
	// You might need to adjust the import path
	import type { ToastOptions, ToastAction } from './toast.service.svelte';

	// --- Props ---
	// Get all props defined in ToastOptions, plus the essential _dismiss function
	// Default values are set here.
	let {
		id,
		type = 'info',
		title = undefined,
		content = '',
		icon = undefined, // Allow overriding the default icon
		duration = 5000, // Default 5 seconds
		persistent = false,
		actions = [],
		pauseOnHover = true,
		onClose = () => {}, // No-op default callback
		_dismiss // Passed from the ToastContainer/Service - REQUIRED
	}: ToastOptions & { _dismiss: (id: string | number) => void } = $props();

	// --- Internal State ---
	let hostElement = $state<HTMLElement>(); // Reference to the host element for potential future use
	let remaining = $state(duration); // Time remaining for dismissal timer
	let paused = $state(false); // Is the timer currently paused (e.g., on hover)
	let startTime = $state(performance.now()); // Track when the timer effect starts/resumes

	// --- Derived State ---
	const isPersistent = $derived(persistent || duration <= 0);

	// Map toast type to DaisyUI alert classes
	const alertClasses = $derived(
		{
			info: 'alert-info',
			success: 'alert-success',
			warning: 'alert-warning',
			error: 'alert-error',
			loading: 'alert-info' // Use info style for loading, or create a custom one
		}[type] || 'alert-info' // Default fallback
	);

	// Map toast type to default Lucide icons
	const DefaultIcon = $derived(
		{
			info: Info,
			success: CheckCircle,
			warning: AlertTriangle,
			error: XCircle,
			loading: LoaderCircle
		}[type] || Info // Default fallback
	);

	// Determine the icon component to render (passed icon or default)
	const IconComponent = $derived(icon ?? DefaultIcon);

	// --- Effects ---
	// Effect for handling the auto-dismiss timer
	$effect(() => {
		// Don't run timer if persistent, paused, or already dismissed somehow
		if (isPersistent || paused) {
			return; // Exit effect, no cleanup needed unless timer was running
		}

		// Record the start time when the timer effect begins running
		startTime = performance.now();

		const timerId = setTimeout(() => {
			handleDismissClick(); // Dismiss when timer finishes
		}, remaining);

		// Cleanup function: Runs when dependencies change (paused, isPersistent) or component unmounts
		return () => {
			clearTimeout(timerId);
			// If it wasn't paused manually by hover, calculate elapsed time and update remaining
			// This ensures the timer resumes correctly if dependencies change mid-timeout
			if (!paused) {
				const elapsed = performance.now() - startTime;
				remaining = Math.max(0, remaining - elapsed); // Prevent negative remaining time
			}
		};
	});

	// --- Event Handlers ---
	function handleMouseEnter() {
		if (pauseOnHover && !isPersistent) {
			paused = true;
			// Accurately calculate time elapsed since effect started running
			const elapsed = performance.now() - startTime;
			remaining = Math.max(0, remaining - elapsed); // Update remaining time
		}
	}

	function handleMouseLeave() {
		if (pauseOnHover && !isPersistent) {
			paused = false;
			// startTime will be reset by the $effect when `paused` changes back to false
		}
	}

	function handleDismissClick() {
		_dismiss(id!); // Call the dismiss function from the service
		onClose(); // Call the user-provided callback
	}

	function handleActionClick(action: ToastAction) {
		action.onClick?.(); // Execute the action's callback
		if (action.dismissOnClick !== false) {
			// Dismiss the toast unless explicitly told not to
			handleDismissClick();
		}
	}
</script>

<div
	bind:this={hostElement}
	class="alert {alertClasses} w-full max-w-md shadow-lg"
	role={type === 'error' || type === 'warning' ? 'alert' : 'status'}
	aria-live={type === 'error' ? 'assertive' : 'polite'}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	transition:fade={{ duration: 250 }}
>
	<!-- Icon -->
	<span class:animate-spin={type === 'loading'}>
		{#if IconComponent}
			<IconComponent size={24} strokeWidth={1.75} />
		{/if}
	</span>

	<!-- Content Area -->
	<div class="flex-1">
		{#if title}
			<h3 class="font-bold">{title}</h3>
		{/if}
		<div class="text-sm">
			{@html content}
			<!-- SECURITY WARNING: Only use @html if 'content' is trusted HTML.
			     If 'content' is plain text or potentially untrusted, use
			     {@text content} or just {content} instead to prevent XSS attacks. -->
		</div>
	</div>

	<!-- Actions & Close Button -->
	<div class="flex flex-none gap-2">
		{#if actions.length > 0}
			<div class="flex items-center gap-2">
				{#each actions as action}
					<button
						class="btn btn-sm {action.class ??
							(type === 'error' || type === 'warning' ? 'btn-neutral' : 'btn-ghost')}"
						onclick={() => handleActionClick(action)}
					>
						{action.label}
					</button>
				{/each}
			</div>
		{/if}

		{#if !isPersistent}
			<button
				class="btn btn-sm btn-ghost aspect-square p-1"
				onclick={handleDismissClick}
				aria-label="Close notification"
			>
				<X size={18} />
			</button>
		{/if}
	</div>

	<!-- Optional Progress Bar (Example - Needs refinement for smoother animation) -->
	<!-- {#if !isPersistent && duration > 0 && !paused}
		<progress
			class="progress progress-primary absolute bottom-0 left-0 w-full h-1"
			value={remaining}
			max={duration}>
		</progress>
	{/if} -->
</div>

<style>
	/* Optional: Add any specific styles here if needed */
	.alert {
		/* Ensure alerts stack nicely if container uses flex column */
		width: fit-content; /* Or set a specific max-width */
		min-width: 250px; /* Example minimum width */
	}
	.animate-spin {
		/* Ensure DaisyUI's spin animation works if not applied by default */
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
