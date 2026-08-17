import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const BLANK_URL = '/templates/meeting-report-blank.docx'

/** Discussion body text size in half-points (24 = 12pt). */
const DISCUSSION_FONT_SIZE = '24'
/** Formal near-white used on the title page in the approved template. */
const FORMAL_WHITE = 'FBFEFF'
/** Dark teal used by discussion-page slogans in the approved template. */
const FOOTER_TEAL = '233C4D'
/** Bottom margin (DXA) so the middle-section Word footer has room. */
const MIDDLE_FOOTER_BOTTOM = '720'

const ARABIC_SLOGAN =
  'رقمنة الصحة والإبتكار لعناية راقية وصحة مستدامة'
const ENGLISH_SLOGAN =
  'Digitalized Health and Innovation Quality Care and sustainable'

const FOOTER_PART = 'word/footerMiddle.xml'
const FOOTER_REL_ID = 'rIdFooterMiddle'

export type MeetingReportInput = {
  title: string
  discussion: string
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function safeFileBase(value: string) {
  const raw = value.trim() || 'محضر-اجتماع'
  return raw
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72)
}

async function fetchTemplate(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load template (${res.status})`)
  return res.arrayBuffer()
}

function isTitleParagraph(joined: string) {
  return joined.includes('ﻣﻮﺿ') || /اﻟﻤﻮﺿﻮ/.test(joined) || joined === 'الموضوع'
}

function paragraphText(para: string) {
  return [...para.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)]
    .map((m) => m[1])
    .join('')
}

function forceRunColor(run: string, color: string) {
  if (!/<w:t[\s>]/.test(run)) return run
  let out = run
    .replace(/\s*w:themeColor="[^"]*"/g, '')
    .replace(/\s*w:themeShade="[^"]*"/g, '')
    .replace(/\s*w:themeTint="[^"]*"/g, '')
  if (/<w:color\b/.test(out)) {
    return out.replace(/<w:color\b[^/]*\/>/g, `<w:color w:val="${color}"/>`)
  }
  if (/<w:rPr\b/.test(out)) {
    return out.replace(
      /<w:rPr\b([^>]*)>/,
      `<w:rPr$1><w:color w:val="${color}"/>`,
    )
  }
  return out.replace(
    '<w:r>',
    `<w:r><w:rPr><w:color w:val="${color}"/></w:rPr>`,
  )
}

/** Center title and replace الموضوع — keep approved white color. */
function fillTitle(xml: string, title: string) {
  const safe = escapeXml(title.trim()) || ' '
  return xml.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (para) => {
    if (!isTitleParagraph(paragraphText(para))) return para

    let next = para
    next = next.replace(/<w:pPr\b[\s\S]*?<\/w:pPr>/, (pPr) => {
      let out = pPr
      if (/w:jc\b/.test(out)) {
        out = out.replace(/<w:jc\b[^/]*\/>/, '<w:jc w:val="center"/>')
      } else {
        out = out.replace('</w:pPr>', '<w:jc w:val="center"/></w:pPr>')
      }
      if (/<w:ind\b/.test(out)) {
        out = out.replace(
          /<w:ind\b[^/]*\/>/,
          '<w:ind w:right="0" w:left="0" w:firstLine="0"/>',
        )
      }
      return out
    })

    let firstTextRun = true
    next = next.replace(/<w:r\b[\s\S]*?<\/w:r>/g, (run) => {
      if (!/<w:t[\s>]/.test(run)) return run
      if (firstTextRun) {
        firstTextRun = false
        const withText = run.replace(
          /<w:t[^>]*>[^<]*<\/w:t>/,
          `<w:t xml:space="preserve">${safe}</w:t>`,
        )
        return forceRunColor(withText, FORMAL_WHITE)
      }
      return ''
    })
    return next
  })
}

function discussionRun(line: string) {
  const value = escapeXml(line) || ' '
  return (
    `<w:r><w:rPr><w:sz w:val="${DISCUSSION_FONT_SIZE}"/><w:szCs w:val="${DISCUSSION_FONT_SIZE}"/><w:rtl/><w:lang w:bidi="ar-SA"/></w:rPr>` +
    `<w:t xml:space="preserve">${value}</w:t></w:r>`
  )
}

/**
 * Put discussion into existing empty body paragraphs after the first slogan,
 * without changing section breaks, drawings, or page layout.
 */
function fillDiscussion(xml: string, discussion: string) {
  const lines = discussion.split(/\r?\n/).map((l) => l.trimEnd())
  const contentLines = lines.length > 0 ? lines : ['']

  const digIdx = xml.indexOf('Digitalized')
  if (digIdx < 0) throw new Error('Could not find content area in template')
  const afterSlogan = xml.indexOf('</w:p>', digIdx)
  if (afterSlogan < 0) throw new Error('Invalid template structure')

  const head = xml.slice(0, afterSlogan + 6)
  const tail = xml.slice(afterSlogan + 6)

  let lineIndex = 0
  const newTail = tail.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (para) => {
    if (lineIndex >= contentLines.length) return para
    if (
      para.includes('<w:drawing') ||
      para.includes('<w:sectPr') ||
      para.includes('<w:pict')
    ) {
      return para
    }
    const text = paragraphText(para).trim()
    if (text) return para

    const line = contentLines[lineIndex]
    lineIndex += 1
    let pPr =
      para.match(/<w:pPr\b[\s\S]*?<\/w:pPr>/)?.[0] ||
      '<w:pPr><w:pStyle w:val="BodyText"/><w:bidi/></w:pPr>'
    if (!/<w:sz\b/.test(pPr)) {
      pPr = pPr.replace(
        '</w:pPr>',
        `<w:rPr><w:sz w:val="${DISCUSSION_FONT_SIZE}"/><w:szCs w:val="${DISCUSSION_FONT_SIZE}"/></w:rPr></w:pPr>`,
      )
    }
    const open = para.match(/^<w:p\b[^>]*>/)?.[0] || '<w:p>'
    return `${open}${pPr}${discussionRun(line)}</w:p>`
  })

  if (lineIndex === 0) {
    throw new Error('Could not place discussion text in template')
  }

  return head + newTail
}

/** Remove only the stray black vertical line above the page-2 logos. */
function removePage2LogoLine(xml: string) {
  let out = xml.replace(
    /<wps:wsp>\s*<wps:cNvPr id="10" name="Graphic 10"\/>[\s\S]*?<\/wps:wsp>/,
    '',
  )
  out = out.replace(
    /<v:line\b[^>]*strokecolor="#000000"[^>]*>[\s\S]*?<\/v:line>/gi,
    '',
  )
  return out
}

/**
 * Keep title-page branding white (title / directorate / slogans).
 * Does not touch discussion-page teal footers.
 */
function ensureTitlePageTextWhite(xml: string) {
  const firstSectEnd = xml.indexOf('</w:sectPr>')
  if (firstSectEnd < 0) return xml

  const headEnd = firstSectEnd + '</w:sectPr>'.length
  const head = xml.slice(0, headEnd)
  const rest = xml.slice(headEnd)

  const nextHead = head.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (para) => {
    const text = paragraphText(para)
    const isBrandingPara =
      isTitleParagraph(text) ||
      /ﻣﺪﻳﺮ|اﻟﻤﺪﻳﺮ|المديرية/.test(text) ||
      /رﻗﻤﻨ|رقمنة/.test(text) ||
      text.includes('Digitalized')

    if (!isBrandingPara) return para
    return para.replace(/<w:r\b[\s\S]*?<\/w:r>/g, (run) =>
      forceRunColor(run, FORMAL_WHITE),
    )
  })

  return nextHead + rest
}

function isMiddleTealFooterPara(para: string) {
  const text = paragraphText(para).trim()
  return (
    (para.includes(FOOTER_TEAL) || para.includes('Graphic 14')) &&
    (text.includes('Digitalized Health') ||
      (/رﻗﻤﻨ|رقمنة/.test(text) && text.length < 120) ||
      (para.includes('Graphic 14') && para.includes(FOOTER_TEAL)))
  )
}

/** Drop floating drawings/pict from a paragraph; keep text runs only. */
function stripDrawingsFromPara(para: string) {
  return para
    .replace(/<w:r\b[\s\S]*?<\/w:r>/g, (run) => {
      if (/<w:drawing|<w:pict|<mc:AlternateContent/.test(run)) return ''
      return run
    })
    .replace(/<mc:AlternateContent\b[\s\S]*?<\/mc:AlternateContent>/g, '')
}

/**
 * Middle-section Word footer built from the approved template slogan paragraphs
 * (side Arabic + English). Floating Graphic 14 is removed so the footer stays clean.
 */
function middleFooterXmlFromTemplate(documentXml: string) {
  const paras = [...documentXml.matchAll(/<w:p\b[\s\S]*?<\/w:p>/g)].map(
    (m) => m[0],
  )
  const footerParas = paras
    .filter(isMiddleTealFooterPara)
    .map(stripDrawingsFromPara)
    .filter((p) => paragraphText(p).trim().length > 0)

  if (footerParas.length === 0) {
    const ar = escapeXml(ARABIC_SLOGAN)
    const en = escapeXml(ENGLISH_SLOGAN)
    return (
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
      `<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` +
      `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
      `<w:p><w:pPr><w:pStyle w:val="BodyText"/><w:bidi/><w:spacing w:before="1"/>` +
      `<w:ind w:right="0" w:left="9003" w:firstLine="0"/><w:jc w:val="left"/></w:pPr>` +
      `<w:r><w:rPr><w:color w:val="${FOOTER_TEAL}"/><w:w w:val="136"/><w:rtl/>` +
      `<w:lang w:bidi="ar-SA"/></w:rPr><w:t xml:space="preserve">${ar}</w:t></w:r></w:p>` +
      `<w:p><w:pPr><w:pStyle w:val="BodyText"/><w:spacing w:before="6"/>` +
      `<w:ind w:left="18"/></w:pPr>` +
      `<w:r><w:rPr><w:color w:val="${FOOTER_TEAL}"/><w:w w:val="110"/></w:rPr>` +
      `<w:t xml:space="preserve">${en}</w:t></w:r></w:p></w:ftr>`
    )
  }

  return (
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    footerParas.join('') +
    `</w:ftr>`
  )
}

/**
 * Remove in-body teal slogan paragraphs (text + Graphic 14 line) from the middle
 * section so only the real Word footer shows — avoids the leftover weird line.
 */
function clearMiddleBodyTealSlogans(xml: string) {
  const sectEnds: number[] = []
  let from = 0
  while (true) {
    const i = xml.indexOf('</w:sectPr>', from)
    if (i < 0) break
    sectEnds.push(i + '</w:sectPr>'.length)
    from = i + 1
  }
  if (sectEnds.length < 2) return xml

  const start = sectEnds[0]
  const end = sectEnds[1]
  const before = xml.slice(0, start)
  const middle = xml.slice(start, end)
  const after = xml.slice(end)

  const cleaned = middle.replace(/<w:p\b[\s\S]*?<\/w:p>/g, (para) =>
    isMiddleTealFooterPara(para) ? '' : para,
  )

  return before + cleaned + after
}

/**
 * Attach the approved slogan footer only to the middle section (section 2).
 * First page (section 1) and last page (section 3) stay without this footer.
 * Extra pages added inside the middle section inherit it automatically.
 */
function attachMiddleSectionFooter(documentXml: string) {
  let sectionIndex = 0
  return documentXml.replace(/<w:sectPr\b[\s\S]*?<\/w:sectPr>/g, (sect) => {
    sectionIndex += 1
    let out = sect.replace(/<w:footerReference\b[^/]*\/>/g, '')

    if (sectionIndex === 2) {
      const ref = `<w:footerReference w:type="default" r:id="${FOOTER_REL_ID}"/>`
      out = out.replace(/<w:sectPr\b([^>]*)>/, `<w:sectPr$1>${ref}`)
      if (/w:pgMar\b/.test(out)) {
        out = out.replace(/<w:pgMar\b([^>]*)\/>/, (_full, attrs: string) => {
          let next = attrs
          if (/w:bottom=/.test(next)) {
            next = next.replace(
              /w:bottom="[^"]*"/,
              `w:bottom="${MIDDLE_FOOTER_BOTTOM}"`,
            )
          } else {
            next += ` w:bottom="${MIDDLE_FOOTER_BOTTOM}"`
          }
          if (/w:footer=/.test(next)) {
            next = next.replace(/w:footer="[^"]*"/, 'w:footer="400"')
          } else {
            next += ' w:footer="400"'
          }
          return `<w:pgMar${next}/>`
        })
      }
    }
    return out
  })
}

async function ensureMiddleFooterParts(zip: JSZip, footerXml: string) {
  zip.file(FOOTER_PART, footerXml)

  const typesFile = zip.file('[Content_Types].xml')
  if (typesFile) {
    let types = await typesFile.async('string')
    if (!types.includes('/word/footerMiddle.xml')) {
      types = types.replace(
        '</Types>',
        `<Override PartName="/word/footerMiddle.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`,
      )
      zip.file('[Content_Types].xml', types)
    }
  }

  const relsFile = zip.file('word/_rels/document.xml.rels')
  if (relsFile) {
    let rels = await relsFile.async('string')
    if (!rels.includes('Target="footerMiddle.xml"')) {
      rels = rels.replace(
        '</Relationships>',
        `<Relationship Id="${FOOTER_REL_ID}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footerMiddle.xml"/></Relationships>`,
      )
      zip.file('word/_rels/document.xml.rels', rels)
    }
  }
}

function prepareTemplateXml(xml: string) {
  let out = removePage2LogoLine(xml)
  out = ensureTitlePageTextWhite(out)
  // Capture original side-styled slogan text before removing it from the body.
  const footerXml = middleFooterXmlFromTemplate(out)
  out = clearMiddleBodyTealSlogans(out)
  out = attachMiddleSectionFooter(out)
  return { documentXml: out, footerXml }
}

function fillDocumentXml(xml: string, input: MeetingReportInput) {
  const prepared = prepareTemplateXml(xml)
  let out = prepared.documentXml
  out = fillTitle(out, input.title)
  out = fillDiscussion(out, input.discussion.trim())
  out = ensureTitlePageTextWhite(out)
  return { documentXml: out, footerXml: prepared.footerXml }
}

async function buildReportBlob(
  zip: JSZip,
  documentXml: string,
  footerXml: string,
) {
  await ensureMiddleFooterParts(zip, footerXml)
  zip.file('word/document.xml', documentXml)
  return zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE',
  })
}

/** Download the official blank approved Word template. */
export async function downloadDefaultMeetingReport() {
  const bytes = await fetchTemplate(BLANK_URL)
  const zip = await JSZip.loadAsync(bytes)
  const doc = zip.file('word/document.xml')
  if (!doc) throw new Error('Template document missing')
  const prepared = prepareTemplateXml(await doc.async('string'))
  const out = await buildReportBlob(
    zip,
    prepared.documentXml,
    prepared.footerXml,
  )
  saveAs(out, 'النموذج-المعتمد.docx')
}

/** Fill title + discussion into the official template without changing formal layout. */
export async function convertMeetingReport(input: MeetingReportInput) {
  const title = input.title.trim()
  const discussion = input.discussion.trim()
  if (!title) throw new Error('Title is required')
  if (!discussion) throw new Error('Discussion is required')

  const bytes = await fetchTemplate(BLANK_URL)
  const zip = await JSZip.loadAsync(bytes)
  const doc = zip.file('word/document.xml')
  if (!doc) throw new Error('Template document missing')

  const filled = fillDocumentXml(await doc.async('string'), {
    title,
    discussion,
  })
  const out = await buildReportBlob(zip, filled.documentXml, filled.footerXml)
  saveAs(out, `${safeFileBase(title)}.docx`)
}
