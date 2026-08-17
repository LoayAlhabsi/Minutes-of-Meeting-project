import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-blank.docx'),
)
const xml = await z.file('word/document.xml').async('string')
let t = 0
xml.replace(/<w:tbl\b[\s\S]*?<\/w:tbl>/g, (table) => {
  t += 1
  console.log(
    'table',
    t,
    'أعده',
    table.includes('أعده'),
    'وافق',
    table.includes('وافق'),
  )
  return table
})
const stripped = xml.replace(/<w:tbl\b[\s\S]*?<\/w:tbl>/g, '')
console.log('outside أعده', stripped.includes('أعده'))
