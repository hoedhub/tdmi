<script lang="ts">
	import { goto } from '$app/navigation';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';

	export let data;

	// State untuk pengaturan putaran
	let selectedUserIds = new Set<string>();
	let periodCount = 1;
	let periodDuration = 7; // dalam hari
	let startDate = new Date().toISOString().split('T')[0];

	// State untuk jadwal yang akan disusun
	let generatedSchedules: Array<{
		period: number;
		startDate: Date;
		endDate: Date;
		userId: string | null;
	}> = [];

	// State UI
	let settingsLocked = false;

	// Fungsi untuk memilih/membatalkan semua user
	function toggleSelectAll(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.checked) {
			selectedUserIds = new Set(data.users.map((u) => u.id));
		} else {
			selectedUserIds = new Set();
		}
	}

	// Fungsi untuk menghasilkan kerangka jadwal berdasarkan pengaturan
	function generateScheduleSlots() {
		if (selectedUserIds.size === 0 || periodCount <= 0 || periodDuration <= 0) {
			toastError('Pastikan semua pengaturan terisi dengan benar.');
			return;
		}
		if (periodCount > selectedUserIds.size) {
			toastError('Jumlah periode tidak boleh melebihi jumlah pengguna yang dipilih.');
			return;
		}

		settingsLocked = true;
		generatedSchedules = [];
		let currentStartDate = new Date(startDate);

		for (let i = 1; i <= periodCount; i++) {
			const endDate = new Date(currentStartDate);
			endDate.setDate(endDate.getDate() + periodDuration - 1);

			generatedSchedules.push({
				period: i,
				startDate: new Date(currentStartDate),
				endDate: new Date(endDate),
				userId: null
			});

			currentStartDate.setDate(currentStartDate.getDate() + periodDuration);
		}
	}

	// Fungsi untuk mengacak jadwal
	function randomizeSchedules() {
		if (generatedSchedules.length === 0) {
			toastError('Silakan buat kerangka jadwal terlebih dahulu.');
			return;
		}

		let availableUsers = [...data.users.filter((u) => selectedUserIds.has(u.id))];
		// Algoritma shuffle Fisher-Yates
		for (let i = availableUsers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[availableUsers[i], availableUsers[j]] = [availableUsers[j], availableUsers[i]];
		}

		generatedSchedules = generatedSchedules.map((schedule, index) => ({
			...schedule,
			userId: availableUsers[index]?.id || null
		}));
	}

	// Fungsi untuk mereset semua state
	function resetAll() {
		selectedUserIds.clear();
		periodCount = 1;
		periodDuration = 7;
		startDate = new Date().toISOString().split('T')[0];
		generatedSchedules = [];
		settingsLocked = false;
		// Force update UI for checkboxes
		selectedUserIds = new Set();
	}

	// Fungsi untuk menyimpan jadwal ke server
	async function saveRotationSchedule() {
		const schedulesToSave = generatedSchedules.filter((s) => s.userId);
		if (schedulesToSave.length !== periodCount) {
			toastError('Harap isi semua periode sebelum menyimpan.');
			return;
		}

		try {
			const response = await fetch('/api/piket-schedule/batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(schedulesToSave)
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Gagal menyimpan jadwal.');
			}

			toastSuccess('Jadwal satu putaran berhasil disimpan!');
			goto('/admin/piket');
		} catch (error: any) {
			toastError(error.message);
		}
	}

	// Helper untuk format tanggal
	function formatDate(date: Date) {
		return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}

	$: availableUsersForDropdown = (currentPeriod: number) => {
		const usedIds = new Set(
			generatedSchedules.filter((s) => s.period !== currentPeriod && s.userId).map((s) => s.userId)
		);
		return data.users.filter((u) => selectedUserIds.has(u.id) && !usedIds.has(u.id));
	};
</script>

<svelte:head>
	<title>Susun Jadwal Piket</title>
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Susun Jadwal Piket Satu Putaran</h1>

	<!-- Langkah 1: Pengaturan Putaran -->
	<div class="card bg-base-100 shadow-xl mb-6">
		<div class="card-body">
			<h2 class="card-title">Langkah 1: Pengaturan Putaran</h2>
			<fieldset disabled={settingsLocked}>
				<!-- Pilih Pengguna -->
				<div class="mb-4">
					<h3 class="font-semibold mb-2">Pilih Pengguna untuk Putaran Ini</h3>
					<div class="flex items-center mb-2">
						<input type="checkbox" id="selectAll" on:change={toggleSelectAll} class="checkbox" />
						<label for="selectAll" class="ml-2">Pilih Semua</label>
					</div>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-2">
						{#each data.users as user}
							<div>
								<label class="flex items-center cursor-pointer">
									<input
										type="checkbox"
										class="checkbox"
										checked={selectedUserIds.has(user.id)}
										on:change={() => {
											if (selectedUserIds.has(user.id)) {
												selectedUserIds.delete(user.id);
											} else {
												selectedUserIds.add(user.id);
											}
											selectedUserIds = selectedUserIds; // Trigger reactivity
										}}
									/>
									<span class="ml-2">{user.username}</span>
								</label>
							</div>
						{/each}
					</div>
				</div>

				<!-- Pengaturan Periode -->
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div class="form-control">
						<label for="periodCount" class="label"><span class="label-text">Jumlah Periode</span></label>
						<input
							type="number"
							id="periodCount"
							class="input input-bordered"
							bind:value={periodCount}
							min="1"
						/>
					</div>
					<div class="form-control">
						<label for="periodDuration" class="label"
							><span class="label-text">Durasi per Periode (hari)</span></label
						>
						<input
							type="number"
							id="periodDuration"
							class="input input-bordered"
							bind:value={periodDuration}
							min="1"
						/>
					</div>
					<div class="form-control">
						<label for="startDate" class="label"
							><span class="label-text">Tanggal Mulai Putaran</span></label
						>
						<input type="date" id="startDate" class="input input-bordered" bind:value={startDate} />
					</div>
				</div>
			</fieldset>
			<div class="card-actions justify-end mt-4">
				{#if settingsLocked}
					<button class="btn btn-warning" on:click={() => (settingsLocked = false)}
						>Ubah Pengaturan</button
					>
				{:else}
					<button class="btn btn-primary" on:click={generateScheduleSlots}>Buat Kerangka Jadwal</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Langkah 2: Panel Penyusunan Jadwal -->
	{#if generatedSchedules.length > 0}
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Langkah 2: Susun Jadwal</h2>
				<div class="flex justify-between items-center mb-4">
					<p>Tetapkan pengguna untuk setiap periode di bawah ini.</p>
					<button class="btn btn-secondary" on:click={randomizeSchedules}>Susun Acak</button>
				</div>

				<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Periode</th>
								<th>Tanggal Mulai</th>
								<th>Tanggal Selesai</th>
								<th>Petugas</th>
							</tr>
						</thead>
						<tbody>
							{#each generatedSchedules as schedule, i}
								<tr>
									<td>{schedule.period}</td>
									<td>{formatDate(schedule.startDate)}</td>
									<td>{formatDate(schedule.endDate)}</td>
									<td>
										<select
											class="select select-bordered w-full"
											bind:value={schedule.userId}
											required
										>
											<option disabled selected value={null}>Pilih Pengguna</option>
											{#each availableUsersForDropdown(schedule.period) as user}
												<option value={user.id}>{user.username}</option>
											{/each}
										</select>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Langkah 3: Tombol Aksi -->
				<div class="card-actions justify-end mt-6">
					<button class="btn btn-ghost" on:click={resetAll}>Reset</button>
					<button class="btn btn-success" on:click={saveRotationSchedule}>Simpan Jadwal Putaran</button>
				</div>
			</div>
		</div>
	{/if}
</div>
