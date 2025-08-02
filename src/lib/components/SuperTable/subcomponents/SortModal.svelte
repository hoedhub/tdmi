<script lang="ts" generics="T extends Record<string, any>">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';
	import type { ColumnDef, SortConfig } from '../types';
	import { ArrowDown, ArrowUp, GripVertical, Trash2 } from 'lucide-svelte';

	export let isOpen: boolean;
	export let columns: ColumnDef<T>[];
	export let currentSorts: SortConfig[];

	// Internal type to ensure stable key for Svelte's #each block
	type InternalSortConfig = SortConfig & { id: number };

	let internalSorts: InternalSortConfig[] = [];
	let nextId = 0;
	let dialog: HTMLDialogElement;

	onMount(() => {
		if (isOpen) {
			dialog.showModal();
			initializeState();
		}
		if (typeof window !== 'undefined') {
			window.addEventListener('keydown', handleKeydown);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeydown);
		}
	});

	// When the modal opens, initialize the internal state.
	$: if (isOpen && dialog) {
		dialog.showModal();
		initializeState();
	} else if (!isOpen && dialog) {
		dialog.close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (isOpen && event.key === 'Escape') {
			close();
		}
	}

	function initializeState() {
		nextId = 0;
		// Deep copy and assign unique IDs
		internalSorts = (JSON.parse(JSON.stringify(currentSorts || [])) as SortConfig[]).map(
			(sort) => ({
				...sort,
				id: nextId++
			})
		);
	}

	const dispatch = createEventDispatcher<{
		close: void;
		save: SortConfig[];
	}>();

	function addSort() {
		const availableColumns = columns.filter(
			(c) => c.sortable && !internalSorts.find((s) => s.key === c.key)
		);
		if (availableColumns.length > 0) {
			internalSorts = [
				...internalSorts,
				{ key: String(availableColumns[0].key), direction: 'asc', id: nextId++ }
			];
		}
	}

	function removeSort(index: number) {
		internalSorts.splice(index, 1);
		internalSorts = [...internalSorts];
	}

	function toggleDirection(index: number) {
		const currentDirection = internalSorts[index].direction;
		internalSorts[index].direction = currentDirection === 'asc' ? 'desc' : 'asc';
		internalSorts = [...internalSorts]; // Re-assign to trigger reactivity
	}

	function handleSave() {
		// Strip the internal 'id' before dispatching
		const sortsToSave: SortConfig[] = internalSorts.map(({ key, direction }) => ({
			key,
			direction
		}));
		dispatch('save', sortsToSave);
		close();
	}

	function close() {
		dispatch('close');
	}

	// Drag and drop functionality
	let draggedIndex: number | null = null;

	function onDragStart(index: number) {
		draggedIndex = index;
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function onDrop(targetIndex: number) {
		if (draggedIndex === null) return;

		const draggedItem = internalSorts[draggedIndex];
		const newSorts = [...internalSorts];
		newSorts.splice(draggedIndex, 1);
		newSorts.splice(targetIndex, 0, draggedItem);

		internalSorts = newSorts;
		draggedIndex = null;
	}
</script>

<dialog bind:this={dialog} class="modal" on:close={close}>
	<div class="modal-box" role="document">
		<h3 class="text-lg font-bold" id="sort-modal-title">Manage Sorting</h3>
		<form method="dialog">
			<button class="btn btn-circle btn-ghost btn-sm absolute right-2 top-2">×</button>
		</form>

		<div class="divider my-2"></div>

		<div class="space-y-3 py-4" role="list">
			{#if internalSorts.length === 0}
				<p class="text-center text-base-content/70">No sort conditions applied.</p>
			{/if}
			{#each internalSorts as sort, index (sort.id)}
				<div
					class="flex items-center gap-2 rounded-lg border border-base-300 p-2"
					role="listitem"
					draggable="true"
					on:dragstart={() => onDragStart(index)}
					on:dragover={onDragOver}
					on:drop={() => onDrop(index)}
				>
					<button class="btn btn-ghost btn-sm cursor-move px-1">
						<GripVertical class="h-5 w-5 text-base-content/50" />
					</button>

					<select class="select select-bordered select-sm w-full flex-grow" bind:value={sort.key}>
						{#each columns.filter((c) => c.sortable) as col (col.key)}
							<option
								value={col.key}
								disabled={internalSorts.some((s, i) => i !== index && s.key === col.key)}
							>
								{col.label}
							</option>
						{/each}
					</select>

					<button
						class="btn btn-circle btn-ghost btn-sm"
						on:click={() => toggleDirection(index)}
						aria-label="Toggle sort direction"
					>
						{#if sort.direction === 'asc'}
							<ArrowUp class="h-5 w-5" />
						{:else}
							<ArrowDown class="h-5 w-5" />
						{/if}
					</button>

					<button class="btn btn-ghost btn-sm text-error" on:click={() => removeSort(index)}>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			{/each}
		</div>

		<button class="btn btn-primary btn-sm w-full" on:click={addSort}>+ Add Sort Level</button>

		<div class="modal-action">
			<form method="dialog">
				<button class="btn">Cancel</button>
			</form>
			<button class="btn btn-primary" on:click={handleSave}>Apply</button>
		</div>
	</div>
</dialog>
