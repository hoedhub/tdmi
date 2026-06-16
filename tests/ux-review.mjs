import pkg from '/home/hoed/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import { writeFileSync, mkdirSync } from 'fs';
const { chromium } = pkg;

const BASE = 'http://localhost:5173';
const CREDS = { username: 'hoed', password: '654321' };
const SS_DIR = '/tmp/opencode/ux-review';

const journey = [];

function log(step, desc, detail = '') {
  console.log(`[${step}] ${desc}${detail ? ': ' + detail : ''}`);
  journey.push({ step, desc, detail });
}

async function explore() {
  mkdirSync(SS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  let ssCounter = 0;

  async function ss(name) {
    ssCounter++;
    const path = `${SS_DIR}/${String(ssCounter).padStart(2, '0')}-${name}.png`;
    await page.screenshot({ path, fullPage: true });
    return path;
  }

  // ================================================================
  // 1. LANDING & LOGIN
  // ================================================================
  log('1.1', 'Mengunjungi halaman utama (/)');
  await page.goto(BASE + '/', { waitUntil: 'load' });
  await ss('01-home-redirect');
  log('1.2', 'Redirect ke /login', `URL: ${page.url()}`);

  log('1.3', 'Melihat halaman login');
  await page.goto(BASE + '/login', { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await ss('02-login-page');

  // Check visual elements
  const loginForm = await page.locator('form').innerHTML();
  log('1.4', 'Form login visual check', `Themes: ${await page.evaluate(() => document.documentElement.getAttribute('data-theme'))}`);

  // Try wrong password first - observe error UX
  log('1.5', 'Mencoba login dengan password salah');
  await page.fill('input[name="username"]', 'hoed');
  await page.fill('input[name="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1500);
  await ss('03-login-error');

  // Login successfully
  log('1.6', 'Login dengan credentials benar');
  await page.fill('input[name="username"]', CREDS.username);
  await page.fill('input[name="password"]', CREDS.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2500);
  await ss('04-dashboard-member');

  // ================================================================
  // 2. MEMBER DASHBOARD - EXPLORE VISUALLY
  // ================================================================
  log('2.1', 'Dashboard member: memeriksa layout');
  const dashHTML = await page.locator('body').innerHTML();
  const dashText = await page.locator('body').innerText();

  // Check sidebar visibility
  const sidebarLinks = await page.locator('a').all();
  const sidebarVisible = [];
  for (const link of sidebarLinks) {
    const text = await link.innerText();
    const href = await link.getAttribute('href');
    const visible = await link.isVisible();
    if (text.trim()) sidebarVisible.push({ text: text.trim(), href, visible });
  }
  log('2.2', 'Sidebar link visibility', JSON.stringify(sidebarVisible.filter(l => l.visible)));

  // Check stats cards
  const statsCardTexts = await page.locator('.stat-value, .stat-title, h2, .card-body').allInnerTexts();
  log('2.3', 'Dashboard content', statsCardTexts.join(' | '));

  // Sidebar collapse - visual change
  const toggleBtn = page.locator('button[aria-label="Toggle sidebar"]');
  if (await toggleBtn.count() > 0) {
    await toggleBtn.click();
    await page.waitForTimeout(500);
    await ss('05-sidebar-collapsed');
    log('2.4', 'Sidebar di-collapse');
    await toggleBtn.click();
    await page.waitForTimeout(500);
    await ss('06-sidebar-expanded');
    log('2.5', 'Sidebar di-expand kembali');
  }

  // ================================================================
  // 3. PENDATAAN - FULL EXPLORE
  // ================================================================
  log('3.1', 'Navigasi ke Pendataan via klik sidebar');
  const pendataanLink = page.locator('a[href="/member/pendataan"]').first();
  await pendataanLink.click();
  await page.waitForTimeout(2000);
  await ss('07-pendataan-table');

  // Toggle to Map view
  log('3.2', 'Klik tab Peta Sebaran');
  const petaTab = page.locator('button').filter({ hasText: 'Peta Sebaran' }).first();
  if (await petaTab.count() > 0) {
    await petaTab.click();
    await page.waitForTimeout(1500);
    await ss('08-pendataan-peta');
    log('3.3', 'View berubah ke peta sebaran');

    // Try changing map mode
    const mapSelect = page.locator('select').first();
    if (await mapSelect.count() > 0) {
      const opts = await mapSelect.locator('option').allInnerTexts();
      log('3.4', 'Opsi peta tersedia', opts.join(', '));
      if (opts.length > 1) {
        await mapSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);
        await ss('08b-pendataan-peta-mode2');
      }
    }

    // Click back to table
    const daftarTab = page.locator('button').filter({ hasText: 'Daftar' }).first();
    if (await daftarTab.count() > 0) {
      await daftarTab.click();
      await page.waitForTimeout(1000);
      await ss('09-pendataan-table-back');
      log('3.5', 'Kembali ke tampilan tabel');
    }
  }

  // Check table state
  const tableRows = await page.locator('table tbody tr, [role="row"]').count();
  log('3.6', 'Jumlah baris di tabel pendataan', `${tableRows} rows`);

  // Check Tambah Murid button
  const tambahBtn = page.locator('a[href="/member/pendataan/new"]').first();
  log('3.7', 'Tombol Tambah Murid Baru', (await tambahBtn.isVisible()) ? 'Visible' : 'Hidden');

  // Navigate to new student form
  await page.goto(BASE + '/member/pendataan/new', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await ss('10-form-tambah-murid');
  log('3.8', 'Form tambah murid baru');

  // Check form fields count
  const formInputs = await page.locator('input, select, textarea').count();
  const formLabels = await page.locator('label').count();
  log('3.9', 'Elemen form', `${formInputs} inputs, ${formLabels} labels`);

  // ================================================================
  // 4. NASYATH MUN - FULL EXPLORE
  // ================================================================
  log('4.1', 'Navigasi ke Nasyath MUN');
  const nasyathLink = page.locator('a[href="/member/nasyath_mun"]').first();
  await nasyathLink.click();
  await page.waitForTimeout(2000);
  await ss('11-nasyath-dashboard');

  // Check RTL layout
  log('4.2', 'Layout RTL terdeteksi', `${await page.locator('[dir="rtl"]').count() > 0}`);

  // KPIs
  const kpis = await page.locator('.stat-value, .kpi-value, h2, h3').allInnerTexts();
  log('4.3', 'KPI cards di dashboard', kpis.filter(k => /\d/.test(k)).join(', '));

  // Switch to Table view
  const tabelBtn = page.locator('button').filter({ hasText: /Tabel|قائمة/u }).first();
  if (await tabelBtn.count() > 0) {
    await tabelBtn.click();
    await page.waitForTimeout(1500);
    await ss('12-nasyath-table');
    log('4.4', 'Berganti ke tampilan tabel');

    // Check filters
    const filterInputs = await page.locator('input, select').count();
    const filterButtons = await page.locator('button').filter({ hasText: /تصفية|إعادة/u }).count();
    log('4.5', 'Filter elements', `${filterInputs} inputs, ${filterButtons} filter buttons`);
  }

  // Back to Dashboard
  const dashBtn = page.locator('button').filter({ hasText: 'Dashboard' }).first();
  if (await dashBtn.count() > 0) {
    await dashBtn.click();
    await page.waitForTimeout(1000);
    log('4.6', 'Kembali ke dashboard');
  }

  // ================================================================
  // 5. AYYU SU'AAL (if accessible)
  // ================================================================
  const ayyuLink = page.locator('a[href="/member/ayyu-sual"]').first();
  if (await ayyuLink.isVisible()) {
    await ayyuLink.click();
    await page.waitForTimeout(2000);
    await ss('13-ayyu-sual');
    log('5.1', 'Halaman Ayyu Su\'aal');
    const ayyuText = await page.locator('body').innerText();
    log('5.2', 'Konten halaman', ayyuText.substring(0, 200));
  } else {
    log('5.1', 'Ayyu Su\'aal - tidak punya akses');
  }

  // ================================================================
  // 6. PROFILE
  // ================================================================
  const profileLink = page.locator('a[href="/member/profile"]').first();
  if (await profileLink.isVisible()) {
    await profileLink.click();
    await page.waitForTimeout(1500);
    await ss('14-profile');
    log('6.1', 'Halaman profile');
    const profText = await page.locator('body').innerText();
    log('6.2', 'Konten profile', profText.substring(0, 300));
  }

  // ================================================================
  // 7. SETTINGS (if accessible)
  // ================================================================
  const settingsLink = page.locator('a[href="/settings"]').first();
  if (await settingsLink.isVisible()) {
    await settingsLink.click();
    await page.waitForTimeout(1500);
    await ss('15-settings');
    log('7.1', 'Halaman settings');
  } else {
    log('7.1', 'Settings link tidak terlihat');
  }

  // ================================================================
  // 8. ADMIN SECTION
  // ================================================================
  log('8.1', 'Navigasi ke admin');
  await page.goto(BASE + '/admin', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await ss('16-admin-dashboard');
  const adminText = await page.locator('body').innerText();
  log('8.2', 'Admin dashboard content', adminText.substring(0, 500));

  // Admin sidebar links
  log('8.3', 'Mengeksplorasi sidebar admin');
  const adminLinks = await page.locator('nav a, aside a, [class*="sidebar"] a').all();
  for (const link of adminLinks) {
    const text = await link.innerText();
    const href = await link.getAttribute('href');
    const vis = await link.isVisible();
    if (text.trim()) log('8.3a', `  Admin link: "${text.trim()}" -> ${href} (visible: ${vis})`);
  }

  // Click admin subpages
  const adminPages = ['/admin/users', '/admin/rbac', '/admin/piket', '/admin/backup', '/admin/error-logs'];
  for (const p of adminPages) {
    await page.goto(BASE + p, { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const name = p.replace('/admin/', '');
    await ss(`17-admin-${name}`);
    const bodyText = await page.locator('body').innerText();
    log('8.4', `Admin ${name}`, bodyText.substring(0, 300).replace(/\n/g, ' | '));
  }

  // Explore RBAC specifically
  await page.goto(BASE + '/admin/rbac', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await ss('18-rbac-full');

  // Click on a role
  const roleItems = page.locator('a, button').filter({ hasText: /^[a-zA-Z]/ }).filter({ hasNotText: /Buat|Simpan|Batal|Pilih|Reset|Izin|Pengguna|Dashboard|User|RBAC|Error|Piket|Backup|Exit/i });
  log('8.5', 'RBAC role items count', `${await roleItems.count()}`);
  if (await roleItems.count() > 0) {
    const roleNames = await roleItems.allInnerTexts();
    log('8.6', 'Nama role ditemukan', roleNames.join(', '));
    await roleItems.first().click();
    await page.waitForTimeout(1500);
    await ss('19-rbac-role-detail');
    const rbacDetail = await page.locator('body').innerText();
    log('8.7', 'Detail role', rbacDetail.substring(0, 400).replace(/\n/g, ' | '));
  }

  // ================================================================
  // 9. USER MENU
  // ================================================================
  log('9.1', 'Kembali ke member dashboard');
  await page.goto(BASE + '/member', { waitUntil: 'load' });
  await page.waitForTimeout(1000);

  // Try clicking user menu
  const userBtn = page.locator('button').filter({ hasText: /Halo|hoed/i }).first();
  if (await userBtn.count() > 0) {
    await userBtn.click();
    await page.waitForTimeout(500);
    await ss('20-user-menu');
    log('9.2', 'User menu dropdown terbuka');

    // Try to click logout or profile from dropdown
    const dropdownItems = await page.locator('[class*="dropdown"] a, [class*="menu"] a, a:visible').all();
    for (const item of dropdownItems) {
      const text = await item.innerText();
      if (text.includes('Logout') || text.includes('Profile') || text.includes('profil')) {
        log('9.3', `Menu item ditemukan: "${text.trim()}"`);
      }
    }
  } else {
    log('9.2', 'User menu button tidak ditemukan dengan selector Halo/hoed');
  }

  // Check theme picker
  const themeBtn = page.locator('button').filter({ hasText: /Theme/i }).first();
  if (await themeBtn.count() > 0) {
    log('9.4', 'Theme picker button ada');
  }

  // ================================================================
  // 10. TANYA PAGE (PUBLIC)
  // ================================================================
  log('10.1', 'Mengunjungi halaman tanya publik');
  const tanyaCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const tanyaPage = await tanyaCtx.newPage();
  await tanyaPage.goto(BASE + '/tanya', { waitUntil: 'load' });
  await tanyaPage.waitForTimeout(2000);
  await tanyaPage.screenshot({ path: `${SS_DIR}/21-tanya-public.png`, fullPage: true });
  const tanyaText = await tanyaPage.locator('body').innerText();
  log('10.2', 'Halaman tanya publik', tanyaText.substring(0, 500).replace(/\n/g, ' | '));
  const tanyaFields = await tanyaPage.locator('input, textarea').count();
  log('10.3', 'Field count di form tanya', `${tanyaFields} fields`);

  // Check if there's a CAPTCHA
  const captcha = await tanyaPage.locator('[class*="turnstile"], [class*="captcha"], iframe').count();
  log('10.4', 'CAPTCHA/turnstile detected', `${captcha} elements`);

  // Check RTL on tanya page
  const tanyaRTL = await tanyaPage.locator('[dir="rtl"]').count();
  log('10.5', 'Apakah tanya juga RTL?', tanyaRTL > 0 ? 'Ya' : 'Tidak (LTR)');
  await tanyaCtx.close();

  // ================================================================
  // 11. RESPONSIVE MOBILE
  // ================================================================
  log('11.1', 'Simulasi tampilan mobile');
  const mobileCtx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const mobilePage = await mobileCtx.newPage();

  // Login page on mobile
  await mobilePage.goto(BASE + '/login', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: `${SS_DIR}/22-mobile-login.png`, fullPage: true });
  log('11.2', 'Login page di mobile 375px');

  // Dashboard on mobile
  await mobilePage.goto(BASE + '/member', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(1000);
  // Try logging in first
  await mobilePage.goto(BASE + '/login', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(500);
  await mobilePage.fill('input[name="username"]', CREDS.username);
  await mobilePage.fill('input[name="password"]', CREDS.password);
  await mobilePage.click('button[type="submit"]');
  await mobilePage.waitForTimeout(2000);
  await mobilePage.screenshot({ path: `${SS_DIR}/23-mobile-dashboard.png`, fullPage: true });
  log('11.3', 'Dashboard mobile');

  // Check hamburger menu on mobile
  const hamburger = mobilePage.locator('label[for="sidebar-drawer-toggle"], label[for="my-drawer-2"]');
  if (await hamburger.count() > 0) {
    await hamburger.click();
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: `${SS_DIR}/24-mobile-drawer-open.png`, fullPage: true });
    log('11.4', 'Mobile drawer menu terbuka');
  } else {
    log('11.4', 'Hamburger menu tidak ditemukan');
  }

  await mobilePage.goto(BASE + '/member/pendataan', { waitUntil: 'load' });
  await mobilePage.waitForTimeout(1500);
  await mobilePage.screenshot({ path: `${SS_DIR}/25-mobile-pendataan.png`, fullPage: true });
  log('11.5', 'Pendataan page di mobile');

  await mobileCtx.close();

  // ================================================================
  // 12. LOADING & EMPTY STATES
  // ================================================================
  log('12.1', 'Memeriksa loading state');
  const loadingElements = await page.locator('[class*="loading"], [class*="skeleton"], [class*="spinner"], [class*="animate-pulse"]').count();
  log('12.2', 'Loading/skeleton elements', `${loadingElements}`);

  // Check empty state on piket if no data
  await page.goto(BASE + '/admin/piket', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await ss('26-admin-piket');
  const piketText = await page.locator('body').innerText();
  log('12.3', 'Admin piket content', piketText.substring(0, 300).replace(/\n/g, ' | '));

  // Backup page
  await page.goto(BASE + '/admin/backup', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await ss('27-admin-backup');
  log('12.4', 'Admin backup content', (await page.locator('body').innerText()).substring(0, 300).replace(/\n/g, ' | '));

  // Error logs
  await page.goto(BASE + '/admin/error-logs', { waitUntil: 'load' });
  await page.waitForTimeout(1000);
  await ss('28-admin-error-logs');
  log('12.5', 'Admin error logs content', (await page.locator('body').innerText()).substring(0, 300).replace(/\n/g, ' | '));

  await ctx.close();
  await browser.close();

  // ================================================================
  // GENERATE REPORT
  // ================================================================
  writeFileSync(`${SS_DIR}/journey.json`, JSON.stringify(journey, null, 2));
  console.log(`\n✅ Eksplorasi selesai. ${ssCounter} screenshots di ${SS_DIR}`);
  console.log(`📋 ${journey.length} langkah dicatat.`);
}

explore().catch(async e => {
  console.error('FATAL:', e.message);
  process.exit(1);
});
