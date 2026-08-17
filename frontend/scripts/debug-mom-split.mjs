import FS from 'node:fs'
import JSZip from 'jszip'

// reset fill from blank
FS.copyFileSync(
  'public/templates/meeting-report-blank.docx',
  'public/templates/meeting-report-fill.docx',
)

const zip = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-fill.docx'),
)
let xml = await zip.file('word/document.xml').async('string')

const tblOpen = [...xml.matchAll(/<w:tbl[\s>]/g)]
console.log('tbl opens', tblOpen.length, tblOpen.map((m) => m.index))

const tableChunks = xml.split(/(<w:tbl[\s>][\s\S]*?<\/w:tbl>)/)
console.log(
  'chunks',
  tableChunks.length,
  tableChunks.map((c, i) => ({
    i,
    start: c.slice(0, 20),
    isTbl: c.startsWith('<w:tbl'),
  })),
)

// First table rows
const t1 = tableChunks.find((c) => c.startsWith('<w:tbl'))
const trs = [...t1.matchAll(/<w:tr[\s>]/g)]
console.log('t1 tr opens', trs.length)

const rowParts = t1.split(/(<w:tr[\s>][\s\S]*?<\/w:tr>)/)
console.log(
  'rowParts',
  rowParts.filter((p) => p.startsWith('<w:tr')).length,
)

const row2 = rowParts.find((p) => p.startsWith('<w:tr'))
// get second tr
const rows = rowParts.filter((p) => p.startsWith('<w:tr'))
console.log('row2 start', rows[1]?.slice(0, 200))
const cells = rows[1].split(/(<w:tc[\s>][\s\S]*?<\/w:tc>)/).filter((c) =>
  c.startsWith('<w:tc'),
)
console.log('cells', cells.length)
console.log('cell0 has t?', /<w:t[\s>]/.test(cells[0]), cells[0].slice(0, 300))
console.log('cell1 texts', [...cells[1].matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(m=>m[1]))
