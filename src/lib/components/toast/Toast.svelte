<!-- src/lib/components/toast/Toast.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ToastMessage, SvelteLucideIcon } from './types';
	import { dismiss } from './toastStore'; // To dismiss itself
	import { X } from 'lucide-svelte'; // Default close icon

	// --- Props (all from ToastMessage interface) ---
	export let id: string;
	export let type: ToastMessage['type'];
	export let title: ToastMessage['title'] = undefined;
	export let message: ToastMessage['message'];
	export let icon: ToastMessage['icon'] = undefined;
	export let iconProps: ToastMessage['iconProps'] = { size: 24 };
	export let duration: ToastMessage['duration']; // ms, Infinity for persistent
	export let showCloseButton: ToastMessage['showCloseButton'];
	export let progress: ToastMessage['progress'];
	export let pauseOnHover: ToastMessage['pauseOnHover'];
	export let actions: ToastMessage['actions'] = [];
	export let customClass: ToastMessage['customClass'] = '';
	export let allowHtml: ToastMessage['allowHtml'] = false;
	// onDismiss is handled by the store when dismiss() is called
	// ***** ADD THESE EXPORTED PROPS *****
	export let onDismiss: ToastMessage['onDismiss'] = undefined; // Even if not used directly in this component's logic
	export let createdAt: ToastMessage['createdAt']; // This prop must exist if it's passed

	$: if (false) {
		console.log(onDismiss, createdAt);
	}

	let timerId: number | undefined = undefined;
	let remainingDuration: number = duration;
	let startTime: number = Date.now();
	let isPaused: boolean = false;

	// --- Computed properties for styling ---
	$: alertClass = {
		info: 'alert-info',
		success: 'alert-success',
		warning: 'alert-warning',
		error: 'alert-error',
		loading: 'alert-info', // Or a specific loading style
		custom: '' // Custom type relies on customClass
	}[type];

	$: progressColorClass = {
		info: 'bg-info-content', // Or 'bg-info' for DaisyUI v3, check v4 variables
		success: 'bg-success-content',
		warning: 'bg-warning-content',
		error: 'bg-error-content',
		loading: 'bg-info-content',
		custom: 'bg-neutral-content' // A sensible default for custom
	}[type];

	// --- Auto-dismiss Logic ---
	function startTimer() {
		if (duration === Infinity || duration <= 0) return;
		isPaused = false;
		startTime = Date.now();
		clearTimeout(timerId); // Clear any existing timer

		timerId = window.setTimeout(() => {
			dismiss(id);
		}, remainingDuration);
	}

	function pauseTimer() {
		if (!pauseOnHover || duration === Infinity || duration <= 0 || isPaused) return;
		isPaused = true;
		clearTimeout(timerId);
		const elapsed = Date.now() - startTime;
		remainingDuration -= elapsed;
	}

	function resumeTimer() {
		if (!pauseOnHover || duration === Infinity || duration <= 0 || !isPaused) return;
		// isPaused is set to false in startTimer
		startTimer();
	}

	onMount(() => {
		if (duration > 0 && duration !== Infinity) {
			startTimer();
		}
	});

	onDestroy(() => {
		clearTimeout(timerId);
	});

	// Reactive statement to restart timer if duration changes (e.g., via toastStore.update)
	// This is a basic way; a more robust way might involve a unique key changing
	$: if (duration && id) {
		// Check id to ensure it's not during initial undefined state
		remainingDuration = duration;
		if (duration > 0 && duration !== Infinity) {
			startTimer();
		} else {
			clearTimeout(timerId); // If duration becomes 0 or Infinity
		}
	}

	// --- Event Handlers ---
	function handleClose() {
		dismiss(id);
	}

	function handleActionClick(actionOnClick: (toastId: string) => void) {
		actionOnClick(id);
		// Optionally, dismiss after action by default, or let the action handler decide
		// dismiss(id);
	}
</script>

<div
	class="alert w-full shadow-lg {alertClass} {customClass}"
	role="alert"
	aria-live={type === 'error' || type === 'warning' ? 'assertive' : 'polite'}
	on:mouseenter={pauseTimer}
	on:mouseleave={resumeTimer}
	on:focusin={pauseTimer}
	on:focusout={resumeTimer}
>
	<!-- Icon -->
	{#if icon}
		<div class="flex-shrink-0">
			<svelte:component this={icon} {...iconProps} />
		</div>
	{/if}

	<!-- Content -->
	<div class="flex-grow">
		{#if title}
			<h3 class="text-lg font-bold">{title}</h3>
		{/if}
		{#if allowHtml}
			<div class="text-sm">{@html message}</div>
		{:else}
			<div class="text-sm">{message}</div>
		{/if}
	</div>

	<!-- Actions (if any) - Placed before close button for typical layout -->
	{#if actions && actions.length > 0}
		<div
			class="flex flex-shrink-0 flex-col gap-2 sm:flex-row {title || message
				? 'sm:ml-auto'
				: ''} items-center"
		>
			{#each actions as action}
				<button
					class="btn btn-sm {action.class ||
						(type === 'custom' ? 'btn-outline' : `btn-outline btn-${type}`)}"
					on:click={() => handleActionClick(action.onClick)}
				>
					{#if action.icon}
						<svelte:component
							this={action.icon}
							{...action.iconProps || { size: 16, class: 'mr-1' }}
						/>
					{/if}
					{action.label}
				</button>
			{/each}
		</div>
	{/if}

	<!-- Close Button -->
	{#if showCloseButton}
		<div class="flex-shrink-0">
			<button
				class="btn btn-circle btn-ghost btn-sm"
				on:click={handleClose}
				aria-label="Close notification"
			>
				<X size={20} />
			</button>
		</div>
	{/if}

	<!-- Progress Bar -->
	{#if progress && duration > 0 && duration !== Infinity}
		<div
			class="absolute bottom-0 left-0 right-0 h-1 opacity-70 {progressColorClass}"
			style:animation="toast-progress {duration}ms linear forwards"
			style:animation-play-state={isPaused ? 'paused' : 'running'}
		></div>
	{/if}
</div>

<style>
	@keyframes toast-progress {
		from {
			width: 100%;
		}
		to {
			width: 0%;
		}
	}
	/* Ensure alert itself is relative for absolute positioning of progress bar */
	.alert {
		position: relative;
		overflow: hidden; /* To clip progress bar if it somehow exceeds bounds */
	}
</style>
