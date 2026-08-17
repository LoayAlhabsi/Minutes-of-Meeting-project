import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const FILL_TEMPLATE_URL = '/templates/presentation-default.pptx'
const BLANK_TEMPLATE_URL = '/templates/presentation-blank.pptx'

const TITLE_PLACEHOLDER = '{{TITLE}}'
const NAME_PLACEHOLDER = '{{NAME}}'

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function safeFileBase(value: string) {
  const raw = value.trim() || 'presentation'
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

/** Download the official blank PowerPoint template (formal design unchanged). */
export async function downloadDefaultPresentationFormat() {
  const bytes = await fetchTemplate(BLANK_TEMPLATE_URL)
  saveAs(
    new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    }),
    'النموذج-المعتمد-للعرض-المرئي.pptx',
  )
}

/** Fill title + name on slide 1 only; keep the formal template design as-is. */
export async function convertPresentationPpt(input: {
  title: string
  name: string
}) {
  const title = input.title.trim()
  const name = input.name.trim()
  if (!title) throw new Error('Title is required')
  if (!name) throw new Error('Name is required')

  const bytes = await fetchTemplate(FILL_TEMPLATE_URL)
  const zip = await JSZip.loadAsync(bytes)
  const slidePath = 'ppt/slides/slide1.xml'
  const slideFile = zip.file(slidePath)
  if (!slideFile) throw new Error('Template slide missing')

  let xml = await slideFile.async('string')
  if (!xml.includes(TITLE_PLACEHOLDER) || !xml.includes(NAME_PLACEHOLDER)) {
    throw new Error('Template placeholders missing')
  }

  xml = xml
    .replaceAll(TITLE_PLACEHOLDER, escapeXml(title))
    .replaceAll(NAME_PLACEHOLDER, escapeXml(name))

  zip.file(slidePath, xml)
  const out = await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    compression: 'DEFLATE',
  })
  saveAs(out, `${safeFileBase(title)}.pptx`)
}
