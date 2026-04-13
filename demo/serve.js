#!/usr/bin/env node
/**
 * Generates one HTML page per preset from template.html and serves
 * each on its own port so they can be compared side-by-side.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Presets (matches examples/storefront-presets.ts) ──────────────────────
const presets = [
  {
    id: 'default',
    label: 'Current Design',
    port: 3001,
    vars: {
      BG: '#111827',
      BG_ALT: '#0F172A',
      SURFACE: '#1E293B',
      BORDER: '#334155',
      TEXT: '#F8FAFC',
      TEXT_MUTED: '#94A3B8',
      ACCENT: '#2563EB',
      ACCENT_HOVER: '#3B82F6',
    },
  },
  {
    id: 'cool-steel',
    label: 'Cool Steel',
    port: 3002,
    vars: {
      BG: '#0C1220',
      BG_ALT: '#141E30',
      SURFACE: '#1C2940',
      BORDER: '#2A3A55',
      TEXT: '#DAE1ED',
      TEXT_MUTED: '#7A8FAA',
      ACCENT: '#3B8ECC',
      ACCENT_HOVER: '#5AA3DD',
    },
  },
  {
    id: 'warm-earth',
    label: 'Warm Earth',
    port: 3003,
    vars: {
      BG: '#1A1510',
      BG_ALT: '#241E16',
      SURFACE: '#2E261D',
      BORDER: '#3D3428',
      TEXT: '#F0E8DC',
      TEXT_MUTED: '#A69882',
      ACCENT: '#CC8A10',
      ACCENT_HOVER: '#E09E28',
    },
  },
  {
    id: 'forest-moss',
    label: 'Forest Moss',
    port: 3004,
    vars: {
      BG: '#0F1612',
      BG_ALT: '#162019',
      SURFACE: '#1E2B23',
      BORDER: '#2B3C30',
      TEXT: '#E6ECE4',
      TEXT_MUTED: '#8FA093',
      ACCENT: '#6AAA64',
      ACCENT_HOVER: '#85C27F',
    },
  },
]

// ── Build HTML files ──────────────────────────────────────────────────────
const template = readFileSync(join(__dirname, 'template.html'), 'utf-8')
const outDir = join(__dirname, 'dist')
mkdirSync(outDir, { recursive: true })

for (const preset of presets) {
  let html = template
  html = html.replaceAll('{{PRESET_LABEL}}', preset.label)
  html = html.replaceAll('{{PORT}}', String(preset.port))
  for (const [key, value] of Object.entries(preset.vars)) {
    html = html.replaceAll(`{{${key}}}`, value)
  }
  const outPath = join(outDir, `${preset.id}.html`)
  writeFileSync(outPath, html)
}

// ── Serve each preset on its own port ─────────────────────────────────────
const servers = []

for (const preset of presets) {
  const html = readFileSync(join(outDir, `${preset.id}.html`), 'utf-8')
  const server = createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(html)
  })
  server.listen(preset.port, () => {
    console.log(`  ${preset.label.padEnd(16)} → http://localhost:${preset.port}`)
  })
  servers.push(server)
}

console.log('\n  All 4 presets running. Press Ctrl+C to stop.\n')

process.on('SIGINT', () => {
  for (const s of servers) s.close()
  process.exit(0)
})
