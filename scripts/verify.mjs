import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname } from 'node:path'
import { spawn } from 'node:child_process'
import { chromium } from '@playwright/test'

const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.md': 'text/plain', '.txt': 'text/plain' }
const root = resolve('dist')
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname
  const file = path === '/' || path.startsWith('/admin') ? '/index.html' : path
  const resolved = resolve(root, '.' + file)
  if (!resolved.startsWith(root + '/')) { res.writeHead(403); res.end(); return }
  try { const content = await readFile(resolved); res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream'); res.end(content) } catch { res.writeHead(404); res.end('Not found') }
})
await new Promise(r => server.listen(4173, '127.0.0.1', r))
let browser
let exit = 0
try {
  const child = spawn('npx', ['playwright', 'test'], { stdio: 'inherit' })
  exit = await new Promise(resolve => child.on('close', resolve))
  browser = await chromium.launch({ headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 1050 }, deviceScaleFactor: 1 })
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: 'test-results/desktop.png', fullPage: false })
  await page.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y=0; y<document.body.scrollHeight; y+=650) { scrollTo(0,y); await new Promise(r => setTimeout(r,200)) } scrollTo(0,0); document.activeElement?.blur() })
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'test-results/full-page.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('http://127.0.0.1:4173/')
  await page.waitForTimeout(1200)
  await page.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto'; for (let y=0; y<document.body.scrollHeight; y+=500) { scrollTo(0,y); await new Promise(r => setTimeout(r,150)) } scrollTo(0,0); document.activeElement?.blur() })
  await page.waitForTimeout(700)
  await page.screenshot({ path: 'test-results/mobile.png', fullPage: true })
  await page.goto('http://127.0.0.1:4173/admin')
  await page.waitForTimeout(400)
  await page.screenshot({ path: 'test-results/admin.png', fullPage: true })
  console.log('Screenshots saved to test-results. All verification processes will now stop.')
} finally {
  await browser?.close()
  server.closeAllConnections()
  await new Promise(r => server.close(r))
}
process.exitCode = exit
