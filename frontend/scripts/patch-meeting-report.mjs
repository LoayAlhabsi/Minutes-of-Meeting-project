import FS from 'node:fs'
import JSZip from 'jszip'

const SRC = 'c:/Users/jyrcf/Downloads/النموذج المعتمد_1 (1).docx'
const BLANK = 'public/templates/meeting-report-blank.docx'
const FILL = 'public/templates/meeting-report-fill.docx'

FS.copyFileSync(SRC, BLANK)
FS.copyFileSync(SRC, FILL)

function rtlRun(text) {
  return (
    `<w:r><w:rPr><w:rFonts w:cs="Arial"/><w:rtl/><w:lang w:bidi="ar-SA"/></w:rPr>` +
    `<w:t xml:space="preserve">${text}</w:t></w:r>`
  )
}

const zip = await JSZip.loadAsync(FS.readFileSync(FILL))
let xml = await zip.file('word/document.xml').async('string')

// Replace title paragraph that contains الموضوع (presentation-form letters)
xml = xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (para) => {
  const texts = [...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1])
  const joined = texts.join('')
  // الموضوع in Arabic presentation forms appears as اﻟﻤﻮﺿﻮع
  if (joined.includes('ﻣﻮﺿ') || joined === 'اﻟﻤﻮﺿﻮع' || /اﻟﻤﻮﺿﻮ/.test(joined)) {
    // Keep pPr, replace runs with TITLE placeholder
    const pPr = para.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/)?.[0] || ''
    const open = para.match(/^<w:p\b[^>]*>/)?.[0] || '<w:p>'
    return `${open}${pPr}${rtlRun('{{TITLE}}')}</w:p>`
  }
  return para
})

if (!xml.includes('{{TITLE}}')) {
  throw new Error('Could not find title (الموضوع) placeholder')
}

// Inject DISCUSSION into the first empty paragraph after the first "Digitalized" slogan
const digIdx = xml.indexOf('Digitalized')
if (digIdx < 0) throw new Error('Could not find slogan anchor')
const afterSlogan = xml.indexOf('</w:p>', digIdx)
if (afterSlogan < 0) throw new Error('Slogan paragraph end missing')

let injected = false
xml =
  xml.slice(0, afterSlogan + 6) +
  xml.slice(afterSlogan + 6).replace(/<w:p\b[\s\S]*?<\/w:p>/g, (para) => {
    if (injected) return para
    const texts = [...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map(
      (m) => m[1],
    )
    const joined = texts.join('').trim()
    if (joined) return para
    injected = true
    const pPr =
      para.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/)?.[0] ||
      '<w:pPr><w:bidi/></w:pPr>'
    const open = para.match(/^<w:p\b[^>]*>/)?.[0] || '<w:p>'
    return `${open}${pPr}${rtlRun('{{DISCUSSION}}')}</w:p>`
  })

if (!xml.includes('{{DISCUSSION}}')) {
  throw new Error('Could not inject DISCUSSION placeholder')
}

zip.file('word/document.xml', xml)
const out = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
FS.writeFileSync(FILL, out)
console.log('Patched fill template')
console.log('TITLE', xml.includes('{{TITLE}}'), 'DISCUSSION', xml.includes('{{DISCUSSION}}'))
console.log('Blank + fill ready')
