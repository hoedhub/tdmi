import pkg from '/home/hoed/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
const { chromium } = pkg;

const BASE = 'http://localhost:5173';
const USERNAME = 'hoed';
const PASSWORD = '654321';

const results = [];
let browser, page;

function log(route, status, detail, extra = {}) {
  const ok = status === 'OK' ? '✓' : '✗';
  console.log(`  ${ok} ${route} --> ${status} | ${detail || ''}`);
  results.push({ route, status, detail, ...extra });
}

async function screenshot(name) {
  try {
    await page.screenshot({ path: `/tmp/opencode/test-screenshots/${name}.png`, fullPage: true });
  } catch (e) {}
}

async function main() {
  mkdirSync('/tmp/opencode/test-screenshots', { recursive: true });
  
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  // ============================================================
  // 1. PUBLIC ROUTES (unauthenticated)
  // ============================================================
  console.log('\n=== 1. PUBLIC ROUTES (Unauthenticated) ===');

  try {
    let resp = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const finalUrl = page.url();
    const chainStatus = resp ? resp.status() : 'no response';
    if (finalUrl.includes('/login') && [200, 302].includes(chainStatus)) {
      log('/', 'OK', `Redirected to /login (status ${chainStatus})`);
    } else {
      log('/', 'WARN', `Expected redirect to /login, got ${finalUrl} (${chainStatus})`);
    }
  } catch (e) { log('/', 'ERR', e.message); }

  try {
    let resp = await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    const title = await page.title();
    const hasForm = await page.locator('form').count() > 0;
    const hasUsername = await page.locator('input[name="username"]').count() > 0;
    const hasPassword = await page.locator('input[type="password"], input[name="password"]').count() > 0;
    const status = resp ? resp.status() : 'no response';
    if (status === 200 && hasForm && hasUsername && hasPassword) {
      log('/login', 'OK', `Status ${status}, title="${title}", form+inputs present`);
    } else {
      log('/login', 'WARN', `Status ${status}, form=${hasForm}, username=${hasUsername}, pw=${hasPassword}, title="${title}"`);
    }
    await screenshot('login-page');
  } catch (e) { log('/login', 'ERR', e.message); }

  try {
    let resp = await page.goto(BASE + '/tanya', { waitUntil: 'networkidle' });
    const s = resp ? resp.status() : 'no response';
    log('/tanya', s === 200 ? 'OK' : 'WARN', `Status ${s}`);
  } catch (e) { log('/tanya', 'ERR', e.message); }

  // Protected routes without auth should redirect
  for (const path of ['/member', '/admin']) {
    try {
      let resp = await page.goto(BASE + path, { waitUntil: 'networkidle' });
      const finalUrl = page.url();
      log(`${path} (no auth)`, finalUrl.includes('/login') ? 'OK' : 'WARN', `Redirected to ${finalUrl.replace(BASE, '')}`);
    } catch (e) { log(`${path} (no auth)`, 'ERR', e.message); }
  }

  // ============================================================
  // 2. LOGIN & AUTH FLOW
  // ============================================================
  console.log('\n=== 2. LOGIN & AUTH FLOW ===');

  // Empty submit
  try {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', '');
    await page.fill('input[name="password"]', '');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    log('/login (empty submit)', page.url().includes('/login') ? 'OK' : 'WARN', `Stayed on login`);
  } catch (e) { log('/login (empty submit)', 'ERR', e.message); }

  // Wrong credentials
  try {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', 'wronguser');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    const body = await page.locator('body').innerText();
    const hasError = /invalid/i.test(body) || /salah/i.test(body) || /error/i.test(body);
    log('/login (wrong creds)', hasError ? 'OK' : 'WARN', `Error msg shown: ${hasError}`);
  } catch (e) { log('/login (wrong creds)', 'ERR', e.message); }

  // Correct login
  try {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const finalUrl = page.url();
    log('/login (success)', finalUrl.includes('/member') ? 'OK' : 'WARN', `Redirected to ${finalUrl.replace(BASE, '')}`);
    await screenshot('after-login');
  } catch (e) { log('/login (success)', 'ERR', e.message); }

  // ============================================================
  // 3. MEMBER ROUTES
  // ============================================================
  console.log('\n=== 3. MEMBER ROUTES ===');

  const memberRoutes = [
    '/member', '/member/ayyu-sual', '/member/nasyath',
    '/member/nasyath_mun', '/member/pendataan',
    '/member/pendataan/new', '/member/profile', '/member/users'
  ];

  for (const route of memberRoutes) {
    try {
      let resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 15000 });
      const s = resp ? resp.status() : 200;
      const finalUrl = page.url();
      const isRedirected = !finalUrl.includes(route) && !finalUrl.includes('/member');
      const ok = s === 200 && !isRedirected;
      log(route, ok ? 'OK' : (s === 200 ? 'WARN' : 'ERR'), `Status ${s}${isRedirected ? ', redirected' : ''}`);
    } catch (e) { log(route, 'ERR', e.message); }
  }

  // ============================================================
  // 4. ADMIN ROUTES
  // ============================================================
  console.log('\n=== 4. ADMIN ROUTES ===');

  const adminRoutes = [
    '/admin', '/admin/users', '/admin/rbac',
    '/admin/backup', '/admin/piket', '/admin/piket/susun', '/admin/error-logs'
  ];

  for (const route of adminRoutes) {
    try {
      let resp = await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 20000 });
      const s = resp ? resp.status() : 200;
      log(route, s === 200 ? 'OK' : 'ERR', `Status ${s}`);
    } catch (e) { log(route, 'ERR', e.message); }
  }

  // ============================================================
  // 5. API ENDPOINTS (authenticated)
  // ============================================================
  console.log('\n=== 5. API ENDPOINTS ===');

  const apis = [
    '/api/propinsi', '/api/kokab', '/api/kecamatan', '/api/deskel',
    '/api/murid/compact', '/api/error-log',
    '/api/murid-network', '/api/wilayah-by-deskel',
    '/api/piket-schedule', '/api/murid/search'
  ];

  for (const api of apis) {
    try {
      let resp = await page.goto(BASE + api, { waitUntil: 'networkidle', timeout: 10000 });
      const s = resp ? resp.status() : 'no response';
      let bodyText = '';
      try { bodyText = await page.locator('body').innerText(); } catch (e) {}
      const hasContent = bodyText && bodyText.length > 0 && bodyText !== '{}' && bodyText !== '[]';
      const ok = s === 200 || s === 201;
      log(`GET ${api}`, ok ? 'OK' : 'WARN', `Status ${s}, content: ${hasContent ? 'yes' : bodyText ? bodyText.substring(0, 60) : 'empty'}`);
    } catch (e) { log(`GET ${api}`, 'ERR', e.message); }
  }

  // ============================================================
  // 6. CONSOLE ERRORS CHECK
  // ============================================================
  console.log('\n=== 6. CONSOLE ERRORS CHECK ===');

  let consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    await page.goto(BASE + '/member', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);
    if (consoleErrors.length > 0) {
      log('Console errors', 'WARN', `${consoleErrors.length} errors found`);
      consoleErrors.forEach(e => console.log(`         ${e.substring(0, 120)}`));
    } else {
      log('Console errors', 'OK', 'No console errors');
    }
  } catch (e) { log('Console errors', 'ERR', e.message); }

  // ============================================================
  // 7. RESPONSIVENESS
  // ============================================================
  console.log('\n=== 7. RESPONSIVENESS ===');

  try {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    const noHScroll = await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 5);
    log('Mobile 375px', noHScroll ? 'OK' : 'WARN', `No horiz scroll: ${noHScroll}`);
    await screenshot('mobile-login');
  } catch (e) { log('Mobile 375px', 'ERR', e.message); }

  try {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    log('Tablet 768px', 'OK', 'Page loaded');
  } catch (e) { log('Tablet 768px', 'ERR', e.message); }

  await page.setViewportSize({ width: 1280, height: 800 });

  // ============================================================
  // 8. LOGOUT
  // ============================================================
  console.log('\n=== 8. LOGOUT ===');

  // First login again
  try {
    await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
  } catch (e) {}

  try {
    let resp = await page.goto(BASE + '/api/logout', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const finalUrl = page.url();
    log('/api/logout', finalUrl.includes('/login') ? 'OK' : 'WARN', `After logout: ${finalUrl.replace(BASE, '')}`);
  } catch (e) { log('/api/logout', 'ERR', e.message); }

  try {
    let resp = await page.goto(BASE + '/member', { waitUntil: 'networkidle' });
    const finalUrl = page.url();
    log('/member (post-logout)', finalUrl.includes('/login') ? 'OK' : 'WARN', `Redirected to ${finalUrl.replace(BASE, '')}`);
  } catch (e) { log('/member (post-logout)', 'ERR', e.message); }

  // ============================================================
  // SUMMARY
  // ============================================================
  console.log('\n' + '='.repeat(70));
  console.log('  TEST SUMMARY');
  console.log('='.repeat(70));

  const total = results.length;
  const ok = results.filter(r => r.status === 'OK').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const err = results.filter(r => r.status === 'ERR').length;

  console.log(`  Total: ${total} | Pass: ${ok} | Warning: ${warn} | Fail: ${err}`);
  console.log('');

  if (warn > 0 || err > 0) {
    console.log('  ISSUES:');
    results.filter(r => r.status !== 'OK').forEach(r => {
      console.log(`    [${r.status}] ${r.route} --> ${r.detail}`);
    });
    console.log('');
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    credentials: { username: USERNAME },
    summary: { total, passed: ok, warnings: warn, failures: err },
    results
  };
  writeFileSync('/tmp/opencode/test-report.json', JSON.stringify(report, null, 2));

  await browser.close();
  console.log('  Report saved: /tmp/opencode/test-report.json');
  console.log('  Screenshots: /tmp/opencode/test-screenshots/');
  console.log('='.repeat(70));
}

main().catch(async e => {
  console.error('FATAL:', e.message);
  if (browser) await browser.close();
  process.exit(1);
});
