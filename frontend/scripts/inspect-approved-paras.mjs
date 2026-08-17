import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('c:/Users/jyrcf/Downloads/النموذج المعتمد_1 (1).docx'),
)
const xml = await z.file('word/document.xml').async('string')

// Join consecutive w:t to reconstruct words better by paragraph
const paras = xml.split(/<w:p[\s>]/).slice(1)
console.log('paragraphs', paras.length)
paras.forEach((p, i) => {
  const texts = [...p.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1])
  const joined = texts.join('')
  if (joined.trim()) {
    console.log(i, JSON.stringify(joined.slice(0, 120)))
  } else {
    console.log(i, '(empty para)')
  }
})
