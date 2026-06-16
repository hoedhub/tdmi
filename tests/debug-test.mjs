import pkg from '/home/hoed/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.js';
import { writeFileSync } from 'fs';
const { chromium } = pkg;

const BASE = 'http://localhost:5173';
const USERNAME = 'hoed';
const PASSWORD = '654321';

let browser, page;

async function main() {
  browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  page = await ctx.newPage();

  // FIRST: Login
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  console.log('After login URL:', page.url());

  // 1. Investigate /tanya - check what it loads
  console.log('\n--- Investigating /tanya ---');
  try {
    let resp = await page.goto(BASE + '/tanya', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('Status:', resp ? resp.status() : 'none');
    console.log('URL:', page.url());
    const body = await page.locator('body').innerText();
    console.log('Body preview:', body.substring(0, 200));
    // Check page title
    console.log('Title:', await page.title());
  } catch (e) {
    console.log('Error:', e.message.substring(0, 200));
  }

  // 2. Investigate API endpoints that return 400
  console.log('\n--- Investigating APIs that return 400 ---');
  
  const apiChecks = [
    '/api/kokab',
    '/api/kecamatan', 
    '/api/deskel',
    '/api/murid-network',
    '/api/wilayah-by-deskel'
  ];
  
  for (const api of apiChecks) {
    try {
      let resp = await page.goto(BASE + api, { waitUntil: 'domcontentloaded', timeout: 10000 });
      const status = resp ? resp.status() : 'none';
      let body = '';
      try { body = await page.locator('body').innerText(); } catch (e) {}
      console.log(`${api}: Status=${status}, Body=${body.substring(0, 200)}`);
    } catch (e) {
      console.log(`${api}: Error=${e.message.substring(0, 100)}`);
    }
  }

  // 3. Test API with proper params
  console.log('\n--- Testing APIs with parameters ---');
  
  try {
    let resp = await page.goto(BASE + '/api/kokab?propinsi=1', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const s = resp ? resp.status() : 'none';
    let body = '';
    try { body = await page.locator('body').innerText(); } catch (e) {}
    console.log(`/api/kokab?propinsi=1: Status=${s}, Body=${body.substring(0, 200)}`);
  } catch (e) { console.log('Error:', e.message.substring(0, 100)); }

  try {
    let resp = await page.goto(BASE + '/api/kecamatan?kokab=1', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const s = resp ? resp.status() : 'none';
    let body = '';
    try { body = await page.locator('body').innerText(); } catch (e) {}
    console.log(`/api/kecamatan?kokab=1: Status=${s}, Body=${body.substring(0, 200)}`);
  } catch (e) { console.log('Error:', e.message.substring(0, 100)); }

  try {
    let resp = await page.goto(BASE + '/api/deskel?kecamatan=1', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const s = resp ? resp.status() : 'none';
    let body = '';
    try { body = await page.locator('body').innerText(); } catch (e) {}
    console.log(`/api/deskel?kecamatan=1: Status=${s}, Body=${body.substring(0, 200)}`);
  } catch (e) { console.log('Error:', e.message.substring(0, 100)); }

  try {
    let resp = await page.goto(BASE + '/api/murid-network?search=test', { waitUntil: 'domcontentloaded', timeout: 10000 });
    const s = resp ? resp.status() : 'none';
    let body = '';
    try { body = await page.locator('body').innerText(); } catch (e) {}
    console.log(`/api/murid-network?search=test: Status=${s}, Body=${body.substring(0, 200)}`);
  } catch (e) { console.log('Error:', e.message.substring(0, 100)); }

  // 4. Logout via POST
  console.log('\n--- Testing Logout via POST ---');
  try {
    let resp = await page.goto(BASE + '/api/logout', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log('GET /api/logout status:', resp ? resp.status() : 'none');
    console.log('URL after:', page.url());
    let body = '';
    try { body = await page.locator('body').innerText(); } catch (e) {}
    console.log('Body:', body.substring(0, 200));
  } catch (e) { console.log('Error:', e.message.substring(0, 100)); }

  await browser.close();
}

main().catch(async e => {
  console.error('FATAL:', e.message);
  if (browser) await browser.close();
});
