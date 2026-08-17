import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import JSZip from 'jszip'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const templatePath = path.resolve(
  __dirname,
  '../public/templates/presentation-default.pptx',
)

const TITLE_PLACEHOLDER = '{{TITLE}}'
const NAME_PLACEHOLDER = '{{NAME}}'

const zip = await JSZip.loadAsync(fs.readFileSync(templatePath))
const slidePath = 'ppt/slides/slide1.xml'
let xml = await zip.file(slidePath).async('string')

if (!xml.includes('العنوان') && !xml.includes(TITLE_PLACEHOLDER)) {
  throw new Error('Could not find title placeholder in slide1')
}

xml = xml.replace('>العنوان</a:t>', `>${TITLE_PLACEHOLDER}</a:t>`)

if (!xml.includes(NAME_PLACEHOLDER)) {
  const marker =
    '</a:r></a:p></p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="10"'
  const idx = xml.indexOf(marker)
  if (idx < 0) throw new Error('Could not find title text box end')

  const nameParagraph =
    '</a:r></a:p>' +
    '<a:p><a:pPr algn="ctr" rtl="1"><a:lnSpc><a:spcPts val="2400"/></a:lnSpc></a:pPr>' +
    '<a:r><a:rPr lang="ar-EG" sz="2200" b="1" spc="11">' +
    '<a:solidFill><a:srgbClr val="FCFEFF"/></a:solidFill>' +
    '<a:latin typeface="Doran Bold"/><a:ea typeface="Doran Bold"/>' +
    '<a:cs typeface="Doran Bold"/><a:sym typeface="Doran Bold"/><a:rtl/></a:rPr>' +
    `<a:t>${NAME_PLACEHOLDER}</a:t></a:r></a:p>` +
    '</p:txBody></p:sp><p:sp><p:nvSpPr><p:cNvPr id="10"'

  xml = xml.slice(0, idx) + nameParagraph + xml.slice(idx + marker.length)
}

zip.file(slidePath, xml)
const out = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
})
fs.writeFileSync(templatePath, out)
console.log('Patched template:', templatePath)
console.log('TITLE:', xml.includes(TITLE_PLACEHOLDER), 'NAME:', xml.includes(NAME_PLACEHOLDER))
