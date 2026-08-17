import { jsPDF } from 'jspdf'
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  WidthType,
  ShadingType,
  VerticalAlign,
} from 'docx'
import { saveAs } from 'file-saver'
import {
  dataUrlFormat,
  dataUrlToBytes,
  getExportFormatSettings,
  getExportSlogans,
  hexToRgb,
  logoSizeScale,
  type ExportFormatSettings,
  type LogoSlot,
} from './exportFormat'
import {
  bilingualLine,
  exportLabels,
  type BilingualLabel,
  type ExportLabels,
  type Locale,
} from './localization'

export type ExportAttendee = { name: string; designation: string }
export type ExportDecision = { text: string }

export type ExportMinute = {
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  approvedBy?: string
  attendees: ExportAttendee[]
  decisions: ExportDecision[]
}

function resolveSettings(
  override?: ExportFormatSettings,
): ExportFormatSettings {
  return override ?? getExportFormatSettings()
}

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
}

/**
 * Match Minutes of Meeting.docx 5-column grid (DXA).
 * Spans: label=2, value=3, name=4, designation=1, num=1, decision=4, full=5
 */
const COLS = [522, 1867, 1829, 412, 5240] as const
const TABLE_W = COLS.reduce((a, b) => a + b, 0)
const W_LABEL = COLS[0] + COLS[1] // 2389
const W_VALUE = COLS[2] + COLS[3] + COLS[4] // 7481
const W_NAME = COLS[0] + COLS[1] + COLS[2] + COLS[3] // 4630
const W_DESIG = COLS[4] // 5240
const W_NUM = COLS[0] // 522
const W_DECISION = COLS[1] + COLS[2] + COLS[3] + COLS[4] // 9348
const ROW_H = 440
/** Minimum discussion cell height (DXA) when content is short */
const DISCUSSION_H_MIN = 900
/** Leave a bit of unused page space so Discussion is not overly tall. */
const DISCUSSION_HEIGHT_SHRINK = 900

/**
 * A4 usable height in DXA after Word margins (top 480 / bottom 560).
 * Used to size the discussion cell for a one-page layout.
 */
const WORD_PAGE_USABLE = 15798

function splitParagraphs(text: string) {
  const parts = (text || '')
    .split(/\n+/)
    .map((part) => part.trim())
    .filter(Boolean)
  return parts.length > 0 ? parts : [' ']
}

function countExportBlocks(minute: ExportMinute) {
  const attendees = Math.max(1, minute.attendees?.length ?? 0)
  const decisions = Math.max(2, minute.decisions?.length ?? 0)
  const discussionLines = splitParagraphs(minute.discussion).reduce(
    (sum, part) => sum + Math.max(1, Math.ceil(part.length / 72)),
    0,
  )
  return { attendees, decisions, discussionLines }
}

/** Size discussion so logos + table + footer fit one Word page (slightly shorter box). */
function wordDiscussionHeight(
  minute: ExportMinute,
  settings: ExportFormatSettings,
): number {
  const { attendees, decisions } = countExportBlocks(minute)
  const logoBlock = settings.showLogos ? 1400 : 0
  const preparedBlock = 900
  const sloganBlock = settings.showSlogans ? 900 : 0
  // 4 section headers + 3 meeting fields + attendance header
  const fixedRows = 4 + 3 + 1
  const used =
    logoBlock +
    (fixedRows + attendees + decisions) * ROW_H +
    preparedBlock +
    sloganBlock
  const fill = WORD_PAGE_USABLE - used - DISCUSSION_HEIGHT_SHRINK
  return Math.max(DISCUSSION_H_MIN, Math.min(fill, 6200))
}

async function loadBrandBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}`)
  return new Uint8Array(await res.arrayBuffer())
}

type ResolvedLogo = {
  bytes: Uint8Array
  dataUrl: string
  format: 'PNG' | 'JPEG'
  name: string
}

async function resolveLogoSlot(
  slot: LogoSlot,
  name: string,
): Promise<ResolvedLogo | null> {
  if (!slot.enabled) return null
  if (slot.customDataUrl) {
    return {
      bytes: dataUrlToBytes(slot.customDataUrl),
      dataUrl: slot.customDataUrl,
      format: dataUrlFormat(slot.customDataUrl),
      name,
    }
  }
  if (!slot.defaultPath) return null
  const bytes = await loadBrandBytes(slot.defaultPath)
  return {
    bytes,
    dataUrl: bytesToDataUrl(bytes),
    format: 'PNG',
    name,
  }
}

async function resolveHeaderLogos(settings: ExportFormatSettings) {
  const [left, right, extra] = await Promise.all([
    resolveLogoSlot(settings.leftLogo, 'left-logo'),
    resolveLogoSlot(settings.rightLogo, 'right-logo'),
    resolveLogoSlot(settings.extraLogo, 'extra-logo'),
  ])
  return [left, extra, right].filter(Boolean) as ResolvedLogo[]
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function bytesToDataUrl(bytes: Uint8Array, mime = 'image/png') {
  return `data:${mime};base64,${bytesToBase64(bytes)}`
}

function hasArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text)
}

function fileBase(minute: ExportMinute, labels: ExportLabels) {
  const raw = (minute.title || labels.fileFallback).trim()
  const safe = raw
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 72)
    .replace(/-$/g, '')
  const datePart = minute.date || labels.fileDateFallback
  return `${safe || labels.fileFallback}-${datePart}`
}

function p(
  text: string,
  opts?: {
    bold?: boolean
    center?: boolean
    size?: number
    arabic?: boolean
    after?: number
    align?: 'left' | 'right' | 'center'
  },
) {
  const arabic = opts?.arabic ?? hasArabic(text)
  const alignment =
    opts?.center || opts?.align === 'center'
      ? AlignmentType.CENTER
      : opts?.align === 'right'
        ? AlignmentType.RIGHT
        : opts?.align === 'left'
          ? AlignmentType.LEFT
          : arabic
            ? AlignmentType.RIGHT
            : AlignmentType.LEFT
  return new Paragraph({
    alignment,
    bidirectional: arabic,
    spacing: { after: opts?.after ?? 0 },
    children: [
      new TextRun({
        text: text || ' ',
        bold: opts?.bold,
        size: opts?.size ?? 22,
        font: arabic ? 'Segoe UI' : 'Times New Roman',
        rightToLeft: arabic,
      }),
    ],
  })
}

function bilingualParagraphs(
  label: BilingualLabel,
  opts?: { bold?: boolean; center?: boolean; rtl?: boolean },
) {
  const rtl = !!opts?.rtl
  const align = opts?.center ? 'center' : rtl ? 'right' : 'left'
  const text = rtl ? label.ar : label.en
  return [
    p(text, {
      bold: opts?.bold,
      align,
      arabic: rtl,
    }),
  ]
}

function cell(
  text: string,
  width: number,
  span: number,
  opts?: {
    bold?: boolean
    center?: boolean
    fill?: string
    arabic?: boolean
    top?: boolean
    align?: 'left' | 'right' | 'center'
  },
) {
  return new TableCell({
    borders: BORDER,
    width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    shading: opts?.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill }
      : undefined,
    verticalAlign: opts?.top ? VerticalAlign.TOP : VerticalAlign.CENTER,
    children: [
      p(text, {
        bold: opts?.bold,
        center: opts?.center,
        arabic: opts?.arabic ?? hasArabic(text),
        align: opts?.align,
      }),
    ],
  })
}

function bilingualCell(
  label: BilingualLabel,
  width: number,
  span: number,
  opts?: {
    bold?: boolean
    center?: boolean
    fill?: string
    top?: boolean
    rtl?: boolean
  },
) {
  return new TableCell({
    borders: BORDER,
    width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    shading: opts?.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill }
      : undefined,
    verticalAlign: opts?.top ? VerticalAlign.TOP : VerticalAlign.CENTER,
    children: bilingualParagraphs(label, opts),
  })
}

function sectionHeaderRow(
  label: BilingualLabel,
  settings: ExportFormatSettings,
  rtl = false,
) {
  return new TableRow({
    height: { value: ROW_H, rule: HeightRule.ATLEAST },
    children: [
      bilingualCell(label, TABLE_W, 5, {
        bold: true,
        center: true,
        fill: settings.headerColor,
        rtl,
      }),
    ],
  })
}

function labelValueRow(label: BilingualLabel, value: string, rtl = false) {
  const labelCell = bilingualCell(label, W_LABEL, 2, {
    bold: true,
    top: true,
    rtl,
  })
  const valueCell = cell(value || ' ', W_VALUE, 3, {
    arabic: hasArabic(value),
    top: true,
    align: rtl && !hasArabic(value) ? 'right' : undefined,
  })
  return new TableRow({
    height: { value: ROW_H, rule: HeightRule.ATLEAST },
    cantSplit: false,
    children: rtl ? [valueCell, labelCell] : [labelCell, valueCell],
  })
}

function buildMomTable(
  minute: ExportMinute,
  labels: ExportLabels,
  settings: ExportFormatSettings,
  rtl = false,
) {
  const attendees =
    minute.attendees?.length > 0
      ? minute.attendees
      : [{ name: '', designation: '' }]
  const decisions =
    minute.decisions?.length > 0
      ? minute.decisions
      : [{ text: '' }, { text: '' }]

  const nameHeader = bilingualCell(labels.name, W_NAME, 4, {
    bold: true,
    center: true,
    rtl,
  })
  const desigHeader = bilingualCell(labels.designation, W_DESIG, 1, {
    bold: true,
    center: true,
    rtl,
  })

  const rows: TableRow[] = [
    sectionHeaderRow(labels.meeting, settings, rtl),
    labelValueRow(labels.meetingTitle, minute.title, rtl),
    labelValueRow(labels.meetingLocation, minute.location, rtl),
    labelValueRow(labels.meetingDate, minute.date, rtl),
    sectionHeaderRow(labels.attendance, settings, rtl),
    new TableRow({
      height: { value: ROW_H, rule: HeightRule.ATLEAST },
      children: rtl ? [desigHeader, nameHeader] : [nameHeader, desigHeader],
    }),
    ...attendees.map((a) => {
      const nameCell = cell(a.name || ' ', W_NAME, 4, {
        arabic: hasArabic(a.name),
        align: rtl ? 'right' : undefined,
      })
      const desigCell = cell(a.designation || ' ', W_DESIG, 1, {
        arabic: hasArabic(a.designation),
        align: rtl ? 'right' : undefined,
      })
      return new TableRow({
        height: { value: ROW_H, rule: HeightRule.ATLEAST },
        cantSplit: false,
        children: rtl ? [desigCell, nameCell] : [nameCell, desigCell],
      })
    }),
    sectionHeaderRow(labels.discussion, settings, rtl),
    new TableRow({
      height: {
        value: wordDiscussionHeight(minute, settings),
        // Exact height keeps the whole MOM on one page by default.
        rule: HeightRule.EXACT,
      },
      cantSplit: true,
      children: [
        new TableCell({
          borders: BORDER,
          width: { size: TABLE_W, type: WidthType.DXA },
          columnSpan: 5,
          verticalAlign: VerticalAlign.TOP,
          children: [
            ...splitParagraphs(minute.discussion).map((part) =>
              p(part, {
                arabic: hasArabic(part),
                after: 160,
                align: rtl ? 'right' : undefined,
              }),
            ),
            p(' '),
          ],
        }),
      ],
    }),
    sectionHeaderRow(labels.decisions, settings, rtl),
    ...decisions.map((d, i) => {
      const numCell = cell(String(i + 1), W_NUM, 1, {
        bold: true,
        center: true,
      })
      const textCell = cell(d.text || ' ', W_DECISION, 4, {
        arabic: hasArabic(d.text),
        top: true,
        align: rtl ? 'right' : undefined,
      })
      return new TableRow({
        height: { value: ROW_H, rule: HeightRule.ATLEAST },
        cantSplit: false,
        children: rtl ? [textCell, numCell] : [numCell, textCell],
      })
    }),
  ]

  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: rtl ? [...COLS].reverse() : [...COLS],
    layout: TableLayoutType.FIXED,
    rows,
  })
}

function topBrandHeader(
  logos: ResolvedLogo[],
  dividerBytes: Uint8Array | null,
  scale: number,
) {
  const children: (ImageRun | TextRun)[] = []
  logos.forEach((logo, index) => {
    if (index > 0) {
      children.push(new TextRun({ text: '  ', size: 16 }))
      if (dividerBytes) {
        children.push(
          new ImageRun({
            type: 'png',
            data: dividerBytes,
            transformation: {
              width: Math.round(3 * scale),
              height: Math.round(68 * scale),
            },
            altText: {
              title: 'Divider',
              description: 'Vertical divider line',
              name: `divider-${index}`,
            },
          }),
        )
        children.push(new TextRun({ text: '  ', size: 16 }))
      }
    }
    const isWide = logo.name === 'right-logo'
    children.push(
      new ImageRun({
        type: logo.format === 'JPEG' ? 'jpg' : 'png',
        data: logo.bytes,
        transformation: {
          width: Math.round((isWide ? 170 : 120) * scale),
          height: Math.round((isWide ? 66 : 62) * scale),
        },
        altText: {
          title: logo.name,
          description: logo.name,
          name: logo.name,
        },
      }),
    )
  })

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children,
  })
}

function sloganParagraph(
  text: string,
  settings: ExportFormatSettings,
  opts?: { arabic?: boolean; before?: number },
) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    bidirectional: !!opts?.arabic,
    spacing: { before: opts?.before ?? 40, after: 40 },
    children: [
      new TextRun({
        text,
        font: opts?.arabic ? 'Segoe UI' : 'Times New Roman',
        size: opts?.arabic ? 19 : 17,
        color: settings.accentColor,
        rightToLeft: !!opts?.arabic,
      }),
    ],
  })
}

function preparedByBlock(label: BilingualLabel, name: string, rtl = false) {
  const fullName = name || ' '
  const heading = rtl ? `${label.ar} :` : `${label.en}:`
  return [
    p(heading, {
      arabic: rtl,
      align: rtl ? 'right' : 'left',
      after: 80,
    }),
    p(fullName, {
      arabic: hasArabic(fullName),
      align: rtl ? 'right' : 'left',
      after: 160,
    }),
  ]
}

function approvedByBlock(label: BilingualLabel, name: string, rtl = false) {
  const fullName = name || ' '
  const heading = rtl ? `${label.ar} :` : `${label.en}:`
  return [
    p(heading, {
      arabic: rtl,
      align: rtl ? 'right' : 'left',
      after: 80,
    }),
    p(fullName, {
      arabic: hasArabic(fullName),
      align: rtl ? 'right' : 'left',
      after: 160,
    }),
  ]
}

function belowTableSlogans(locale: Locale, settings: ExportFormatSettings) {
  return getExportSlogans(settings, locale).map((line, index) =>
    sloganParagraph(line.text, settings, {
      arabic: line.arabic,
      before: index === 0 ? 200 : undefined,
    }),
  )
}

export async function downloadWord(
  minute: ExportMinute,
  locale: Locale = 'en',
  formatOverride?: ExportFormatSettings,
) {
  const labels = exportLabels(locale)
  const rtl = locale === 'ar'
  const settings = resolveSettings(formatOverride)
  const children = []

  if (settings.showLogos) {
    const logos = await resolveHeaderLogos(settings)
    if (logos.length > 0) {
      const dividerBytes =
        settings.showDivider && logos.length > 1
          ? await loadBrandBytes('/brand/divider.png')
          : null
      children.push(
        topBrandHeader(logos, dividerBytes, logoSizeScale(settings.logoSize)),
      )
    }
  }

  children.push(buildMomTable(minute, labels, settings, rtl))
  children.push(
    ...preparedByBlock(labels.preparedBy, minute.preparedBy, rtl),
  )
  children.push(...approvedByBlock(labels.approvedBy, minute.approvedBy || '', rtl))
  if (settings.showSlogans) {
    children.push(...belowTableSlogans(locale, settings))
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            // Slightly tighter margins help keep a normal minute on one page.
            margin: { top: 480, right: 640, bottom: 560, left: 640 },
          },
        },
        children,
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${fileBase(minute, labels)}.docx`)
}

export async function downloadPdf(
  minute: ExportMinute,
  locale: Locale = 'en',
  formatOverride?: ExportFormatSettings,
  options?: { fitOnePage?: boolean },
) {
  const labels = exportLabels(locale)
  const rtl = locale === 'ar'
  const settings = resolveSettings(formatOverride)
  const fitOnePage = !!options?.fitOnePage
  const fontBytes = await loadBrandBytes('/fonts/NotoNaskhArabic-Regular.ttf')
  const headerLogos = settings.showLogos
    ? await resolveHeaderLogos(settings)
    : []

  const doc = new jsPDF()
  doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', bytesToBase64(fontBytes))
  doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal')
  // Same face for bold requests so Arabic labels never fall back to Helvetica.
  doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'bold')

  const pageW = doc.internal.pageSize.getWidth()
  const pageH = doc.internal.pageSize.getHeight()
  const margin = 14
  const tableW = pageW - margin * 2
  // Match template ratios from Minutes of Meeting.docx
  const leftW = tableW * (2389 / 9882)
  const rightW = tableW - leftW
  const nameW = tableW * (4642 / 9882)
  const desigW = tableW - nameW
  const numW = tableW * (522 / 9882)
  const decisionW = tableW - numW
  let y = 10

  const useArabicFont = (text: string) => hasArabic(text)
  const pageBottom = 12
  const lineH = Math.max(4.6, settings.fontSize * 0.48 + 0.6)
  const padY = 3
  /** Table content must stay above this Y (footer reserved on page 1). */
  let contentBottom = pageH - pageBottom
  let footerPinned = false

  const remaining = () => contentBottom - y

  const newPage = () => {
    // Once we committed to a one-page layout, never spill to page 2.
    if (footerPinned) return
    doc.addPage()
    y = 14
    contentBottom = pageH - pageBottom
  }

  const applyFont = (text: string, bold?: boolean) => {
    if (useArabicFont(text)) {
      doc.setFont('NotoNaskhArabic', 'normal')
    } else {
      doc.setFont('times', bold ? 'bold' : 'normal')
    }
    doc.setFontSize(settings.fontSize)
    doc.setTextColor(0, 0, 0)
  }

  const wrapLines = (text: string, width: number, bold?: boolean) => {
    const blocks = String(text || ' ').split('\n')
    const lines: string[] = []
    for (const block of blocks) {
      applyFont(block, bold)
      const wrapped = doc.splitTextToSize(
        block.length ? block : ' ',
        Math.max(10, width - 4),
      ) as string[]
      lines.push(...wrapped)
    }
    return lines
  }

  type CellOpts = {
    fill?: string
    bold?: boolean
    center?: boolean
    align?: 'left' | 'right' | 'center'
  }

  const paintBox = (
    x: number,
    yy: number,
    w: number,
    h: number,
    fill?: string,
  ) => {
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    if (fill) {
      doc.setFillColor(
        parseInt(fill.slice(0, 2), 16),
        parseInt(fill.slice(2, 4), 16),
        parseInt(fill.slice(4, 6), 16),
      )
      doc.rect(x, yy, w, h, 'FD')
    } else {
      doc.rect(x, yy, w, h)
    }
  }

  const writeLines = (
    x: number,
    yy: number,
    w: number,
    lines: string[],
    _source: string,
    opts?: CellOpts,
  ) => {
    if (lines.length === 0) return
    lines.forEach((line, index) => {
      applyFont(line, opts?.bold)
      const textY = yy + Math.min(lineH, 4.5) + index * lineH
      const align =
        opts?.center || opts?.align === 'center'
          ? 'center'
          : opts?.align
            ? opts.align
            : hasArabic(line)
              ? 'right'
              : 'left'
      if (align === 'center') {
        doc.text(line, x + w / 2, textY, { align: 'center' })
      } else if (align === 'right') {
        doc.text(line, x + w - 2, textY, { align: 'right' })
      } else {
        doc.text(line, x + 2, textY)
      }
    })
  }

  const drawRow = (
    cells: { x: number; w: number; text: string; opts?: CellOpts }[],
    minH = 9,
    maxH?: number,
  ) => {
    const wrapped = cells.map((cell) => ({
      ...cell,
      lines: wrapLines(cell.text, cell.w, cell.opts?.bold),
    }))
    const fullContentH = Math.max(
      minH,
      ...wrapped.map((cell) =>
        cell.lines.length === 0 ? minH : cell.lines.length * lineH + padY,
      ),
    )
    // Keep short/medium rows intact instead of splitting into tiny fragments.
    const pageUsable = pageH - pageBottom - 14
    if (
      !footerPinned &&
      maxH == null &&
      fullContentH <= pageUsable &&
      remaining() < fullContentH
    ) {
      newPage()
    }

    let firstChunk = true
    while (wrapped.some((cell) => cell.lines.length > 0)) {
      let avail = Math.max(0.5, remaining())
      if (maxH != null && firstChunk) {
        avail = Math.min(avail, Math.max(minH, maxH))
      }
      const neededMin = firstChunk ? Math.min(minH, avail || minH) : 9
      if (!footerPinned && avail < Math.min(neededMin, 9)) {
        newPage()
        avail = remaining()
        if (maxH != null && firstChunk) {
          avail = Math.min(avail, Math.max(minH, maxH))
        }
      }
      // On a pinned one-page layout, flush remaining lines into the space left.
      const maxLines = Math.max(
        1,
        Math.floor((Math.max(avail, 9) - padY) / lineH),
      )
      const takeAll = footerPinned && maxH == null
      const chunks = wrapped.map((cell) => {
        const chunk = takeAll
          ? cell.lines.slice()
          : cell.lines.slice(0, maxLines)
        cell.lines = takeAll ? [] : cell.lines.slice(maxLines)
        return { ...cell, chunk }
      })
      const chunkContentH = Math.max(
        9,
        ...chunks.map((cell) =>
          cell.chunk.length === 0 ? 0 : cell.chunk.length * lineH + padY,
        ),
      )
      let contentH =
        maxH != null && firstChunk
          ? Math.max(minH, chunkContentH)
          : Math.max(firstChunk ? minH : 9, chunkContentH)
      if (maxH != null && firstChunk) {
        contentH = Math.min(Math.max(contentH, minH), Math.max(minH, maxH))
      }
      if (maxH == null) {
        contentH = Math.max(9, chunkContentH || 9)
        if (firstChunk) contentH = Math.max(minH, contentH)
      }
      const drawH = footerPinned
        ? Math.min(avail, Math.max(contentH, 9))
        : Math.min(avail, contentH)
      chunks.forEach((cell) => {
        paintBox(cell.x, y, cell.w, drawH, cell.opts?.fill)
        writeLines(cell.x, y, cell.w, cell.chunk, cell.text, cell.opts)
      })
      y += drawH
      firstChunk = false
      if (footerPinned && remaining() <= 0.5) break
    }
  }

  const rowHeightFor = (text: string, width: number, minH = 9) =>
    Math.max(minH, wrapLines(text || ' ', width).length * lineH + padY)

  /** Avoid orphan section titles at the bottom of a page. */
  const ensureSectionRoom = (followH: number) => {
    if (footerPinned) return
    const headerH = 14
    if (remaining() < headerH + followH) newPage()
  }

  if (headerLogos.length > 0) {
    const scale = logoSizeScale(settings.logoSize)
    const gap = 3
    const sizes = headerLogos.map((logo) => {
      const wide = logo.name === 'right-logo'
      return {
        logo,
        w: (wide ? 58 : 42) * scale,
        h: (wide ? 23 : 22) * scale,
      }
    })
    const lineGaps = settings.showDivider ? sizes.length - 1 : 0
    const groupW =
      sizes.reduce((sum, item) => sum + item.w, 0) +
      gap * Math.max(0, sizes.length - 1) +
      lineGaps * 2
    let x = (pageW - groupW) / 2
    const logoY = y
    const logoLineH = Math.max(...sizes.map((item) => item.h))

    sizes.forEach((item, index) => {
      if (index > 0 && settings.showDivider) {
        const lineX = x
        doc.setDrawColor(0, 0, 0)
        doc.setLineWidth(0.35)
        doc.line(lineX, logoY, lineX, logoY + logoLineH)
        x += gap
      } else if (index > 0) {
        x += gap
      }
      doc.addImage(
        item.logo.dataUrl,
        item.logo.format,
        x,
        logoY + (logoLineH - item.h) / 2,
        item.w,
        item.h,
      )
      x += item.w
    })
    y += logoLineH + 5
  }

  const headerRow = (label: BilingualLabel) => {
    drawRow(
      [
        {
          x: margin,
          w: tableW,
          text: bilingualLine(label, locale),
          opts: {
            fill: settings.headerColor,
            bold: true,
            center: true,
          },
        },
      ],
      11,
    )
  }

  const labelValue = (label: BilingualLabel, value: string) => {
    const labelCell = {
      x: rtl ? margin + rightW : margin,
      w: leftW,
      text: bilingualLine(label, locale),
      opts: { bold: true, align: rtl ? 'right' : 'left' } as CellOpts,
    }
    const valueCell = {
      x: rtl ? margin : margin + leftW,
      w: rightW,
      text: value,
      opts: { align: rtl ? 'right' : 'left' } as CellOpts,
    }
    drawRow([labelCell, valueCell], 11)
  }

  const attendanceColumnHeaders = () => {
    drawRow(
      [
        {
          x: rtl ? margin + desigW : margin,
          w: nameW,
          text: bilingualLine(labels.name, locale),
          opts: { bold: true, center: true },
        },
        {
          x: rtl ? margin : margin + nameW,
          w: desigW,
          text: bilingualLine(labels.designation, locale),
          opts: { bold: true, center: true },
        },
      ],
      11,
    )
  }

  headerRow(labels.meeting)
  labelValue(labels.meetingTitle, minute.title)
  labelValue(labels.meetingLocation, minute.location)
  labelValue(labels.meetingDate, minute.date)

  headerRow(labels.attendance)
  attendanceColumnHeaders()

  const attendees =
    minute.attendees?.length > 0
      ? minute.attendees
      : [{ name: '', designation: '' }]
  attendees.forEach((a) => {
    const rowH = Math.max(
      rowHeightFor(a.name || ' ', nameW, 9),
      rowHeightFor(a.designation || ' ', desigW, 9),
    )
    // Keep each attendee on one page and repeat column titles after a break.
    if (remaining() < rowH) {
      newPage()
      attendanceColumnHeaders()
    }
    drawRow([
      {
        x: rtl ? margin + desigW : margin,
        w: nameW,
        text: a.name,
        opts: { align: rtl ? 'right' : 'left' },
      },
      {
        x: rtl ? margin : margin + nameW,
        w: desigW,
        text: a.designation,
        opts: { align: rtl ? 'right' : 'left' },
      },
    ])
  })

  const decisions =
    minute.decisions?.length > 0
      ? minute.decisions
      : [{ text: '' }, { text: '' }]

  const discussionText = splitParagraphs(minute.discussion).join('\n\n')
  const discussionContentH = rowHeightFor(discussionText, tableW, 22)

  const decisionsBlockH =
    rowHeightFor(bilingualLine(labels.decisions, locale), tableW, 11) +
    decisions.reduce((sum, d, index) => {
      const numH = rowHeightFor(String(index + 1), numW, 9)
      const textH = rowHeightFor(d.text || ' ', decisionW, 9)
      return sum + Math.max(numH, textH)
    }, 0) +
    4

  const preparedName = minute.preparedBy || ' '
  const preparedNameLines = wrapLines(preparedName, tableW)
  const approvedName = minute.approvedBy || ' '
  const approvedNameLines = wrapLines(approvedName, tableW)
  const preparedReserve =
    4 +
    5 +
    6 +
    preparedNameLines.length * 5 +
    2 +
    5 +
    6 +
    approvedNameLines.length * 5 +
    2
  const approvedLabel = rtl
    ? `${labels.approvedBy.ar} :`
    : `${labels.approvedBy.en}:`

  const sloganLines = settings.showSlogans
    ? getExportSlogans(settings, locale)
    : []
  const sloganReserve = sloganLines.reduce((sum, line) => {
    applyFont(line.text)
    doc.setFontSize(line.arabic ? settings.fontSize + 1 : settings.fontSize)
    const wrapped = doc.splitTextToSize(line.text, tableW) as string[]
    return sum + Math.max(4.5, wrapped.length * 5)
  }, 0)

  const footerH = preparedReserve + sloganReserve + 4

  // Pin footer on page 1 for compact minutes (and always for format preview).
  const spaceNow = remaining()
  if (
    fitOnePage ||
    discussionContentH + decisionsBlockH + footerH <= spaceNow
  ) {
    contentBottom = pageH - pageBottom - footerH
    footerPinned = true
  }

  // Keep discussion title with the start of discussion text.
  ensureSectionRoom(footerPinned ? Math.min(40, discussionContentH) : 36)
  headerRow(labels.discussion)

  const fillTarget = Math.max(
    discussionContentH,
    Math.max(22, remaining() - decisionsBlockH),
  )
  drawRow(
    [
      {
        x: margin,
        w: tableW,
        text: discussionText,
        opts: { align: rtl ? 'right' : 'left' },
      },
    ],
    // Critical: do NOT pass full discussion height as minH for large text —
    // that forced a blank page under an orphan section header.
    footerPinned ? fillTarget : 22,
    footerPinned ? fillTarget : undefined,
  )

  ensureSectionRoom(28)
  headerRow(labels.decisions)
  decisions.forEach((d, i) => {
    const rowH = Math.max(
      rowHeightFor(String(i + 1), numW, 9),
      rowHeightFor(d.text || ' ', decisionW, 9),
    )
    // Keep each decision together when it fits on one page.
    if (remaining() < Math.min(rowH, pageH - pageBottom - 20)) {
      newPage()
    }
    drawRow([
      {
        x: rtl ? margin + decisionW : margin,
        w: numW,
        text: String(i + 1),
        opts: { bold: true, center: true },
      },
      {
        x: rtl ? margin : margin + numW,
        w: decisionW,
        text: d.text,
        opts: { align: rtl ? 'right' : 'left' },
      },
    ])
  })

  contentBottom = pageH - pageBottom
  if (footerPinned && doc.getNumberOfPages() === 1) {
    y = Math.max(y + 1, pageH - pageBottom - footerH)
  } else {
    // Keep prepared-by with the end of decisions when possible.
    if (remaining() < footerH) newPage()
    y += 4
  }

  const preparedX = rtl ? pageW - margin : margin
  const preparedAlign = rtl ? 'right' : 'left'
  doc.setTextColor(0, 0, 0)
  // Noto is registered as normal only — bold style breaks Arabic glyphs.
  if (rtl) {
    doc.setFont('NotoNaskhArabic', 'normal')
  } else {
    doc.setFont('times', 'bold')
  }
  doc.setFontSize(10)
  doc.text(
    rtl ? `${labels.preparedBy.ar} :` : `${labels.preparedBy.en}:`,
    preparedX,
    y,
    { align: preparedAlign },
  )
  y += 6
  applyFont(preparedName)
  doc.setFontSize(10)
  preparedNameLines.forEach((line) => {
    doc.text(line, preparedX, y, { align: preparedAlign })
    y += 5
  })
  y += 2

  if (rtl) {
    doc.setFont('NotoNaskhArabic', 'normal')
  } else {
    doc.setFont('times', 'bold')
  }
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.text(approvedLabel, preparedX, y, { align: preparedAlign })
  y += 6
  applyFont(approvedName)
  doc.setFontSize(10)
  approvedNameLines.forEach((line) => {
    doc.text(line, preparedX, y, { align: preparedAlign })
    y += 5
  })
  y += 2

  if (settings.showSlogans) {
    const [sr, sg, sb] = hexToRgb(settings.accentColor)
    doc.setTextColor(sr, sg, sb)

    sloganLines.forEach((line) => {
      if (line.arabic) {
        doc.setFont('NotoNaskhArabic', 'normal')
        doc.setFontSize(settings.fontSize + 1)
      } else {
        doc.setFont('times', 'normal')
        doc.setFontSize(settings.fontSize)
      }
      doc.text(line.text, pageW / 2, y, { align: 'center' })
      y += 5
    })
  }

  if (fitOnePage || footerPinned) {
    while (doc.getNumberOfPages() > 1) {
      doc.deletePage(doc.getNumberOfPages())
    }
  }

  doc.save(`${fileBase(minute, labels)}.pdf`)
}
