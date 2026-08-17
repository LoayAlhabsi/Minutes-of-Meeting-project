import FS from 'node:fs'

const xml = FS.readFileSync('scripts/_mom-doc.xml', 'utf8')
const tables = xml.split(/<w:tbl[\s>]/).slice(1)
const t3 = tables[2]
const rows = t3.split(/<w:tr[\s>]/).slice(1)

function cellXml(row) {
  return row.split(/<w:tc[\s>]/).slice(1)
}

;[1, 3, 4].forEach((ri) => {
  console.log('\n==== T3 R' + (ri + 1) + ' ====')
  const cells = cellXml(rows[ri])
  cells.forEach((c, i) => {
    console.log('CELL', i, 'len', c.length)
    console.log(c.slice(0, 800))
  })
})

// Table1 empty value cells sample
const t1 = tables[0]
const t1rows = t1.split(/<w:tr[\s>]/).slice(1)
console.log('\n==== T1 R2 empty cell ====')
console.log(cellXml(t1rows[1])[0].slice(0, 600))
