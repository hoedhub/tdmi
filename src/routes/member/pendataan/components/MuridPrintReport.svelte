<script lang="ts">
	interface Props {
		nationalStats: any;
		topProvinces: any[];
		modeTotal: number;
		othersCount: number;
		mapViewMode: string;
		mapLabels: Record<string, string>;
		topColors: string[];
		paths: any[];
		mapData: any[];
	}

	let {
		nationalStats,
		topProvinces,
		modeTotal,
		othersCount,
		mapViewMode,
		mapLabels,
		topColors,
		paths,
		mapData
	}: Props = $props();

	const today = new Date();

	const pdfColors = {
		sea: '#f0f4f8',
		landEmpty: '#e2e8f0',
		border: '#94a3b8',
		p1: '#dbeafe',
		p2: '#93c5fd',
		p3: '#3b82f6',
		p4: '#1d4ed8',
		p5: '#1e3a8a',
		m1: '#0ea5e9',
		m2: '#f59e0b',
		m3: '#10b981'
	};

	function getPdfProvinceColor(count: number) {
		if (count === 0) return pdfColors.landEmpty;
		const maxCount = Math.max(...mapData.map((p) => p.count), 1);
		const ratio = count / maxCount;
		if (ratio < 0.15) return pdfColors.p1;
		if (ratio < 0.4) return pdfColors.p2;
		if (ratio < 0.7) return pdfColors.p3;
		if (ratio < 0.9) return pdfColors.p4;
		return pdfColors.p5;
	}

	function getCount(name: string) {
		return mapData.find(p => p.propinsi.toUpperCase() === name.toUpperCase())?.count || 0;
	}
</script>

<div id="murid-pdf-report" class="report">
		<!-- HEADER -->
		<div class="header">
			<div class="header-left">
				<img src="/logo-tdmi.jpg" alt="Logo TDMI" class="logo" />
				<div class="header-title">
					<h1 class="title">Laporan Sebaran Strategis</h1>
					<p class="subtitle">Sistem Manajemen Murid TDMI</p>
				</div>
			</div>
			<div class="header-right">
				<div class="meta-item">
					<span class="meta-label">Tanggal Cetak</span>
					<span class="meta-value">{today.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</span>
				</div>
				<div class="meta-item">
					<span class="meta-label">ID Dokumen</span>
					<span class="meta-value">TDMI-{today.getTime()}</span>
				</div>
			</div>
		</div>

		<!-- INFO BAR -->
		<div class="info-bar">
			<div class="info-item">
				<span class="info-label">Parameter Analisis</span>
				<span class="info-value">{mapLabels[mapViewMode]}</span>
			</div>
			<div class="info-divider"></div>
			<div class="info-item">
				<span class="info-label">Cakupan Wilayah</span>
				<span class="info-value">Nasional — 38 Provinsi</span>
			</div>
			<div class="info-divider"></div>
			<div class="info-item">
				<span class="info-label">Total Data</span>
				<span class="info-value">{modeTotal.toLocaleString('id-ID')} Murid</span>
			</div>
		</div>

		<!-- MAP SECTION -->
		<div class="map-section">
			<h2 class="section-title">Visualisasi Sebaran Wilayah</h2>
			<div class="map-container">
				<svg viewBox="0 0 850 380" class="map-svg">
					<rect width="850" height="380" fill="{pdfColors.sea}" />
					<g transform="translate(30, 20)">
						{#each paths as p}
							{@const count = getCount(p.name)}
							<path
								d={p.d.replace(/NaN\w*/g, '0')}
								fill={getPdfProvinceColor(count)}
								stroke={pdfColors.border}
								stroke-width="0.5"
							/>
						{/each}
					</g>
				</svg>
			</div>
		</div>

		<!-- CONTENT GRID -->
		<div class="content-grid">
			<div class="content-left">
				<div class="card">
					<h3 class="card-title accent-indigo">Ringkasan Nasional</h3>
					<div class="stats-grid">
						<div class="stat-box stat-purple">
							<p class="stat-label">Total Murid</p>
							<p class="stat-value">{nationalStats.total}</p>
						</div>
						<div class="stat-box stat-pink">
							<p class="stat-label">Rasio Pria/Wanita</p>
							<p class="stat-value">{(nationalStats.pria / (nationalStats.wanita || 1)).toFixed(2)}</p>
						</div>
						<div class="stat-box stat-blue">
							<p class="stat-label">Total Pria</p>
							<p class="stat-value">{nationalStats.pria}</p>
						</div>
						<div class="stat-box stat-teal">
							<p class="stat-label">Total Wanita</p>
							<p class="stat-value">{nationalStats.wanita}</p>
						</div>
					</div>
				</div>

				<div class="card">
					<h3 class="card-title accent-green">Distribusi Marhalah</h3>
					<div class="marhalah-container">
						<div class="progress-bar">
							<div class="progress-segment progress-m1" style="width: {((nationalStats.m1 / (nationalStats.total || 1)) * 100).toFixed(1)}%"></div>
							<div class="progress-segment progress-m2" style="width: {((nationalStats.m2 / (nationalStats.total || 1)) * 100).toFixed(1)}%"></div>
							<div class="progress-segment progress-m3" style="width: {((nationalStats.m3 / (nationalStats.total || 1)) * 100).toFixed(1)}%"></div>
						</div>
						<div class="marhalah-legend">
							<div class="legend-item">
								<div class="legend-dot dot-m1"></div>
								<div>
									<p class="legend-label">Marhalah 1</p>
									<p class="legend-value" style="color: #0ea5e9;">{((nationalStats.m1 / (nationalStats.total || 1)) * 100).toFixed(0)}%</p>
								</div>
							</div>
							<div class="legend-item">
								<div class="legend-dot dot-m2"></div>
								<div>
									<p class="legend-label">Marhalah 2</p>
									<p class="legend-value" style="color: #f59e0b;">{((nationalStats.m2 / (nationalStats.total || 1)) * 100).toFixed(0)}%</p>
								</div>
							</div>
							<div class="legend-item">
								<div class="legend-dot dot-m3"></div>
								<div>
									<p class="legend-label">Marhalah 3</p>
									<p class="legend-value" style="color: #10b981;">{((nationalStats.m3 / (nationalStats.total || 1)) * 100).toFixed(0)}%</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="content-right">
				<div class="card">
					<h3 class="card-title accent-dark">Top Wilayah</h3>
					<table class="top-table">
						<thead>
							<tr>
								<th class="th-rank">#</th>
								<th class="th-name">Provinsi</th>
								<th class="th-count">Jumlah</th>
								<th class="th-pct">%</th>
							</tr>
						</thead>
						<tbody>
							{#each topProvinces as p, i}
								<tr class="top-row">
									<td class="td-rank">
										<span class="rank-badge" style="background-color: {topColors[i]}">{i + 1}</span>
									</td>
									<td class="td-name">{p.propinsi}</td>
									<td class="td-count">{p[mapViewMode]}</td>
									<td class="td-pct">{((p[mapViewMode] / modeTotal) * 100).toFixed(1)}%</td>
								</tr>
							{/each}
							{#if othersCount > 0}
								<tr class="top-row top-row-other">
									<td class="td-rank"><span class="rank-badge rank-other">...</span></td>
									<td class="td-name">Wilayah Lainnya</td>
									<td class="td-count">{othersCount}</td>
									<td class="td-pct">{((othersCount / modeTotal) * 100).toFixed(1)}%</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>
			</div>
		</div>

		<!-- FOOTER -->
		<div class="footer">
			<p class="footer-left">* Dokumen Resmi Internal TDMI — Bersifat Rahasia</p>
			<p class="footer-right">Dicetak otomatis oleh Sistem Manajemen TDMI</p>
		</div>
</div>

<style>
	.report {
		padding: 12px 16px;
		font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
		background: #ffffff;
		color: #1e293b;
		line-height: 1.4;
		width: 190mm;
		box-sizing: border-box;
		margin: 0 auto;
	}

	/* HEADER */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		border-bottom: 2px solid #1e293b;
		padding-bottom: 10px;
		margin-bottom: 12px;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.logo {
		width: 44px;
		height: 44px;
		border-radius: 6px;
	}

	.title {
		margin: 0;
		font-size: 16px;
		font-weight: 800;
		color: #1e293b;
		letter-spacing: 0.3px;
		text-transform: uppercase;
	}

	.subtitle {
		margin: 1px 0 0;
		font-size: 11px;
		color: #64748b;
		font-weight: 500;
	}

	.header-right {
		text-align: right;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.meta-label {
		font-size: 8px;
		font-weight: 700;
		text-transform: uppercase;
		color: #94a3b8;
		letter-spacing: 0.3px;
	}

	.meta-value {
		font-size: 10px;
		color: #475569;
	}

	/* INFO BAR */
	.info-bar {
		display: flex;
		align-items: center;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
		padding: 8px 14px;
		margin-bottom: 12px;
	}

	.info-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.info-label {
		font-size: 8px;
		font-weight: 700;
		text-transform: uppercase;
		color: #94a3b8;
		letter-spacing: 0.3px;
	}

	.info-value {
		font-size: 11px;
		font-weight: 700;
		color: #1e293b;
	}

	.info-divider {
		width: 1px;
		height: 28px;
		background: #e2e8f0;
		margin: 0 14px;
	}

	/* MAP */
	.map-section {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		background: #f8fafc;
		padding: 10px;
		margin-bottom: 12px;
		text-align: center;
	}

	.section-title {
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		color: #94a3b8;
		margin: 0 0 6px;
		letter-spacing: 0.8px;
	}

	.map-container {
		display: flex;
		justify-content: center;
	}

	.map-svg {
		width: 100%;
		max-width: 520px;
	}

	/* CONTENT GRID */
	.content-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 24px;
	}

	.content-left,
	.content-right {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	/* CARDS */
	.card {
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 12px;
		background: #ffffff;
	}

	.card-title {
		font-size: 10px;
		font-weight: 800;
		text-transform: uppercase;
		padding-left: 10px;
		margin: 0 0 10px;
		letter-spacing: 0.3px;
		color: #1e293b;
	}

	.accent-indigo { border-left: 3px solid #4f46e5; }
	.accent-green { border-left: 3px solid #059669; }
	.accent-dark { border-left: 3px solid #1e293b; }

	/* STATS */
	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
	}

	.stat-box {
		padding: 8px;
		border-radius: 6px;
		border: 1px solid;
		text-align: center;
	}

	.stat-purple { background: #eef2ff; border-color: #e0e7ff; }
	.stat-pink { background: #fdf2f8; border-color: #fce7f3; }
	.stat-blue { background: #eff6ff; border-color: #dbeafe; }
	.stat-teal { background: #f0fdfa; border-color: #ccfbf1; }

	.stat-label {
		font-size: 8px;
		font-weight: 700;
		text-transform: uppercase;
		color: #64748b;
		margin: 0 0 2px;
		letter-spacing: 0.2px;
	}

	.stat-value {
		font-size: 18px;
		font-weight: 900;
		margin: 0;
	}

	.stat-purple .stat-value { color: #312e81; }
	.stat-pink .stat-value { color: #831843; }
	.stat-blue .stat-value { color: #1e40af; }
	.stat-teal .stat-value { color: #065f46; }

	/* MARHALAH */
	.marhalah-container {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.progress-bar {
		display: flex;
		height: 10px;
		width: 100%;
		border-radius: 9999px;
		overflow: hidden;
		background: #e2e8f0;
	}

	.progress-m1 { background: #0ea5e9; }
	.progress-m2 { background: #f59e0b; }
	.progress-m3 { background: #10b981; }

	.marhalah-legend {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 4px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.legend-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.dot-m1 { background: #0ea5e9; }
	.dot-m2 { background: #f59e0b; }
	.dot-m3 { background: #10b981; }

	.legend-label {
		font-size: 9px;
		color: #64748b;
		margin: 0;
		font-weight: 500;
	}

	.legend-value {
		font-size: 12px;
		font-weight: 900;
		margin: 0;
	}

	/* TABLE */
	.top-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 11px;
	}

	.top-table th {
		padding: 6px 4px;
		font-size: 8px;
		font-weight: 700;
		color: #94a3b8;
		text-transform: uppercase;
		letter-spacing: 0.3px;
		border-bottom: 2px solid #e2e8f0;
	}

	.th-rank { width: 28px; text-align: center; }
	.th-name { text-align: left; }
	.th-count { text-align: right; width: 50px; }
	.th-pct { text-align: right; width: 40px; }

	.top-row { border-bottom: 1px solid #f1f5f9; }
	.top-row:last-child { border-bottom: none; }
	.top-row td { padding: 6px 4px; }

	.td-rank { text-align: center; }

	.rank-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		border-radius: 4px;
		color: #ffffff;
		font-size: 9px;
		font-weight: 800;
	}

	.rank-other {
		background: #cbd5e1;
		font-size: 12px;
		line-height: 1;
	}

	.td-name { font-weight: 600; color: #1e293b; }
	.td-count { text-align: right; font-weight: 700; color: #334155; }
	.td-pct { text-align: right; color: #94a3b8; font-weight: 600; }

	.top-row-other td { color: #94a3b8; font-style: italic; }
	.top-row-other .td-name { color: #94a3b8; }

	/* FOOTER */
	.footer {
		padding-top: 8px;
		border-top: 1px solid #e2e8f0;
		font-size: 8px;
		color: #94a3b8;
		display: flex;
		justify-content: space-between;
		font-style: italic;
	}

	.footer-left,
	.footer-right {
		margin: 0;
	}
</style>
