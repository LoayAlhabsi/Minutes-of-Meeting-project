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

export type ExportAttendee = { name: string; designation: string }
export type ExportDecision = { text: string }

export type ExportMinute = {
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  attendees: ExportAttendee[]
  decisions: ExportDecision[]
}

const HEADER_BLUE = 'BDD6EE'
const SLOGAN_BLUE = '2E74B5'
const ARABIC_TRANSFORM = 'التحول الرقمي الصحي من أجل خدمات ذكية متكاملة'
const ARABIC_SLOGAN = 'رقمنة الصحة والإبتكار لعناية راقية وصحة مستدامة'
const ENGLISH_SLOGAN =
  'Digitalized Health and Innovation Quality Care and sustainable'
const ENGLISH_TRANSFORM =
  'Digital Health Transformation for Integrated Smart Services'

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
const DISCUSSION_H = 1800

async function loadBrandBytes(path: string): Promise<Uint8Array> {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}`)
  return new Uint8Array(await res.arrayBuffer())
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

function fileBase(minute: ExportMinute) {
  const safe = (minute.title || 'minutes').replace(/[\\/:*?"<>|]+/g, '-').trim()
  return `${safe || 'minutes'}-${minute.date || 'meeting'}`
}

function p(text: string, opts?: { bold?: boolean; center?: boolean; size?: number }) {
  return new Paragraph({
    alignment: opts?.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { after: 0 },
    children: [
      new TextRun({
        text: text || ' ',
        bold: opts?.bold,
        size: opts?.size ?? 22,
        font: 'Times New Roman',
      }),
    ],
  })
}

function cell(
  text: string,
  width: number,
  span: number,
  opts?: {
    bold?: boolean
    center?: boolean
    fill?: string
  },
) {
  return new TableCell({
    borders: BORDER,
    width: { size: width, type: WidthType.DXA },
    columnSpan: span,
    shading: opts?.fill
      ? { type: ShadingType.CLEAR, fill: opts.fill }
      : undefined,
    verticalAlign: VerticalAlign.CENTER,
    children: [p(text, { bold: opts?.bold, center: opts?.center })],
  })
}

function sectionHeaderRow(text: string) {
  return new TableRow({
    height: { value: ROW_H, rule: HeightRule.ATLEAST },
    children: [
      cell(text, TABLE_W, 5, {
        bold: true,
        center: true,
        fill: HEADER_BLUE,
      }),
    ],
  })
}

function labelValueRow(label: string, value: string) {
  return new TableRow({
    height: { value: ROW_H, rule: HeightRule.ATLEAST },
    children: [
      cell(label, W_LABEL, 2, { bold: true }),
      cell(value || ' ', W_VALUE, 3),
    ],
  })
}

function buildMomTable(minute: ExportMinute) {
  const attendees =
    minute.attendees?.length > 0
      ? minute.attendees
      : [{ name: '', designation: '' }]
  const decisions =
    minute.decisions?.length > 0
      ? minute.decisions
      : [{ text: '' }, { text: '' }]

  const rows: TableRow[] = [
    sectionHeaderRow('Meeting'),
    labelValueRow('Meeting Title', minute.title),
    labelValueRow('Meeting Location', minute.location),
    labelValueRow('Meeting Date', minute.date),
    sectionHeaderRow('Attendance'),
    new TableRow({
      height: { value: ROW_H, rule: HeightRule.ATLEAST },
      children: [
        cell('Name', W_NAME, 4, { bold: true, center: true }),
        cell('Designation', W_DESIG, 1, { bold: true, center: true }),
      ],
    }),
    ...attendees.map(
      (a) =>
        new TableRow({
          height: { value: ROW_H, rule: HeightRule.ATLEAST },
          children: [
            cell(a.name || ' ', W_NAME, 4),
            cell(a.designation || ' ', W_DESIG, 1),
          ],
        }),
    ),
    sectionHeaderRow('Discussion and Summary'),
    new TableRow({
      height: { value: DISCUSSION_H, rule: HeightRule.ATLEAST },
      children: [
        new TableCell({
          borders: BORDER,
          width: { size: TABLE_W, type: WidthType.DXA },
          columnSpan: 5,
          children: [p(minute.discussion || ' '), p(' '), p(' '), p(' ')],
        }),
      ],
    }),
    sectionHeaderRow('Recommendations and Decisions'),
    ...decisions.map(
      (d, i) =>
        new TableRow({
          height: { value: ROW_H, rule: HeightRule.ATLEAST },
          children: [
            cell(String(i + 1), W_NUM, 1, { bold: true, center: true }),
            cell(d.text || ' ', W_DECISION, 4),
          ],
        }),
    ),
  ]

  return new Table({
    width: { size: TABLE_W, type: WidthType.DXA },
    columnWidths: [...COLS],
    layout: TableLayoutType.FIXED,
    rows,
  })
}

/** Centered header matching PDF: Tahawul | line | MOH (transparent PNGs) */
function topBrandHeader(
  mohBytes: Uint8Array,
  tahawulBytes: Uint8Array,
  dividerBytes: Uint8Array,
) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [
      new ImageRun({
        type: 'png',
        data: tahawulBytes,
        transformation: { width: 120, height: 62 },
        altText: {
          title: 'Tahawul',
          description: 'Tahawul logo',
          name: 'tahawul',
        },
      }),
      new TextRun({ text: '  ', size: 16 }),
      new ImageRun({
        type: 'png',
        data: dividerBytes,
        transformation: { width: 3, height: 68 },
        altText: {
          title: 'Divider',
          description: 'Vertical divider line',
          name: 'divider',
        },
      }),
      new TextRun({ text: '  ', size: 16 }),
      new ImageRun({
        type: 'png',
        data: mohBytes,
        transformation: { width: 170, height: 66 },
        altText: {
          title: 'Ministry of Health',
          description: 'MOH logo',
          name: 'moh-logo',
        },
      }),
    ],
  })
}

function sloganParagraph(
  text: string,
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
        color: SLOGAN_BLUE,
        rightToLeft: !!opts?.arabic,
      }),
    ],
  })
}

function preparedByParagraph(name: string) {
  return new Paragraph({
    spacing: { before: 200, after: 120 },
    children: [
      new TextRun({
        text: 'Prepared by: ',
        bold: true,
        font: 'Times New Roman',
        size: 22,
      }),
      new TextRun({
        text: name || ' ',
        font: 'Times New Roman',
        size: 22,
      }),
    ],
  })
}

function belowTableSlogans() {
  return [
    sloganParagraph(ARABIC_SLOGAN, { arabic: true, before: 200 }),
    sloganParagraph(ENGLISH_SLOGAN),
    sloganParagraph(ARABIC_TRANSFORM, { arabic: true }),
    sloganParagraph(ENGLISH_TRANSFORM),
  ]
}

export async function downloadWord(minute: ExportMinute) {
  const [mohBytes, tahawulBytes, dividerBytes] = await Promise.all([
    loadBrandBytes('/brand/moh-logo.png'),
    loadBrandBytes('/brand/tahawul.png'),
    loadBrandBytes('/brand/divider.png'),
  ])

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 560, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [
          topBrandHeader(mohBytes, tahawulBytes, dividerBytes),
          buildMomTable(minute),
          preparedByParagraph(minute.preparedBy),
          ...belowTableSlogans(),
        ],
      },
    ],
  })

  const blob = await Packer.toBlob(doc)
  saveAs(blob, `${fileBase(minute)}.docx`)
}

export async function downloadPdf(minute: ExportMinute) {
  const [mohBytes, tahawulBytes, fontBytes] = await Promise.all([
    loadBrandBytes('/brand/moh-logo.png'),
    loadBrandBytes('/brand/tahawul.png'),
    loadBrandBytes('/fonts/NotoNaskhArabic-Regular.ttf'),
  ])
  const mohUrl = bytesToDataUrl(mohBytes)
  const tahawulUrl = bytesToDataUrl(tahawulBytes)

  const doc = new jsPDF()
  doc.addFileToVFS('NotoNaskhArabic-Regular.ttf', bytesToBase64(fontBytes))
  doc.addFont('NotoNaskhArabic-Regular.ttf', 'NotoNaskhArabic', 'normal')

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

  const ensureSpace = (h: number) => {
    if (y + h > pageH - 16) {
      doc.addPage()
      y = 16
    }
  }

  const drawCell = (
    x: number,
    yy: number,
    w: number,
    h: number,
    text: string,
    opts?: { fill?: string; bold?: boolean; center?: boolean },
  ) => {
    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.2)
    if (opts?.fill) {
      const [r, g, b] = [
        parseInt(opts.fill.slice(0, 2), 16),
        parseInt(opts.fill.slice(2, 4), 16),
        parseInt(opts.fill.slice(4, 6), 16),
      ]
      doc.setFillColor(r, g, b)
      doc.rect(x, yy, w, h, 'FD')
    } else {
      doc.rect(x, yy, w, h)
    }
    doc.setFont('times', opts?.bold ? 'bold' : 'normal')
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    const lines = doc.splitTextToSize(text || ' ', w - 4)
    const textY = yy + 5
    if (opts?.center) {
      doc.text(lines, x + w / 2, textY, { align: 'center' })
    } else {
      doc.text(lines, x + 2, textY)
    }
  }

  const rowHeight = (text: string, width: number, minH = 10) => {
    doc.setFontSize(10)
    const lines = doc.splitTextToSize(text || ' ', width - 4)
    return Math.max(minH, lines.length * 5 + 4)
  }

  // Centered header: Tahawul | line | MOH (touching the line)
  const tahW = 42
  const tahH = 22
  const mohW = 58
  const mohH = 23
  const gap = 2
  const lineGap = 2
  const groupW = tahW + gap + lineGap + mohW
  const groupX = (pageW - groupW) / 2
  const logoY = y
  const lineH = Math.max(tahH, mohH)

  doc.addImage(tahawulUrl, 'PNG', groupX, logoY + (lineH - tahH) / 2, tahW, tahH)
  const lineX = groupX + tahW + gap
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.35)
  // Draw logos first, then the divider on top so the line stays visible
  doc.addImage(mohUrl, 'PNG', lineX + lineGap, logoY + (lineH - mohH) / 2, mohW, mohH)
  doc.line(lineX, logoY, lineX, logoY + lineH)
  y += lineH + 8

  const headerRow = (title: string) => {
    const h = 10
    ensureSpace(h)
    drawCell(margin, y, tableW, h, title, {
      fill: HEADER_BLUE,
      bold: true,
      center: true,
    })
    y += h
  }

  const labelValue = (label: string, value: string) => {
    const h = Math.max(
      rowHeight(label, leftW),
      rowHeight(value, rightW),
      10,
    )
    ensureSpace(h)
    drawCell(margin, y, leftW, h, label, { bold: true })
    drawCell(margin + leftW, y, rightW, h, value)
    y += h
  }

  headerRow('Meeting')
  labelValue('Meeting Title', minute.title)
  labelValue('Meeting Location', minute.location)
  labelValue('Meeting Date', minute.date)

  headerRow('Attendance')
  {
    const h = 10
    ensureSpace(h)
    drawCell(margin, y, nameW, h, 'Name', { bold: true, center: true })
    drawCell(margin + nameW, y, desigW, h, 'Designation', {
      bold: true,
      center: true,
    })
    y += h
  }

  const attendees =
    minute.attendees?.length > 0
      ? minute.attendees
      : [{ name: '', designation: '' }]
  attendees.forEach((a) => {
    const h = Math.max(rowHeight(a.name, nameW), rowHeight(a.designation, desigW), 10)
    ensureSpace(h)
    drawCell(margin, y, nameW, h, a.name)
    drawCell(margin + nameW, y, desigW, h, a.designation)
    y += h
  })

  headerRow('Discussion and Summary')
  {
    const h = Math.max(rowHeight(minute.discussion, tableW, 40), 40)
    ensureSpace(h)
    drawCell(margin, y, tableW, h, minute.discussion)
    y += h
  }

  headerRow('Recommendations and Decisions')
  const decisions =
    minute.decisions?.length > 0
      ? minute.decisions
      : [{ text: '' }, { text: '' }]
  decisions.forEach((d, i) => {
    const h = Math.max(rowHeight(d.text, decisionW), 10)
    ensureSpace(h)
    drawCell(margin, y, numW, h, String(i + 1), {
      bold: true,
      center: true,
    })
    drawCell(margin + numW, y, decisionW, h, d.text)
    y += h
  })

  // Outside table, like the official template
  ensureSpace(40)
  y += 8
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Prepared by: ${minute.preparedBy || ''}`, margin, y)
  y += 8

  const [sr, sg, sb] = [46, 116, 181]
  doc.setTextColor(sr, sg, sb)
  doc.setFont('NotoNaskhArabic', 'normal')
  doc.setFontSize(11)
  doc.text(ARABIC_SLOGAN, pageW / 2, y, { align: 'center' })
  y += 6
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.text(ENGLISH_SLOGAN, pageW / 2, y, { align: 'center' })
  y += 5
  doc.setFont('NotoNaskhArabic', 'normal')
  doc.setFontSize(11)
  doc.text(ARABIC_TRANSFORM, pageW / 2, y, { align: 'center' })
  y += 6
  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.text(ENGLISH_TRANSFORM, pageW / 2, y, { align: 'center' })

  doc.save(`${fileBase(minute)}.pdf`)
}
