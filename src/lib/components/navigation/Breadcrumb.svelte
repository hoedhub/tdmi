<script lang="ts">
	import { page } from '$app/stores';

	const labelMap: Record<string, string> = {
		admin: 'Admin',
		users: 'Manajemen Pengguna',
		rbac: 'RBAC',
		'error-logs': 'Error Logs',
		backup: 'Backup',
		piket: 'Jadwal Ruasa\'',
		susun: 'Susun Jadwal',
		member: 'Member',
		pendataan: 'Pendataan',
		'nasyath_mun': 'Nasyath MUN',
		'ayyu-sual': 'Ayyu Su\'aal',
		profile: 'Profil',
		new: 'Baru',
		edit: 'Edit',
		delete: 'Hapus',
		jaringan: 'Jaringan',
		login: 'Login',
		tanya: 'Tanya',
		settings: 'Pengaturan',
	};

	function getLabel(segment: string): string {
		if (labelMap[segment]) return labelMap[segment];
		if (/^\d+$/.test(segment)) return 'Detail';
		return segment.charAt(0).toUpperCase() + segment.slice(1);
	}

	let segments = $derived.by(() => {
		const path = $page.url.pathname.replace(/\/$/, '');
		if (!path || path === '/') return [];
		const parts = path.split('/').filter(Boolean);
		return parts.map((part, i) => ({
			label: getLabel(part),
			href: '/' + parts.slice(0, i + 1).join('/')
		}));
	});
</script>

{#if segments.length > 0}
	<nav aria-label="Breadcrumb" class="breadcrumbs text-sm">
		<ol>
			<li><a href="/">Home</a></li>
			{#each segments as seg, i}
				<li>
					{#if i < segments.length - 1}
						<a href={seg.href}>{seg.label}</a>
					{:else}
						<span class="font-medium">{seg.label}</span>
					{/if}
				</li>
			{/each}
		</ol>
	</nav>
{/if}
