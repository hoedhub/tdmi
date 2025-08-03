<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="p-4">
	<h1 class="text-2xl font-bold">Selamat datang, {$page.data.user.username}!</h1>
	<p>Silakan pilih halaman dari sidebar untuk memulai.</p>
</div>
