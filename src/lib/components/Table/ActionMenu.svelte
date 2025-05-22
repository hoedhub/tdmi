<script lang="ts" generics="T extends Record<string, any>">
	import type { ActionDefinition } from './types';

	interface Props {
		rowData: T;
		actions: ActionDefinition<T>[];
		triggerIcon?: string; // Optional icon class for the trigger button
		dropdownPosition?: 'dropdown-end' | 'dropdown-left' | 'dropdown-top' | 'dropdown-bottom';
	}

	const {
		rowData,
		actions = [],
		triggerIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-5 h-5 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>', // Default: horizontal ellipsis
		dropdownPosition = 'dropdown-end' // Default position
	}: Props = $props();

	// Filter actions based on their 'hidden' condition for the current rowData
	const visibleActions = $derived(
		actions.filter((action) => !(action.hidden && action.hidden(rowData)))
	);

	function handleActionClick(event: MouseEvent, action: ActionDefinition<T>) {
		event.stopPropagation(); // Prevent row click if action menu is inside row

		if (action.handler && !(action.disabled && action.disabled(rowData))) {
			action.handler(rowData);
			// Close dropdown after action - DaisyUI might handle this, but manual blur can help
			const target = event.currentTarget as HTMLElement;
			target?.blur(); // Lose focus to potentially close dropdown
			// Find parent dropdown toggle and blur it too? Might be overkill.
			const dropdownToggle = target
				.closest('.dropdown')
				?.querySelector(':scope > :first-child') as HTMLElement | null;
			dropdownToggle?.blur();
		}
	}
</script>

{#if visibleActions.length > 0}
	<div class="dropdown !relative {dropdownPosition}">
		<!-- Trigger Button -->
		<!-- JS might be needed for perfect aria state -->
		<div
			role="button"
			tabindex="0"
			class="btn btn-soft btn-xs btn-circle m-1 shadow-2xl"
			aria-haspopup="true"
			aria-expanded="false"
			aria-label="Row actions"
		>
			{@html triggerIcon}
		</div>

		<!-- Dropdown Content -->
		<ul
			tabindex="0"
			class="dropdown-content menu bg-base-100/85 rounded-box !z-50 w-52 border-[0.5px] p-2 shadow md:-translate-x-8 md:-translate-y-6"
			role="menu"
		>
			{#each visibleActions as action (action.label)}
				{@const isDisabled = action.disabled ? action.disabled(rowData) : false}
				<li role="menuitem">
					<button
						type="button"
						class="text-sm {action.class ?? ''}"
						disabled={isDisabled}
						onclick={(e) => handleActionClick(e, action)}
						aria-disabled={isDisabled}
					>
						<!-- Optional Icon could go here -->
						{action.label}
					</button>
				</li>
			{/each}
		</ul>
	</div>
{:else}
	<!-- Optionally render a placeholder or nothing if no actions are visible -->
	<div class="m-1 h-8 w-8"></div>
	<!-- Placeholder to maintain layout spacing -->
{/if}

<style>
	/* Ensure dropdown content has a high enough z-index if table cells clip */
	.dropdown-content {
		z-index: 20; /* Set in class now */
	}
	/* Ensure disabled buttons look right inside the menu */
	.menu button:disabled {
		background-color: transparent !important; /* Override potential DaisyUI button styles */
		color: hsl(var(--bc) / 0.3) !important; /* Dim text color */
		cursor: not-allowed;
	}
</style>
