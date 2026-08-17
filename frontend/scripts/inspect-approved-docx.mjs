import FS from 'node:fs'
import JSZip from 'jszip'

const src = 'c:/Users/jyrcf/Downloads/النموذج المعتمد_1 (1).docx'
const buf = FS.readFileSync(src)
const z = await JSZip.loadAsync(buf)
console.log(
  Object.keys(z.files)
    .filter((f) => !f.endsWith('/'))
    .join('\n'),
)
const xml = await z.file('word/document.xml').async('string')
const texts = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1])
console.log('---TEXTS---')
console.log(JSON.stringify(texts, null, 2))
console.log('tbl', (xml.match(/<w:tbl[\s>]/g) || []).length)
FS.writeFileSync('scripts/_approved-doc.xml', xml)

const tables = xml.split(/<w:tbl[\s>]/).slice(1)
tables.forEach((table, ti) => {
  console.log('\n==== TABLE', ti + 1, '====')
  const rows = table.split(/<w:tr[\s>]/).slice(1)
  rows.forEach((row, ri) => {
    const cells = row.split(/<w:tc[\s>]/).slice(1)
    const cellTexts = cells.map((cell) => {
      const t = [...cell.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
        .map((m) => m[1])
        .join('')
      return t || '(empty)'
    })
    console.log(
      `R${ri + 1} [${cells.length}]:`,
      cellTexts.map((t) => JSON.stringify(t)).join(' | '),
    )
  })
})
