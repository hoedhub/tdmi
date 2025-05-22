<script lang="ts">
	// No script logic needed for this basic placeholder page
</script>

<div class="container mx-auto p-4">
	<h1 class="mb-6 text-2xl font-bold">Admin Dashboard Overview</h1>

	<!-- User Statistics Section -->
	<div class="stats mb-6 shadow">
		<div class="stat">
			<div class="stat-title">Total Users</div>
			<div class="stat-value">5,000</div>
			<div class="stat-desc">Overall user count</div>
		</div>

		<div class="stat">
			<div class="stat-title">New Users This Week</div>
			<div class="stat-value">150</div>
			<div class="stat-desc">Since last Monday</div>
		</div>

		<div class="stat">
			<div class="stat-title">Active Users</div>
			<div class="stat-value">800</div>
			<div class="stat-desc">Currently online</div>
		</div>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Placeholder Card 1 -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">Users Overview</h2>
				<p>Quick stats about user activity.</p>
				<div class="stats stats-vertical mt-4 shadow lg:stats-horizontal">
					<div class="stat">
						<div class="stat-title">Total Users</div>
						<div class="stat-value">1,200</div>
						<div class="stat-desc">Jan 1st - Feb 1st</div>
					</div>

					<div class="stat">
						<div class="stat-title">New Users</div>
						<div class="stat-value">400</div>
						<div class="stat-desc">↗︎ 400 (22%)</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Placeholder Card 3 (Example using a different component idea) -->
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<h2 class="card-title">System Status</h2>
				<p>Current health of key services.</p>
				<div class="mt-4">
					<div class="mb-2 flex items-center justify-between">
						<span>Database</span>
						<span class="badge badge-success">Operational</span>
					</div>
					<div class="mb-2 flex items-center justify-between">
						<span>API Service</span>
						<span class="badge badge-success">Operational</span>
					</div>
					<div class="flex items-center justify-between">
						<span>Background Jobs</span>
						<span class="badge badge-warning">Degraded</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- Recent Activity Section -->
	<div class="mb-6">
		<h2 class="mb-4 text-xl font-semibold">Recent Activity</h2>
		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<div class="overflow-x-auto">
					<table class="table w-full">
						<thead>
							<tr>
								<th>Event</th>
								<th>User</th>
								<th>Time</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>User Login</td>
								<td>Alice</td>
								<td>2 hours ago</td>
							</tr>
							<tr>
								<td>Product Update</td>
								<td>Bob</td>
								<td>5 hours ago</td>
							</tr>
							<tr>
								<td>Report Generated</td>
								<td>Charlie</td>
								<td>1 day ago</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Links Section -->
	<div class="mb-6">
		<h2 class="mb-4 text-xl font-semibold">Quick Links</h2>
		<div class="flex flex-wrap gap-4">
			<a href="/admin/users" class="btn btn-primary">User Management</a>
			<a href="/admin" class="btn btn-secondary">Dashboard</a>
			<!-- Add more links as needed -->
		</div>
	</div>
</div>
