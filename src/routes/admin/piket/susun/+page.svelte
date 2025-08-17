<script lang="ts">
	import { goto } from '$app/navigation';
	import { error as toastError, success as toastSuccess } from '$lib/components/toast';
	import { slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';

	export let data;

	// State untuk pengaturan putaran
	let selectedUserIds = new Set<string>();
	let periodCount = 12;
	let periodDuration = 1;
	let periodUnit: 'days' | 'weeks' | 'months' = 'months';
	let startDate = new Date().toISOString().split('T')[0];

	// State untuk jadwal yang akan disusun
	let generatedSchedules: Array<{
		period: number;
		startDate: Date;
		endDate: Date;
		userIds: string[];
	}> = [];

	// State UI
	let currentStep = 1;
	let selectAllCheckbox: HTMLInputElement;
	let feedbackMessage = '';

	// --- State Modal ---
	let showUserSelectionModal = false;
	let editingPeriodIndex: number | null = null;
	let modalSelectedUserIds = new Set<string>();

	// --- LOGIKA UMPAN BALIK REAL-TIME ---
	$: {
		const numUsers = selectedUserIds.size;
		const numPeriods = periodCount;
		if (numUsers > 0 && numPeriods > 0) {
			if (numUsers < numPeriods) {
				feedbackMessage = `Informasi: ${numUsers} peserta akan didistribusikan ke ${numPeriods} periode. Beberapa peserta akan mendapat lebih dari satu giliran.`;
			} else if (numUsers > numPeriods) {
				feedbackMessage = `Informasi: ${numUsers} peserta akan didistribusikan ke ${numPeriods} periode. Beberapa periode akan memiliki lebih dari satu peserta.`;
			} else {
				feedbackMessage = '';
			}
		} else {
			feedbackMessage = '';
		}
	}

	// --- LOGIKA UMPAN BALIK LANGKAH 2 ---
	let assignmentCounts: Record<string, number> = {};
	let unassignedUsers: { id: string; username: string }[] = [];

	$: {
		if (currentStep === 2) {
			const counts: Record<string, number> = {};
			const assignedIds = new Set<string>();

			for (const schedule of generatedSchedules) {
				for (const userId of schedule.userIds) {
					counts[userId] = (counts[userId] || 0) + 1;
					assignedIds.add(userId);
				}
			}
			assignmentCounts = counts;

			unassignedUsers = data.users.filter(
				(u) => selectedUserIds.has(u.id) && !assignedIds.has(u.id)
			);
		}
	}

	// Fungsi untuk memilih/membatalkan semua user
	function toggleSelectAll(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.checked) {
			selectedUserIds = new Set(data.users.map((u) => u.id));
		} else {
			selectedUserIds = new Set();
		}
	}

	// Logika reaktif untuk status indeterminate checkbox "Pilih Semua"
	$: if (selectAllCheckbox) {
		const numUsers = selectedUserIds.size;
		const totalUsers = data.users.length;
		if (numUsers > 0 && numUsers < totalUsers) {
			selectAllCheckbox.indeterminate = true;
			selectAllCheckbox.checked = false;
		} else {
			selectAllCheckbox.indeterminate = false;
			selectAllCheckbox.checked = numUsers === totalUsers && totalUsers > 0;
		}
	}

	// Fungsi untuk menghasilkan kerangka jadwal
	function generateScheduleSlots() {
		if (selectedUserIds.size === 0 || periodCount <= 0 || periodDuration <= 0) {
			toastError('Pilih minimal satu pengguna dan pastikan pengaturan periode valid.');
			return;
		}

		generatedSchedules = [];
		let currentStartDate = new Date(startDate);

		for (let i = 1; i <= periodCount; i++) {
			const endDate = new Date(currentStartDate);
			if (periodUnit === 'days') {
				endDate.setDate(endDate.getDate() + periodDuration - 1);
			} else if (periodUnit === 'weeks') {
				endDate.setDate(endDate.getDate() + periodDuration * 7 - 1);
			} else if (periodUnit === 'months') {
				endDate.setMonth(endDate.getMonth() + periodDuration);
				endDate.setDate(endDate.getDate() - 1);
			}

			generatedSchedules.push({
				period: i,
				startDate: new Date(currentStartDate),
				endDate: new Date(endDate),
				userIds: []
			});

			if (periodUnit === 'days') {
				currentStartDate.setDate(currentStartDate.getDate() + periodDuration);
			} else if (periodUnit === 'weeks') {
				currentStartDate.setDate(currentStartDate.getDate() + periodDuration * 7);
			} else if (periodUnit === 'months') {
				currentStartDate.setMonth(currentStartDate.getMonth() + periodDuration);
			}
		}
		randomizeSchedules(true);
		currentStep = 2;
	}

	// Fungsi untuk mengacak jadwal
	function randomizeSchedules(isInitialGeneration = false) {
		if (!isInitialGeneration && generatedSchedules.length === 0) {
			toastError('Silakan buat kerangka jadwal terlebih dahulu.');
			return;
		}

		let availableUsers = [...data.users.filter((u) => selectedUserIds.has(u.id))];
		for (let i = availableUsers.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[availableUsers[i], availableUsers[j]] = [availableUsers[j], availableUsers[i]];
		}

		const numUsers = availableUsers.length;
		const numPeriods = generatedSchedules.length;

		generatedSchedules.forEach((s) => (s.userIds = []));

		if (numUsers >= numPeriods) {
			for (let i = 0; i < numUsers; i++) {
				generatedSchedules[i % numPeriods].userIds.push(availableUsers[i].id);
			}
		} else {
			for (let i = 0; i < numPeriods; i++) {
				generatedSchedules[i].userIds.push(availableUsers[i % numUsers].id);
			}
		}
		generatedSchedules = [...generatedSchedules];
	}

	// Fungsi untuk mereset semua state
	function resetAll() {
		selectedUserIds = new Set();
		periodCount = 12;
		periodDuration = 1;
		periodUnit = 'months';
		startDate = new Date().toISOString().split('T')[0];
		generatedSchedules = [];
		currentStep = 1;
	}

	// Fungsi untuk menyimpan jadwal ke server
	async function saveRotationSchedule() {
		const schedulesToSave = generatedSchedules.flatMap((schedule) =>
			schedule.userIds.map((userId) => ({
				userId: userId,
				startDate: schedule.startDate,
				endDate: schedule.endDate
			}))
		);

		if (schedulesToSave.length === 0) {
			toastError('Tidak ada jadwal untuk disimpan.');
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

	// --- Logika Modal ---
	function openUserSelectionModal(index: number) {
		editingPeriodIndex = index;
		modalSelectedUserIds = new Set(generatedSchedules[index].userIds);
		showUserSelectionModal = true;
	}

	function saveModalSelection() {
		if (editingPeriodIndex !== null) {
			generatedSchedules[editingPeriodIndex].userIds = Array.from(modalSelectedUserIds);
			generatedSchedules = [...generatedSchedules]; // Trigger reactivity
		}
		closeModal();
	}

	function closeModal() {
		showUserSelectionModal = false;
		editingPeriodIndex = null;
		modalSelectedUserIds.clear();
	}

	// Helper
	function formatDate(date: Date) {
		return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
	}
	function getUsername(userId: string) {
		return data.users.find((u) => u.id === userId)?.username || 'N/A';
	}
</script>

<svelte:head>
	<title>Susun Jadwal Piket</title>
</svelte:head>

<div class="min-h-screen bg-base-200 p-4">
	<div class="container mx-auto">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
			<h1 class="text-3xl font-bold text-base-content">Susun Jadwal Piket Satu Putaran</h1>
			<button class="btn btn-outline gap-2" on:click={resetAll}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="h-5 w-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.664 0l3.181-3.183m-4.991-2.695v-2.257a2.25 2.25 0 00-2.25-2.25H10.5a2.25 2.25 0 00-2.25 2.25v2.257m1.5-10.125a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-1.5h-2.25a.75.75 0 01-.75-.75v-1.5zm-2.25 9.75a.75.75 0 01.75-.75h3.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-1.5h-2.25a.75.75 0 01-.75-.75v-1.5z"
					/>
				</svg>
				Mulai Ulang
			</button>
		</div>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body p-6">
				<ul class="steps mb-6">
					<li class="step" class:step-primary={currentStep >= 1}>Pengaturan</li>
					<li class="step" class:step-primary={currentStep >= 2}>Penyusunan</li>
					<li class="step">Simpan</li>
				</ul>

				{#if currentStep === 1}
					<div class="space-y-6">
						<div>
							<h3 class="mb-3 font-semibold text-base-content">
								Pilih Pengguna untuk Putaran Ini
								<span class="ml-4 text-sm font-normal text-gray-500"
									>({selectedUserIds.size} member terpilih)</span
								>
							</h3>
							<div class="rounded-lg border border-base-300 bg-base-200/30 p-4">
								<div class="mb-4 flex items-center">
									<input
										type="checkbox"
										id="selectAll"
										on:change={toggleSelectAll}
										class="checkbox checkbox-primary"
										bind:this={selectAllCheckbox}
									/>
									<label for="selectAll" class="ml-3 font-medium">Pilih Semua</label>
								</div>
								<div
									class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
								>
									{#each data.users as user}
										<div>
											<label class="flex cursor-pointer items-center">
												<input
													type="checkbox"
													class="checkbox"
													checked={selectedUserIds.has(user.id)}
													on:change={() => {
														selectedUserIds.has(user.id)
															? selectedUserIds.delete(user.id)
															: selectedUserIds.add(user.id);
														selectedUserIds = selectedUserIds;
													}}
												/>
												<span class="ml-3 text-base-content">{user.username}</span>
											</label>
										</div>
									{/each}
								</div>
							</div>
						</div>

						{#if feedbackMessage}
							<div
								class="flex items-center gap-3 rounded-lg bg-base-200/60 p-3 text-sm text-base-content/80"
								transition:slide
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-6 w-6 flex-shrink-0"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
									/>
								</svg>
								<span>{feedbackMessage}</span>
							</div>
						{/if}

						<div class="grid grid-cols-1 gap-6 md:grid-cols-3">
							<div class="form-control">
								<label for="periodCount" class="label"
									><span class="label-text">Jumlah Periode</span></label
								>
								<input
									type="number"
									id="periodCount"
									class="input input-bordered w-full"
									bind:value={periodCount}
									min="1"
								/>
							</div>
							<div class="form-control">
								<label for="periodDuration" class="label"
									><span class="label-text">Durasi per Periode</span></label
								>
								<div class="join w-full">
									<input
										type="number"
										id="periodDuration"
										class="input input-bordered join-item w-1/3"
										bind:value={periodDuration}
										min="1"
									/>
									<select bind:value={periodUnit} class="select select-bordered join-item flex-1">
										<option value="days">Hari</option>
										<option value="weeks">Minggu</option>
										<option value="months">Bulan</option>
									</select>
								</div>
							</div>
							<div class="form-control">
								<label for="startDate" class="label"
									><span class="label-text">Tanggal Mulai Putaran</span></label
								>
								<input
									type="date"
									id="startDate"
									class="input input-bordered w-full"
									bind:value={startDate}
								/>
							</div>
						</div>
						<div class="card-actions mt-4 justify-end">
							<button class="btn btn-primary" on:click={generateScheduleSlots}>Lanjut: Susun Jadwal</button>
						</div>
					</div>
				{/if}

				{#if currentStep === 2}
					<div>
						<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
							<p>Sesuaikan petugas untuk setiap periode di bawah ini.</p>
							<button class="btn btn-secondary" on:click={() => randomizeSchedules(false)}
								>Acak Ulang</button
							>
						</div>

						<div class="overflow-x-auto">
							<table class="table w-full">
								<thead>
									<tr>
										<th>Periode</th>
										<th>Tanggal Mulai</th>
										<th>Tanggal Selesai</th>
										<th>Petugas</th>
										<th class="w-1">Aksi</th>
									</tr>
								</thead>
								<tbody
									>{#each generatedSchedules as schedule, i (schedule.period)}
										<tr animate:flip={{ duration: 300 }}>
											<td>{schedule.period}</td>
											<td>{formatDate(schedule.startDate)}</td>
											<td>{formatDate(schedule.endDate)}</td>
											<td>
												{#if schedule.userIds.length > 0}
													<div class="flex flex-wrap gap-1">
														{#each schedule.userIds as userId}
															<span class="badge badge-ghost">{getUsername(userId)}</span>
														{/each}
													</div>
												{:else}
													<span class="text-error">Belum ditugaskan</span>
												{/if}
											</td>
											<td>
												<button class="btn btn-sm btn-ghost" on:click={() => openUserSelectionModal(i)}
													>Ubah</button
												>
											</td>
										</tr>
									{/each}</tbody
								>
							</table>
						</div>

						<!-- Panel Status Penugasan -->
						{#if unassignedUsers.length > 0 || Object.values(assignmentCounts).some((count) => count > 1)}
							{@const multiTurnUsers = Object.entries(assignmentCounts).filter(
								([, count]) => count > 1
							)}
							<div class="mt-6 space-y-4 rounded-lg bg-base-200/60 p-4">
								<h4 class="font-semibold">Status Penugasan</h4>
								{#if multiTurnUsers.length > 0}
									<div class="text-sm">
										<p class="font-medium text-warning-content">Mendapat >1 giliran:</p>
										<ul class="list-inside list-disc">
											{#each multiTurnUsers as [userId, count]}
												<li>{getUsername(userId)} ({count} kali)</li>
											{/each}
										</ul>
									</div>
								{/if}
								{#if unassignedUsers.length > 0}
									<div class="text-sm">
										<p class="font-medium text-error-content">Belum mendapat giliran:</p>
										<ul class="list-inside list-disc">
											{#each unassignedUsers as user}
												<li>{user.username}</li>
											{/each}
										</ul>
									</div>
								{/if}
							</div>
						{/if}

						<div class="card-actions mt-6 justify-between">
							<button class="btn btn-warning" on:click={() => (currentStep = 1)}>Kembali</button>
							<button class="btn btn-success" on:click={saveRotationSchedule}
								>Simpan Jadwal Putaran</button
							>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Modal Pemilihan Pengguna -->
{#if showUserSelectionModal}
	<div class="modal modal-open">
		<div class="modal-box">
			<h3 class="text-lg font-bold">
				Pilih Petugas untuk Periode {editingPeriodIndex !== null
					? generatedSchedules[editingPeriodIndex].period
					: ''}
			</h3>
			<div class="py-4">
				<div class="grid grid-cols-2 gap-2">
					{#each data.users.filter((u) => selectedUserIds.has(u.id)) as user}
						<label class="flex cursor-pointer items-center space-x-3">
							<input
								type="checkbox"
								class="checkbox"
								checked={modalSelectedUserIds.has(user.id)}
								on:change={() => {
									modalSelectedUserIds.has(user.id)
										? modalSelectedUserIds.delete(user.id)
										: modalSelectedUserIds.add(user.id);
									modalSelectedUserIds = modalSelectedUserIds;
								}}
							/>
							<span class="label-text">{user.username}</span>
						</label>
					{/each}
				</div>
			</div>
			<div class="modal-action">
				<button class="btn btn-ghost" on:click={closeModal}>Batal</button>
				<button class="btn btn-primary" on:click={saveModalSelection}>Simpan</button>
			</div>
		</div>
	</div>
{/if}