import FS from 'node:fs'
import JSZip from 'jszip'

const buf = FS.readFileSync(
  'c:/Users/jyrcf/Downloads/نموذج محضر اجتماعات عربي.docx',
)
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
console.log('len', xml.length)
console.log('tbl', (xml.match(/<w:tbl[\s>]/g) || []).length)
console.log('tr', (xml.match(/<w:tr[\s>]/g) || []).length)
// find empty cells / sparse content areas
FS.writeFileSync('scripts/_mom-doc.xml', xml)
console.log('wrote scripts/_mom-doc.xml')
