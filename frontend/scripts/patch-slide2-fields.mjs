import FS from 'node:fs'
import JSZip from 'jszip'

const blankPath = 'public/templates/presentation-blank.pptx'
const fillPath = 'public/templates/presentation-default.pptx'

/** Slide 2: title box + empty body box (size/layout only — not filled by convert). */
function contentTextBoxes(nextIdStart) {
  const titleId = nextIdStart
  const bodyId = nextIdStart + 1

  const titleBox =
    `<p:sp><p:nvSpPr><p:cNvPr id="${titleId}" name="Slide2 Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>` +
    `<p:spPr><a:xfrm><a:off x="914400" y="1000000"/><a:ext cx="9144000" cy="800000"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:noFill/></a:ln></p:spPr>` +
    `<p:txBody><a:bodyPr lIns="0" tIns="0" rIns="0" bIns="0" rtlCol="0" anchor="ctr"><a:spAutoFit/></a:bodyPr><a:lstStyle/>` +
    `<a:p><a:pPr algn="ctr" rtl="1"/><a:r><a:rPr lang="ar-EG" sz="3200" b="1">` +
    `<a:solidFill><a:srgbClr val="10253F"/></a:solidFill>` +
    `<a:latin typeface="Doran Bold"/><a:ea typeface="Doran Bold"/><a:cs typeface="Doran Bold"/><a:sym typeface="Doran Bold"/><a:rtl/></a:rPr>` +
    `<a:t>العنوان</a:t></a:r></a:p></p:txBody></p:sp>`

  // Text area placeholder label (like العنوان for title)
  const bodyBox =
    `<p:sp><p:nvSpPr><p:cNvPr id="${bodyId}" name="Slide2 Body"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>` +
    `<p:spPr><a:xfrm><a:off x="914400" y="2000000"/><a:ext cx="9144000" cy="4600000"/></a:xfrm>` +
    `<a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:noFill/></a:ln></p:spPr>` +
    `<p:txBody><a:bodyPr lIns="91440" tIns="91440" rIns="91440" bIns="91440" rtlCol="0" anchor="t"/><a:lstStyle/>` +
    `<a:p><a:pPr algn="r" rtl="1"/><a:r><a:rPr lang="ar-EG" sz="1800">` +
    `<a:solidFill><a:srgbClr val="10253F"/></a:solidFill>` +
    `<a:latin typeface="Siwa"/><a:ea typeface="Siwa"/><a:cs typeface="Siwa"/><a:sym typeface="Siwa"/><a:rtl/></a:rPr>` +
    `<a:t>نص</a:t></a:r></a:p></p:txBody></p:sp>`

  return titleBox + bodyBox
}

async function ensureSlide2Layout(filePath) {
  const zip = await JSZip.loadAsync(FS.readFileSync(filePath))
  const slidePath = 'ppt/slides/slide2.xml'
  let xml = await zip.file(slidePath).async('string')

  xml = xml.replace(
    /<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Slide2 Title"[\s\S]*?<\/p:sp><p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Slide2 Body"[\s\S]*?<\/p:sp>/,
    '',
  )
  // also remove older placeholder names if present
  xml = xml.replace(
    /<p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Title Placeholder"[\s\S]*?<\/p:sp><p:sp><p:nvSpPr><p:cNvPr id="\d+" name="Content Placeholder"[\s\S]*?<\/p:sp>/,
    '',
  )

  const ids = [...xml.matchAll(/\bid="(\d+)"/g)].map((m) => Number(m[1]))
  const nextId = Math.max(...ids, 10) + 1
  if (!xml.includes('</p:spTree>')) throw new Error('spTree missing: ' + filePath)
  xml = xml.replace('</p:spTree>', `${contentTextBoxes(nextId)}</p:spTree>`)

  zip.file(slidePath, xml)
  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  })
  FS.writeFileSync(filePath, out)
  console.log('Slide2 title + empty body:', filePath)
}

await ensureSlide2Layout(blankPath)
await ensureSlide2Layout(fillPath)
