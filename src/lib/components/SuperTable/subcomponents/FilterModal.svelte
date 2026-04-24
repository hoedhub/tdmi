<script lang="ts">
	import { run } from 'svelte/legacy';
	import { onMount, onDestroy } from 'svelte';
	import type { ColumnDef, AdvancedFilterCondition, AdvancedFilterState, FilterOperator, FilterType } from '../types';
	import { GripVertical, Trash2, PlusCircle, Filter } from 'lucide-svelte';

	interface Props {
		isOpen: boolean;
		columns: ColumnDef<any>[];
		currentFilter: AdvancedFilterState;
		onclose?: () => void;
		onsave?: (filter: AdvancedFilterState) => void;
	}

	let { isOpen, columns, currentFilter, onclose, onsave }: Props = $props();

	let internalConditions: AdvancedFilterCondition[] = $state([]);
	let logic: 'AND' | 'OR' = $state('AND');
	let nextId = 0;
	let dialog: HTMLDialogElement | undefined = $state();

	// Only filterable columns are selectable as targets
	const filterableColumns = $derived(columns.filter((c) => c.filterable));

	// ── Operator definitions per column type ──────────────────────────────────

	type OperatorMeta = { value: FilterOperator; label: string };

	const TEXT_OPERATORS: OperatorMeta[] = [
		{ value: 'contains', label: 'Mengandung' },
		{ value: 'not_contains', label: 'Tidak mengandung' },
		{ value: 'equals', label: 'Sama dengan' },
		{ value: 'not_equals', label: 'Tidak sama dengan' },
		{ value: 'starts_with', label: 'Diawali dengan' },
		{ value: 'ends_with', label: 'Diakhiri dengan' },
		{ value: 'is_empty', label: 'Kosong' },
		{ value: 'is_not_empty', label: 'Tidak kosong' }
	];

	const SELECT_OPERATORS: OperatorMeta[] = [
		{ value: 'equals', label: 'Sama dengan' },
		{ value: 'not_equals', label: 'Tidak sama dengan' },
		{ value: 'is_empty', label: 'Kosong' },
		{ value: 'is_not_empty', label: 'Tidak kosong' }
	];

	const DATE_OPERATORS: OperatorMeta[] = [
		{ value: 'date_equals', label: 'Sama dengan tanggal' },
		{ value: 'date_before', label: 'Sebelum tanggal' },
		{ value: 'date_after', label: 'Setelah tanggal' },
		{ value: 'date_between', label: 'Di antara tanggal' },
		{ value: 'is_empty', label: 'Kosong' },
		{ value: 'is_not_empty', label: 'Tidak kosong' }
	];

	const NUMBER_OPERATORS: OperatorMeta[] = [
		{ value: 'num_equals', label: 'Sama dengan' },
		{ value: 'num_not_equals', label: 'Tidak sama dengan' },
		{ value: 'num_gt', label: 'Lebih dari' },
		{ value: 'num_gte', label: 'Lebih dari atau sama dengan' },
		{ value: 'num_lt', label: 'Kurang dari' },
		{ value: 'num_lte', label: 'Kurang dari atau sama dengan' },
		{ value: 'is_empty', label: 'Kosong' },
		{ value: 'is_not_empty', label: 'Tidak kosong' }
	];

	function getFilterType(col: ColumnDef<any>): FilterType {
		if (col.filterConfig?.type) return col.filterConfig.type;
		if (typeof col.filterable === 'string') return col.filterable as FilterType;
		if (col.filterOptions) return 'select';
		return 'text';
	}

	function getOperatorsForColumn(columnKey: string): OperatorMeta[] {
		const col = filterableColumns.find((c) => String(c.key) === columnKey);
		if (!col) return TEXT_OPERATORS;
		const type = getFilterType(col);
		switch (type) {
			case 'select': return SELECT_OPERATORS;
			case 'date':   return DATE_OPERATORS;
			case 'number': return NUMBER_OPERATORS;
			default:       return TEXT_OPERATORS;
		}
	}

	function getDefaultOperator(columnKey: string): FilterOperator {
		return getOperatorsForColumn(columnKey)[0]?.value ?? 'contains';
	}

	// Whether an operator requires a text/date input value
	const NO_VALUE_OPERATORS = new Set<FilterOperator>(['is_empty', 'is_not_empty']);

	function needsValue(op: FilterOperator): boolean {
		return !NO_VALUE_OPERATORS.has(op);
	}

	function needsSecondValue(op: FilterOperator): boolean {
		return op === 'date_between';
	}

	function getInputType(columnKey: string): string {
		const col = filterableColumns.find((c) => String(c.key) === columnKey);
		if (!col) return 'text';
		const type = getFilterType(col);
		if (type === 'date') return 'date';
		if (type === 'number') return 'number';
		return 'text';
	}

	function getSelectOptions(columnKey: string) {
		const col = filterableColumns.find((c) => String(c.key) === columnKey);
		return col?.filterOptions ?? col?.filterConfig?.options ?? [];
	}

	// ── State Initialization ──────────────────────────────────────────────────

	function initializeState() {
		nextId = 0;
		logic = currentFilter?.logic ?? 'AND';
		internalConditions = (JSON.parse(JSON.stringify(currentFilter?.conditions ?? [])) as AdvancedFilterCondition[]).map(
			(c) => ({ ...c, id: nextId++ })
		);
	}

	// ── Lifecycle ─────────────────────────────────────────────────────────────

	onMount(() => {
		if (isOpen && dialog) {
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

	run(() => {
		if (isOpen && dialog) {
			dialog.showModal();
			initializeState();
		} else if (!isOpen && dialog) {
			dialog.close();
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (isOpen && event.key === 'Escape') close();
	}

	// ── CRUD ──────────────────────────────────────────────────────────────────

	function addCondition() {
		if (filterableColumns.length === 0) return;
		const firstKey = String(filterableColumns[0].key);
		internalConditions = [
			...internalConditions,
			{ id: nextId++, columnKey: firstKey, operator: getDefaultOperator(firstKey), value: '', value2: '' }
		];
	}

	function removeCondition(index: number) {
		internalConditions.splice(index, 1);
		internalConditions = [...internalConditions];
	}

	function onColumnChange(index: number, newKey: string) {
		const op = getDefaultOperator(newKey);
		internalConditions[index] = { ...internalConditions[index], columnKey: newKey, operator: op, value: '', value2: '' };
		internalConditions = [...internalConditions];
	}

	function onOperatorChange(index: number, newOp: FilterOperator) {
		internalConditions[index] = { ...internalConditions[index], operator: newOp, value: '', value2: '' };
		internalConditions = [...internalConditions];
	}

	// ── Drag & Drop ───────────────────────────────────────────────────────────

	let draggedIndex: number | null = null;

	function onDragStart(index: number) { draggedIndex = index; }
	function onDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
	}
	function onDrop(targetIndex: number) {
		if (draggedIndex === null) return;
		const item = internalConditions[draggedIndex];
		const newList = [...internalConditions];
		newList.splice(draggedIndex, 1);
		newList.splice(targetIndex, 0, item);
		internalConditions = newList;
		draggedIndex = null;
	}

	// ── Save / Reset / Close ──────────────────────────────────────────────────

	function handleSave() {
		const toSave: AdvancedFilterState = {
			logic,
			conditions: internalConditions.map(({ id: _id, ...rest }) => ({ ...rest, id: _id }))
		};
		onsave?.(toSave);
		close();
	}

	function handleReset() {
		internalConditions = [];
		logic = 'AND';
	}

	function close() { onclose?.(); }

	// ── Derived ───────────────────────────────────────────────────────────────

	let activeCount = $derived(internalConditions.length);
</script>

<dialog bind:this={dialog} class="modal" onclose={close}>
	<div class="modal-box w-11/12 max-w-2xl" role="document">

		<!-- Header -->
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-2">
				<Filter class="h-5 w-5 text-primary" />
				<h3 class="text-lg font-bold" id="filter-modal-title">Manage Filter</h3>
				{#if activeCount > 0}
					<span class="badge badge-primary badge-sm">{activeCount} kondisi</span>
				{/if}
			</div>
			<form method="dialog">
				<button class="btn btn-circle btn-ghost btn-sm">✕</button>
			</form>
		</div>

		<div class="divider my-2"></div>

		<!-- Logic toggle -->
		{#if internalConditions.length > 1}
			<div class="mb-3 flex items-center gap-2 text-sm">
				<span class="text-base-content/60">Tampilkan data yang memenuhi</span>
				<div class="join">
					<button
						class="join-item btn btn-xs {logic === 'AND' ? 'btn-primary' : 'btn-ghost border border-base-300'}"
						onclick={() => (logic = 'AND')}
					>SEMUA kondisi</button>
					<button
						class="join-item btn btn-xs {logic === 'OR' ? 'btn-primary' : 'btn-ghost border border-base-300'}"
						onclick={() => (logic = 'OR')}
					>SALAH SATU kondisi</button>
				</div>
			</div>
		{/if}

		<!-- Conditions list -->
		<div class="max-h-[400px] space-y-2 overflow-y-auto py-2 pr-1" role="list">
			{#if internalConditions.length === 0}
				<div class="rounded-lg border border-dashed border-base-300 p-8 text-center">
					<Filter class="mx-auto mb-2 h-8 w-8 text-base-content/30" />
					<p class="text-sm text-base-content/50">Belum ada kondisi filter.</p>
					<p class="text-xs text-base-content/40">Klik "+ Tambah Kondisi" untuk mulai.</p>
				</div>
			{/if}

			{#each internalConditions as condition, index (condition.id)}
				{@const operators = getOperatorsForColumn(condition.columnKey)}
				{@const inputType = getInputType(condition.columnKey)}
				{@const selectOpts = getSelectOptions(condition.columnKey)}
				{@const showValue = needsValue(condition.operator)}
				{@const showValue2 = needsSecondValue(condition.operator)}
				{@const isSelectType = getFilterType(filterableColumns.find(c => String(c.key) === condition.columnKey)!) === 'select'}

				<div
					class="group flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2 transition-colors hover:border-primary/40 hover:bg-base-200/50"
					role="listitem"
					draggable="true"
					ondragstart={() => onDragStart(index)}
					ondragover={onDragOver}
					ondrop={() => onDrop(index)}
				>
					<!-- Drag handle -->
					<button
						class="btn btn-ghost btn-xs cursor-move px-1 opacity-30 transition-opacity group-hover:opacity-60"
						aria-label="Drag to reorder"
						tabindex="-1"
					>
						<GripVertical class="h-4 w-4" />
					</button>

					<!-- Condition index badge -->
					{#if internalConditions.length > 1}
						<span class="badge badge-ghost badge-xs shrink-0 font-mono">{index + 1}</span>
					{/if}

					<!-- Column selector -->
					<select
						class="select select-bordered select-sm min-w-0 flex-1"
						value={condition.columnKey}
						onchange={(e) => onColumnChange(index, e.currentTarget.value)}
						aria-label="Pilih kolom"
					>
						{#each filterableColumns as col (col.key)}
							<option value={String(col.key)}>{col.label}</option>
						{/each}
					</select>

					<!-- Operator selector -->
					<select
						class="select select-bordered select-sm min-w-0 flex-1"
						value={condition.operator}
						onchange={(e) => onOperatorChange(index, e.currentTarget.value as FilterOperator)}
						aria-label="Pilih operator"
					>
						{#each operators as op (op.value)}
							<option value={op.value}>{op.label}</option>
						{/each}
					</select>

					<!-- Value input(s) -->
					{#if showValue}
						<div class="flex min-w-0 flex-1 items-center gap-1">
							{#if isSelectType && selectOpts.length > 0}
								<!-- Select value input -->
								<select
									class="select select-bordered select-sm w-full"
									bind:value={condition.value}
									aria-label="Nilai filter"
								>
									<option value="">-- Pilih --</option>
									{#each selectOpts as opt}
										{#if typeof opt === 'string'}
											<option value={opt}>{opt}</option>
										{:else}
											<option value={opt.value}>{opt.label}</option>
										{/if}
									{/each}
								</select>
							{:else}
								<!-- Text/date/number value input -->
								<input
									type={inputType}
									class="input input-bordered input-sm w-full"
									bind:value={condition.value}
									placeholder="Nilai..."
									aria-label="Nilai filter"
								/>
								{#if showValue2}
									<span class="shrink-0 text-xs text-base-content/50">s.d.</span>
									<input
										type={inputType}
										class="input input-bordered input-sm w-full"
										bind:value={condition.value2}
										placeholder="Nilai akhir..."
										aria-label="Nilai akhir filter"
									/>
								{/if}
							{/if}
						</div>
					{:else}
						<!-- Placeholder so layout stays stable -->
						<div class="flex-1"></div>
					{/if}

					<!-- Remove button -->
					<button
						class="btn btn-ghost btn-xs text-error opacity-50 transition-opacity group-hover:opacity-100"
						onclick={() => removeCondition(index)}
						aria-label="Hapus kondisi"
					>
						<Trash2 class="h-4 w-4" />
					</button>
				</div>
			{/each}
		</div>

		<!-- Add condition button -->
		<button
			class="btn btn-ghost btn-sm mt-2 w-full border border-dashed border-base-300 hover:border-primary hover:text-primary"
			onclick={addCondition}
			disabled={filterableColumns.length === 0}
		>
			<PlusCircle class="h-4 w-4" />
			Tambah Kondisi
		</button>

		<!-- Footer actions -->
		<div class="modal-action mt-4 flex items-center justify-between">
			<button
				class="btn btn-ghost btn-sm text-error"
				onclick={handleReset}
				disabled={internalConditions.length === 0}
			>
				Reset Semua
			</button>
			<div class="flex gap-2">
				<form method="dialog">
					<button class="btn btn-sm">Batal</button>
				</form>
				<button class="btn btn-primary btn-sm" onclick={handleSave}>
					Terapkan
				</button>
			</div>
		</div>
	</div>
</dialog>
