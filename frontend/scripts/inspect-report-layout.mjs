import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-blank.docx'),
)
const xml = await z.file('word/document.xml').async('string')

// Show section margins and nearby drawing anchors for page 2
let idx = 0
let n = 0
while ((idx = xml.indexOf('<w:sectPr', idx)) >= 0) {
  n += 1
  console.log('\n=== sect', n, '===')
  console.log(xml.slice(idx, idx + 280))
  idx += 10
}

// Title paragraph
for (const para of xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)) {
  const p = para[0]
  const t = [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]).join('')
  if (t.includes('ﻣﻮﺿ') || /اﻟﻤﻮﺿﻮ/.test(t)) {
    console.log('\nTITLE pPr:', p.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/)?.[0])
    break
  }
}

// Find drawings with positions around second section
const drawings = [...xml.matchAll(/<wp:anchor[\s\S]{0,200}/g)]
console.log('\nanchors', drawings.length)
drawings.slice(0, 5).forEach((d, i) => console.log(i, d[0].slice(0, 180)))
