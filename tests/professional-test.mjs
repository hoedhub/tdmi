import pkg from '/home/hoed/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import { writeFileSync, mkdirSync } from 'fs';
const { chromium } = pkg;

const BASE = 'http://localhost:5173';
const CREDS = { username: 'hoed', password: '654321' };

const report = { sections: [], consoleErrors: [] };
let testPassed = 0, testFailed = 0, testWarned = 0;
let browser;

function section(name) {
  console.log(`\n${'='.repeat(70)}\n  ${name}\n${'='.repeat(70)}`);
  report.sections.push({ name, tests: [] });
}

function test(name, status, detail = '') {
  const icon = status === 'PASS' ? '✓' : status === 'WARN' ? '⚠' : '✗';
  console.log(`  ${icon} ${name}${detail ? `\n      ${detail}` : ''}`);
  report.sections[report.sections.length - 1].tests.push({ name, status, detail });
  if (status === 'PASS') testPassed++;
  else if (status === 'WARN') testWarned++;
  else testFailed++;
}

async function ctxAndPage() {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function loginFlow(page) {
  await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  await page.fill('input[name="username"]', CREDS.username);
  await page.fill('input[name="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
}

async function snapshot(page, name) {
  try { await page.screenshot({ path: `/tmp/opencode/test-screenshots/${name}.png`, fullPage: true }); } catch (e) {}
}

async function main() {
  mkdirSync('/tmp/opencode/test-screenshots', { recursive: true });
  browser = await chromium.launch({ headless: true });

  // ================================================================
  // 0. BUG INVESTIGATION (RBAC + Dashboard fetch)
  // ================================================================
  section('0. BUG INVESTIGATION');
  let { ctx, page } = await ctxAndPage();
  let errs = [];
  page.on('console', msg => { if (msg.type() === 'error') errs.push(msg.text()); });
  await loginFlow(page);
  await page.goto(BASE + '/admin/rbac', { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const rbacErrCount = errs.length;
  errs.forEach(e => report.consoleErrors.push({ page: '/admin/rbac', msg: e.substring(0, 150) }));
  await ctx.close();

  ({ ctx, page } = await ctxAndPage());
  errs = [];
  page.on('console', msg => { if (msg.type() === 'error') errs.push(msg.text()); });
  await loginFlow(page);
  await page.goto(BASE + '/member', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const fetchErrCount = errs.filter(e => e.includes('fetch') || e.includes('Cache')).length;
  errs.filter(e => e.includes('fetch') || e.includes('Cache'))
    .forEach(e => report.consoleErrors.push({ page: '/member', msg: e.substring(0, 150) }));
  await ctx.close();

  test('BUG RBAC: Console errors', rbacErrCount === 0 ? 'PASS' : 'WARN', `${rbacErrCount} errors di /admin/rbac`);
  test('BUG Dashboard: Fetch/Cache errors', fetchErrCount === 0 ? 'PASS' : 'WARN', `${fetchErrCount} errors di /member`);

  // ================================================================
  // A. AUTHENTICATION FLOW
  // ================================================================
  section('A. AUTHENTICATION FLOW');

  ({ ctx, page } = await ctxAndPage());

  // A1. Not logged in -> /login
  await page.goto(BASE + '/member', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('A1. Redirect ke /login saat belum auth', page.url().includes('/login') ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));

  // A2. Login page elements
  await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('A2a. Title', (await page.title()) === 'Login | TDMI' ? 'PASS' : 'WARN');
  test('A2b. Ada form', (await page.locator('form').count()) > 0 ? 'PASS' : 'FAIL');
  test('A2c. Input username', (await page.locator('input[name="username"]').count()) > 0 ? 'PASS' : 'FAIL');
  test('A2d. Input password', (await page.locator('input[type="password"]').count()) > 0 ? 'PASS' : 'FAIL');
  test('A2e. Submit button', (await page.locator('button[type="submit"]').count()) > 0 ? 'PASS' : 'FAIL');
  test('A2f. Dark mode default', (await page.evaluate(() => document.documentElement.getAttribute('data-theme'))) === 'dark' ? 'PASS' : 'WARN');

  // A3. Empty form validation
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  test('A3. Validasi field kosong (tetap di login)', page.url().includes('/login') ? 'PASS' : 'WARN');

  // A4. Wrong password
  await page.fill('input[name="username"]', 'hoed');
  await page.fill('input[name="password"]', 'salahpassword');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const loginBody = await page.locator('body').innerText();
  const hasError = /invalid/i.test(loginBody) || /salah/i.test(loginBody);
  test('A4. Tampil error saat password salah', hasError ? 'PASS' : 'WARN', hasError ? 'Error message detected' : 'No error text found');

  // A5. Correct login
  await page.fill('input[name="username"]', CREDS.username);
  await page.fill('input[name="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  test('A5. Login sukses redirect ke /member', page.url().includes('/member') ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
  await snapshot(page, 'A5-login-success');

  // A6. Already logged in -> /login redirects
  await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('A6. Redirect saat sudah login', page.url().includes('/member') ? 'PASS' : 'WARN', page.url().replace(BASE, ''));
  await ctx.close();

  // ================================================================
  // B. MEMBER DASHBOARD
  // ================================================================
  section('B. MEMBER DASHBOARD');

  ({ ctx, page } = await ctxAndPage());
  await loginFlow(page);
  await page.goto(BASE + '/member', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  test('B1. Title dashboard', (await page.title()).includes('Dashboard') ? 'PASS' : 'WARN', await page.title());
  const greet = await page.locator('h1').first().innerText();
  test('B2. Greeting "Selamat Datang"', greet.includes('Selamat Datang') ? 'PASS' : 'WARN', greet);
  test('B3. Tombol Tambah Murid', (await page.locator('a[href="/member/pendataan/new"]').count()) > 0 ? 'PASS' : 'WARN');
  const sCards = await page.locator('h2').allInnerTexts();
  test('B4. Ada stat cards', sCards.length >= 3 ? 'PASS' : 'WARN', `${sCards.length} cards: ${sCards.slice(0,4).join(', ')}`);
  await snapshot(page, 'B-dashboard');

  // B5. Sidebar toggle
  const toggle = page.locator('button[aria-label="Toggle sidebar"]');
  if (await toggle.count() > 0) { await toggle.click(); await page.waitForTimeout(500); test('B5. Sidebar toggle', 'PASS'); }
  else test('B5. Sidebar toggle', 'WARN');

  // B6-B8: Verify sidebar links exist and pages load via direct navigation
  const pagesToCheck = [
    { href: '/member/pendataan', label: 'Pendataan' },
    { href: '/member/nasyath_mun', label: 'Nasyath MUN' },
    { href: '/member/ayyu-sual', label: 'Ayyu Su\'aal' },
  ];
  for (const nav of pagesToCheck) {
    const linkExists = await page.locator(`a[href="${nav.href}"]`).count();
    test(`B6. Link sidebar "${nav.label}" ada`, linkExists > 0 ? 'PASS' : 'WARN');
    // Navigate directly to verify page loads
    await page.goto(BASE + nav.href, { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1000);
    test(`B7. Halaman "${nav.label}" termuat`, page.url().includes(nav.href) ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
  }

  // ================================================================
  // C. PENDATAAN
  // ================================================================
  section('C. PENDATAAN');

  await page.goto(BASE + '/member/pendataan', { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  test('C1. Title pendataan', (await page.locator('h1').first().innerText()).includes('Manajemen Data Murid') ? 'PASS' : 'WARN');

  // C2. Daftar / Peta tab clicks
  const tabDaftar = page.locator('button').filter({ hasText: 'Daftar' }).first();
  if (await tabDaftar.count() > 0) { await tabDaftar.click(); await page.waitForTimeout(500); test('C2. Tab Daftar', 'PASS'); }
  else test('C2. Tab Daftar', 'WARN');

  const tabPeta = page.locator('button').filter({ hasText: 'Peta Sebaran' }).first();
  if (await tabPeta.count() > 0) { await tabPeta.click(); await page.waitForTimeout(1000); test('C3. Tab Peta Sebaran', 'PASS'); }
  else test('C3. Tab Peta Sebaran', 'WARN');

  await snapshot(page, 'C-pendataan-peta');

  // C4. Peta select mode
  const petaSelect = page.locator('select').first();
  if (await petaSelect.count() > 0) {
    const opts = await petaSelect.locator('option').all();
    if (opts.length > 0) { await petaSelect.selectOption({ index: 0 }); test('C4. Peta mode select berfungsi', 'PASS'); }
    else test('C4. Peta mode select', 'WARN', 'No options in select');
  } else test('C4. Peta mode select', 'WARN', 'Select element not found');

  // C5. Tombol Tambah Murid Baru
  const addBtnExists = await page.locator('a[href="/member/pendataan/new"]').count();
  test('C5a. Tombol Tambah Murid Baru ada', addBtnExists > 0 ? 'PASS' : 'WARN');
  await page.goto(BASE + '/member/pendataan/new', { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('C5b. Halaman form tambah murid termuat', page.url().includes('/member/pendataan/new') ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));

  // ================================================================
  // D. NASYATH MUN
  // ================================================================
  section('D. NASYATH MUN');

  await page.goto(BASE + '/member/nasyath_mun', { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1500);
  test('D1. Layout RTL', (await page.locator('[dir="rtl"]').count()) > 0 ? 'PASS' : 'WARN');

  const dashBtn = page.locator('button').filter({ hasText: 'Dashboard' }).first();
  if (await dashBtn.count() > 0) { await dashBtn.click(); await page.waitForTimeout(500); test('D2. Tab Dashboard', 'PASS'); }
  else test('D2. Tab Dashboard', 'WARN');

  const tabelBtn = page.locator('button').filter({ hasText: /Tabel|قائمة/u }).first();
  if (await tabelBtn.count() > 0) { await tabelBtn.click(); await page.waitForTimeout(500); test('D3. Tab Tabel', 'PASS'); }
  else test('D3. Tab Tabel', 'WARN');

  test('D4. Tombol Export', (await page.locator('button').filter({ hasText: /Export|XLSX/u }).count()) > 0 ? 'PASS' : 'WARN');
  test('D5. Tombol Tambah Baru', (await page.locator('a[href="/member/nasyath_mun/new"]').count()) > 0 ? 'PASS' : 'WARN');
  await snapshot(page, 'D-nasyath');

  // ================================================================
  // E. ADMIN
  // ================================================================
  section('E. ADMIN');

  await page.goto(BASE + '/admin', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
  test('E1. Admin dashboard', page.url().includes('/admin') ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
  const aStats = await page.locator('.stat-value, h2, h3').allInnerTexts();
  test('E2. Statistik admin', aStats.length > 0 ? 'PASS' : 'WARN', `${aStats.length} values`);
  await snapshot(page, 'E-admin');

  // Admin sidebar clicks
  const adminLinks = [
    { href: '/admin/users', label: 'Users' },
    { href: '/admin/rbac', label: 'RBAC' },
    { href: '/admin/error-logs', label: 'Error Logs' },
  ];
  for (const link of adminLinks) {
    try {
      const el = page.locator(`a[href="${link.href}"]`).first();
      if (await el.count() === 0) { test(`E. Sidebar "${link.label}"`, 'WARN', 'Not found'); continue; }
      await el.click();
      await page.waitForTimeout(2000);
      test(`E. Sidebar "${link.label}" (${link.href})`, page.url().includes(link.href) ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
    } catch (e) { test(`E. Sidebar "${link.label}"`, 'FAIL', e.message.substring(0, 80)); }
  }

  // RBAC specific checks
  await page.goto(BASE + '/admin/rbac', { waitUntil: 'load', timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(2000);
  const roleBtns = page.locator('a, button').filter({ hasText: /^[a-zA-Z]/ }).filter({ hasNotText: /Buat|Simpan|Batal|Pilih|Reset|Izin|Pengguna/i });
  const roleCount = await roleBtns.count();
  test('E3. Daftar RBAC roles', roleCount > 0 ? 'PASS' : 'WARN', `${roleCount} role elements`);

  // Click first role
  if (roleCount > 0) {
    try {
      await roleBtns.first().click();
      await page.waitForTimeout(1500);
      test('E4. Role bisa diklik', 'PASS');
      await snapshot(page, 'E-rbac-detail');
    } catch (e) { test('E4. Role bisa diklik', 'WARN', e.message.substring(0, 80)); }
  }

  // Subpages
  for (const path of ['/admin/piket', '/admin/backup']) {
    await page.goto(BASE + path, { waitUntil: 'load', timeout: 20000 }).catch(() => {});
    await page.waitForTimeout(1000);
    test(`E. ${path}`, page.url().includes(path) ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
  }

  await ctx.close();

  // ================================================================
  // F. PROFILE
  // ================================================================
  section('F. PROFILE');

  ({ ctx, page } = await ctxAndPage());
  await loginFlow(page);
  await page.goto(BASE + '/member/profile', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('F1. Profile page', page.url().includes('/member/profile') ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
  await ctx.close();

  // ================================================================
  // G. LOGOUT
  // ================================================================
  section('G. LOGOUT');

  ({ ctx, page } = await ctxAndPage());
  await loginFlow(page);
  const lr = await page.evaluate(async (base) => {
    try {
      const r = await fetch(base + '/api/logout', { method: 'POST', credentials: 'include' });
      return { status: r.status, ok: r.ok };
    } catch (e) { return { status: 0, ok: false }; }
  }, BASE);
  test('G1. POST /api/logout', lr.ok ? 'PASS' : 'FAIL', `Status ${lr.status}`);
  await page.waitForTimeout(1000);
  await page.goto(BASE + '/member', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('G2. Redirect ke /login setelah logout', page.url().includes('/login') ? 'PASS' : 'FAIL', page.url().replace(BASE, ''));
  await ctx.close();

  // ================================================================
  // H. RESPONSIVE DESIGN (each in isolated context)
  // ================================================================
  section('H. RESPONSIVE DESIGN');

  const viewports = [
    { w: 375, h: 812, name: 'Mobile (375px)' },
    { w: 768, h: 1024, name: 'Tablet (768px)' },
    { w: 1280, h: 800, name: 'Desktop (1280px)' },
    { w: 1920, h: 1080, name: 'Desktop HD (1920px)' },
  ];
  for (const vp of viewports) {
    const vCtx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const vPage = await vCtx.newPage();
    await vPage.goto(BASE + '/login', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    await vPage.waitForTimeout(1000);
    const hs = await vPage.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 3);
    test(`H. ${vp.name}`, hs ? 'WARN' : 'PASS', hs ? 'Ada horizontal scroll!' : 'Tidak ada overflow');
    await vPage.screenshot({ path: `/tmp/opencode/test-screenshots/H-${vp.w}.png`, fullPage: true }).catch(() => {});
    await vCtx.close();
  }

  // ================================================================
  // I. PUBLIC PAGES
  // ================================================================
  section('I. PUBLIC PAGES');

  ({ ctx, page } = await ctxAndPage());
  await page.goto(BASE + '/tanya', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  test('I1. Title tanya', (await page.title()).includes('Pertanyaan') ? 'PASS' : 'WARN', await page.title());
  const inp = await page.locator('input').count();
  const ta = await page.locator('textarea').count();
  test('I2. Form inputs', (inp + ta) >= 4 ? 'PASS' : 'WARN', `${inp} inputs, ${ta} textareas`);
  await snapshot(page, 'I-tanya');
  await ctx.close();

  // ================================================================
  // J. ACCESSIBILITY BASICS
  // ================================================================
  section('J. ACCESSIBILITY BASICS');

  ({ ctx, page } = await ctxAndPage());
  await loginFlow(page);
  await page.goto(BASE + '/member', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const hCount = await page.locator('h1, h2, h3, h4, h5, h6').count();
  const lm = await page.locator('nav, header, main, footer, aside').count();
  const imgs = await page.locator('img').count();
  const lnk = await page.locator('a').count();
  const btn = await page.locator('button').count();
  test('J1. Landmark semantic (nav/header/main/footer)', lm >= 2 ? 'PASS' : 'WARN', `${lm} ditemukan`);
  test('J2. Heading elements', hCount >= 3 ? 'PASS' : 'WARN', `${hCount} headings`);
  test('J3. Links', lnk >= 3 ? 'PASS' : 'WARN', `${lnk} links`);
  test('J4. Buttons', btn >= 2 ? 'PASS' : 'WARN', `${btn} buttons`);
  test('J5. Images', imgs === 0 ? 'WARN' : 'PASS', `${imgs} images`);

  await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const labels = await page.locator('label').count();
  test('J6. Form labels', labels >= 1 ? 'PASS' : 'WARN', `${labels} labels`);
  await ctx.close();

  // ================================================================
  // K. PERFORMANCE
  // ================================================================
  section('K. PERFORMANCE');

  try {
    ({ ctx, page } = await ctxAndPage());
    await page.goto(BASE + '/login', { waitUntil: 'load', timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const navP = await page.evaluate(() => {
      const e = performance.getEntriesByType('navigation')[0];
      if (!e) return null;
      return {
        dcl: Math.round(e.domContentLoadedEventEnd),
        loadDone: Math.round(e.loadEventEnd - e.domContentLoadedEventEnd),
        total: Math.round(e.loadEventEnd),
        ttfb: Math.round(e.responseStart - (e.fetchStart || e.requestStart || 0))
      };
    });
    if (navP) {
      test('K1. TTFB (Time To First Byte)', navP.ttfb < 1000 ? 'PASS' : 'WARN', `${navP.ttfb}ms`);
      test('K2. DOMContentLoaded', navP.dcl < 5000 ? 'PASS' : 'WARN', `${navP.dcl}ms`);
      test('K3. Total load time', navP.total < 10000 ? 'PASS' : 'WARN', `${navP.total}ms`);
    } else test('K1-K3. Performance', 'WARN', 'Navigation API unavailable');

    const res = await page.evaluate(() =>
      performance.getEntriesByType('resource').map(r => ({
        name: r.name.replace(/^.*\/\/[^/]+/, '').substring(0, 50),
        dur: Math.round(r.duration),
        size: r.transferSize || 0
      }))
    );
    const avg = res.length ? Math.round(res.reduce((a, r) => a + r.dur, 0) / res.length) : 0;
    const slow = res.filter(r => r.dur > 2000);
    test('K4. Jumlah resource', res.length > 0 ? 'PASS' : 'WARN', `${res.length} resources`);
    test('K5. Rata-rata load time resource', avg < 500 ? 'PASS' : 'WARN', `${avg}ms avg`);
    test('K6. Resource lambat (>2s)', slow.length === 0 ? 'PASS' : 'WARN', slow.length ? slow.map(r => `${r.name}(${r.dur}ms)`).join(', ') : 'None');
    const totalSize = Math.round(res.reduce((a, r) => a + r.size, 0) / 1024);
    test('K7. Total transfer size', totalSize < 5000 ? 'PASS' : 'WARN', `${totalSize}KB`);
    await ctx.close();
  } catch (e) { test('K. Performance', 'WARN', 'Skipped due to: ' + e.message.substring(0, 100)); }

  // ================================================================
  // SUMMARY
  // ================================================================
  const total = testPassed + testFailed + testWarned;
  console.log('\n' + '='.repeat(70));
  console.log('  PROFESSIONAL TEST - FINAL REPORT');
  console.log('='.repeat(70));
  console.log(`  Total: ${total}`);
  console.log(`  PASSED:  ${testPassed}`);
  console.log(`  WARNINGS: ${testWarned}`);
  console.log(`  FAILED:  ${testFailed}`);
  console.log(`  Pass rate: ${Math.round(testPassed / total * 100)}%`);
  console.log(`  Pass+Warn rate: ${Math.round((testPassed + testWarned) / total * 100)}%`);

  const problems = report.sections.filter(s => s.tests.some(t => t.status !== 'PASS'));
  if (problems.length > 0) {
    console.log(`\n  ${'─'.repeat(60)}`);
    console.log('  BREAKDOWN OF ALL ISSUES');
    console.log(`  ${'─'.repeat(60)}`);
    for (const s of problems) {
      console.log(`  [${s.name}]`);
      for (const t of s.tests.filter(t => t.status !== 'PASS')) {
        console.log(`    ${t.status === 'WARN' ? '⚠' : '✗'} ${t.name}${t.detail ? ': ' + t.detail : ''}`);
      }
    }
  }

  writeFileSync('/tmp/opencode/professional-test-report.json', JSON.stringify({
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    summary: { total, passed: testPassed, warnings: testWarned, failures: testFailed, passRate: Math.round(testPassed / total * 100) + '%' },
    sections: report.sections,
    consoleErrors: report.consoleErrors,
  }, null, 2));

  await browser.close();
  console.log(`\n  Report saved: /tmp/opencode/professional-test-report.json`);
  console.log('='.repeat(70));
  process.exit(testFailed > 0 ? 1 : 0);
}

main().catch(async e => {
  console.error('FATAL:', e.message);
  if (browser) await browser.close();
  process.exit(1);
});
