<script lang="ts">
	// This page will contain the change password feature.
	// Later, other profile editing features can be added here.
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Edit Profile</h1>
	<h2 class="mb-6 text-xl font-semibold">Change Password</h2>

	<div class="card w-full max-w-md bg-base-100 shadow-xl">
		<form class="card-body">
			<div class="form-control">
				<label for="current-password" class="label">
					<span class="label-text">Current Password</span>
				</label>
				<input
					type="password"
					id="current-password"
					name="currentPassword"
					class="input input-bordered w-full"
					required
				/>
			</div>

			<div class="form-control">
				<label for="new-password" class="label">
					<span class="label-text">New Password</span>
				</label>
				<input
					type="password"
					id="new-password"
					name="newPassword"
					class="input input-bordered w-full"
					required
				/>
			</div>

			<div class="form-control">
				<label for="confirm-password" class="label">
					<span class="label-text">Confirm New Password</span>
				</label>
				<input
					type="password"
					id="confirm-password"
					name="confirmPassword"
					class="input input-bordered w-full"
					required
				/>
			</div>

			<div class="card-actions mt-6 justify-end">
				<button type="submit" class="btn btn-primary"> Change Password </button>
			</div>
		</form>
	</div>
</div>
