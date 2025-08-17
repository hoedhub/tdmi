<script lang="ts">
	import { onMount, tick } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// Reactive state
	let schedules: any[] = [];
	let isLoading = true;
	let showModal = false;
	let isEditing = false;

	// Form data
	let currentSchedule: {
		id: number | null;
		userId: string;
		// roleId dihapus
		startDate: string;
		endDate: string;
		groupId: string;
		description: string;
	} = {
		id: null,
		userId: '',
		startDate: '',
		endDate: '',
		groupId: '',
		description: ''
	};

	// Lifecycle
	onMount(async () => {
		await fetchSchedules();
	});

	// Functions
	async function fetchSchedules() {
		isLoading = true;
		try {
			const res = await fetch('/api/piket-schedule');
			if (res.ok) {
				schedules = await res.json();
			} else {
				console.error('Gagal memuat jadwal:', await res.text());
			}
		} catch (e) {
			console.error('Error:', e);
		} finally {
			isLoading = false;
		}
	}

	function openNewModal() {
		isEditing = false;
		resetForm();
		showModal = true;
	}

	function openEditModal(schedule: any) {
		isEditing = true;
		currentSchedule = {
			id: schedule.id,
			userId: schedule.userId,
			startDate: schedule.startDate.split('T')[0], // Format YYYY-MM-DD
			endDate: schedule.endDate.split('T')[0], // Format YYYY-MM-DD
			groupId: schedule.groupId || '',
			description: schedule.description || ''
		};
		showModal = true;
	}

	function closeModal() {
		showModal = false;
	}

	function resetForm() {
		currentSchedule = {
			id: null,
			userId: '',
			startDate: '',
			endDate: '',
			groupId: '',
			description: ''
		};
	}

	async function handleSubmit() {
		const url = isEditing ? `/api/piket-schedule/${currentSchedule.id}` : '/api/piket-schedule';
		const method = isEditing ? 'PUT' : 'POST';

		try {
			const res = await fetch(url, {
				method,
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(currentSchedule)
			});

			if (res.ok) {
				closeModal();
				await fetchSchedules();
			} else {
				alert(`Gagal menyimpan: ${await res.text()}`);
			}
		} catch (e) {
			alert(`Error: ${e}`);
		}
	}

	async function handleDelete(id: number) {
		if (!confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

		try {
			const res = await fetch(`/api/piket-schedule/${id}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				await fetchSchedules();
			} else {
				alert(`Gagal menghapus: ${await res.text()}`);
			}
		} catch (e) {
			alert(`Error: ${e}`);
		}
	}

	// Utility to format date for display
	function formatDate(dateString: string) {
		if (!dateString) return 'N/A';
		return new Date(dateString).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class="container mx-auto p-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Manajemen Jadwal Ruasa'</h1>
		{#if data.permissions.canWrite}
			<div class="flex gap-2">
				<a href="/admin/piket/susun" class="btn btn-secondary">Susun Jadwal Putaran</a>
				<button class="btn btn-primary" on:click={openNewModal}>+ Tambah Jadwal</button>
			</div>
		{/if}
	</div>

	<!-- Table -->
	<div class="overflow-x-auto rounded-lg bg-base-100 shadow">
		<table class="table w-full">
			<thead>
				<tr>
					<th>Pengguna</th>
					<th>Grup</th>
					<th>Mulai</th>
					<th>Selesai</th>
					<th>Keterangan</th>
					{#if data.permissions.canWrite}
						<th>Aksi</th>
					{/if}
				</tr>
			</thead>
			<tbody>
				{#if isLoading}
					<tr>
						<td colspan={data.permissions.canWrite ? 6 : 5} class="text-center">Memuat data...</td>
					</tr>
				{:else if schedules.length === 0}
					<tr>
						<td colspan={data.permissions.canWrite ? 6 : 5} class="text-center"
							>Tidak ada jadwal.</td
						>
					</tr>
				{/if}
				{#each schedules as schedule (schedule.id)}
					<tr>
						<td>{schedule.username || 'N/A'}</td>
						<td>{schedule.groupId || '-'}</td>
						<td>{formatDate(schedule.startDate)}</td>
						<td>{formatDate(schedule.endDate)}</td>
						<td>{schedule.description || '-'}</td>
						{#if data.permissions.canWrite}
							<td class="flex gap-2">
								<button class="btn btn-warning btn-sm" on:click={() => openEditModal(schedule)}
									>Edit</button
								>
								<button class="btn btn-error btn-sm" on:click={() => handleDelete(schedule.id)}
									>Hapus</button
								>
							</td>
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<!-- Modal -->
{#if showModal}
	<div class="modal modal-open">
		<div class="modal-box w-11/12 max-w-2xl">
			<h3 class="text-lg font-bold">{isEditing ? 'Edit' : 'Tambah'} Jadwal Ruasa'</h3>

			<form on:submit|preventDefault={handleSubmit}>
				<div class="form-control mt-4">
					<label for="user" class="label"><span class="label-text">Pengguna</span></label>
					<select
						id="user"
						class="select select-bordered"
						bind:value={currentSchedule.userId}
						required
					>
						<option disabled value="">Pilih pengguna</option>
						{#each data.users as user}
							<option value={user.id}>{user.username}</option>
						{/each}
					</select>
				</div>

				<div class="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2">
					<div class="form-control">
						<label for="startDate" class="label"
							><span class="label-text">Tanggal Mulai</span></label
						>
						<input
							type="date"
							id="startDate"
							class="input input-bordered"
							bind:value={currentSchedule.startDate}
							required
						/>
					</div>
					<div class="form-control">
						<label for="endDate" class="label"
							><span class="label-text">Tanggal Selesai</span></label
						>
						<input
							type="date"
							id="endDate"
							class="input input-bordered"
							bind:value={currentSchedule.endDate}
							required
						/>
					</div>
				</div>

				<div class="form-control mt-2">
					<label for="groupId" class="label"
						><span class="label-text">ID Grup (Opsional)</span></label
					>
					<input
						type="text"
						id="groupId"
						class="input input-bordered"
						bind:value={currentSchedule.groupId}
					/>
				</div>

				<div class="form-control mt-2">
					<label for="description" class="label"
						><span class="label-text">Keterangan (Opsional)</span></label
					>
					<textarea
						id="description"
						class="textarea textarea-bordered"
						bind:value={currentSchedule.description}
					></textarea>
				</div>

				<div class="modal-action mt-6">
					<button type="button" class="btn" on:click={closeModal}>Batal</button>
					<button type="submit" class="btn btn-primary">{isEditing ? 'Simpan' : 'Tambah'}</button>
				</div>
			</form>
		</div>
	</div>
{/if}
