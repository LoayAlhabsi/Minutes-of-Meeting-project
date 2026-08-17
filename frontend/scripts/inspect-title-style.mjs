import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-blank.docx'),
)
const xml = await z.file('word/document.xml').async('string')

// Title paragraph
const paras = [...xml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map((m) => m[0])
for (const para of paras) {
  const texts = [...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1])
  const joined = texts.join('')
  if (joined.includes('ﻣﻮﺿ') || /اﻟﻤﻮﺿﻮ/.test(joined)) {
    console.log('=== TITLE PARA ===')
    console.log(para)
    break
  }
}

// Section breaks
let idx = 0
let n = 0
while ((idx = xml.indexOf('<w:sectPr', idx)) >= 0) {
  n += 1
  console.log('\n=== sectPr', n, 'at', idx, '===')
  console.log(xml.slice(idx, idx + 400))
  idx += 10
}
