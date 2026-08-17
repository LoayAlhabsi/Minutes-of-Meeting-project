import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-blank.docx'),
)
const xml = await z.file('word/document.xml').async('string')

// All v:line
for (const m of xml.matchAll(/<v:line\b[\s\S]*?\/>/g)) {
  console.log('VLINE', m[0])
}
for (const m of xml.matchAll(/<v:line\b[\s\S]*?<\/v:line>/g)) {
  console.log('VLINE2', m[0].slice(0, 300))
}

// Find underline runs
for (const m of xml.matchAll(/<w:u\b[^/]*\/>/g)) {
  const i = m.index
  console.log('\nUNDERLINE at', i, m[0])
  console.log(xml.slice(i - 120, i + 200))
}

// After first sectPr — first 1500 chars of page2-ish content
const firstSectEnd = xml.indexOf('</w:sectPr>')
console.log('\n=== AFTER SECT1 ===')
console.log(xml.slice(firstSectEnd, firstSectEnd + 2000))

// Title colors again with presentation forms search
const titleIdx = xml.indexOf('اﻟﻤﻮﺿﻮ')
console.log('\ntitle idx', titleIdx)
console.log(xml.slice(titleIdx - 180, titleIdx + 40))
const dirIdx = xml.indexOf('اﻟﻤﺪﻳﺮ')
console.log('\ndir idx', dirIdx)
console.log(xml.slice(dirIdx - 180, dirIdx + 40))
