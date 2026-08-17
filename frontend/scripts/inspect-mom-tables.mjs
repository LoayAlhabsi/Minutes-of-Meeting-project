import FS from 'node:fs'

const xml = FS.readFileSync('scripts/_mom-doc.xml', 'utf8')

// Split into tables roughly
const tables = xml.split(/<w:tbl[\s>]/).slice(1)
console.log('tables', tables.length)

tables.forEach((table, ti) => {
  console.log('\n==== TABLE', ti + 1, '====')
  const rows = table.split(/<w:tr[\s>]/).slice(1)
  rows.forEach((row, ri) => {
    const cells = row.split(/<w:tc[\s>]/).slice(1)
    const cellTexts = cells.map((cell) => {
      const texts = [...cell.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(
        (m) => m[1],
      )
      return texts.join('') || '(empty)'
    })
    console.log(`R${ri + 1} [${cells.length}]:`, cellTexts.map((t) => JSON.stringify(t)).join(' | '))
  })
})
