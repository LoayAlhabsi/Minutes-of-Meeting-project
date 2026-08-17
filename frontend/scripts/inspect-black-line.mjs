import FS from 'node:fs'
import JSZip from 'jszip'

const z = await JSZip.loadAsync(
  FS.readFileSync('public/templates/meeting-report-blank.docx'),
)
const xml = await z.file('word/document.xml').async('string')

const black = xml.indexOf('strokecolor="#000000"')
console.log('black line at', black)
console.log(xml.slice(black - 400, black + 200))

// Count black vs white lines
console.log(
  'black',
  (xml.match(/strokecolor="#000000"/g) || []).length,
  'white',
  (xml.match(/strokecolor="#fbfeff"/gi) || []).length,
)

// Page2 group line stroke color
const g = xml.indexOf('name="Graphic 10"')
console.log('\nGraphic 10 area')
console.log(xml.slice(g, g + 800))
