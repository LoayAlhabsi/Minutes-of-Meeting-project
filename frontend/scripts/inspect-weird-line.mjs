import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-blank.docx'),
)
const xml = await z.file('word/document.xml').async('string')

// Split roughly by sectPr to inspect page2 content
const parts = xml.split(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/)
console.log('parts after sect split', parts.length)

// Look for lines: pict, w:tblBorders, pBdr, underline, hr-like shapes
const checks = [
  'w:pBdr',
  'w:u ',
  'w:u>',
  'w:bottom',
  'w:top w:val',
  'w:tblBorders',
  'v:line',
  'w:drawing',
  'w:br',
]
for (const c of checks) {
  console.log(c, (xml.match(new RegExp(c, 'g')) || []).length)
}

// Inspect paragraphs that might be empty but have borders
let i = 0
for (const m of xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)) {
  const p = m[0]
  if (p.includes('pBdr') || p.includes('<w:u ') || p.includes('w:bdr')) {
    console.log('\nPARA with border/underline', i)
    console.log(p.slice(0, 500))
  }
  // thin shapes / lines
  if (p.includes('w:drawing') && p.includes('sectPr') === false) {
    const text = [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((x) => x[1]).join('')
    if (!text.trim()) {
      // check extent height - very thin = line
      const ext = p.match(/cy="(\d+)"/)
      const pos = p.match(/<a:off[^>]*y="(\d+)"/)
      if (ext && Number(ext[1]) < 200000) {
        console.log('\nTHIN drawing para', i, 'cy', ext[1], 'y', pos?.[1])
        console.log(p.slice(0, 400))
      }
    }
  }
  i += 1
}

// Find color on title/directorate/slogans
const targets = ['ﻣﻮﺿ', 'ﻣﺪﻳﺮ', 'رﻗﻤﻨ', 'Digitalized']
for (const t of targets) {
  const idx = xml.indexOf(t)
  if (idx < 0) {
    // try find nearby
    console.log('missing', t)
    continue
  }
  const snip = xml.slice(Math.max(0, idx - 200), idx + 80)
  const color = snip.match(/w:color w:val="([A-F0-9]+)"/i)
  console.log(t, 'nearby color', color?.[1])
}
