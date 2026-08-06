import { jsPDF } from 'jspdf'
import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
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

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
}

const BORDER = {
  top: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  bottom: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  left: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
  right: { style: BorderStyle.SINGLE, size: 8, color: '000000' },
}

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

function headerCell(text: string, span = 2) {
  return new TableCell({
    columnSpan: span,
    borders: BORDER,
    shading: { type: ShadingType.CLEAR, fill: HEADER_BLUE },
    verticalAlign: VerticalAlign.CENTER,
    children: [p(text, { bold: true, center: true })],
  })
}

function labelValueRow(label: string, value: string) {
  return new TableRow({
    children: [
      new TableCell({
        borders: BORDER,
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [p(label, { bold: true })],
      }),
      new TableCell({
        borders: BORDER,
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [p(value || ' ')],
      }),
    ],
  })
}

function fullWidthRow(text: string, opts?: { header?: boolean; minLines?: number }) {
  const lines = Math.max(opts?.minLines ?? 1, 1)
  const children = [p(text, { bold: opts?.header, center: !!opts?.header })]
  for (let i = 1; i < lines; i++) children.push(p(' '))
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 2,
        borders: BORDER,
        shading: opts?.header
          ? { type: ShadingType.CLEAR, fill: HEADER_BLUE }
          : undefined,
        children,
      }),
    ],
  })
}

function buildTableRows(minute: ExportMinute): TableRow[] {
  const attendees =
    minute.attendees?.length > 0
      ? minute.attendees
      : [{ name: '', designation: '' }]
  const decisions =
    minute.decisions?.length > 0 ? minute.decisions : [{ text: '' }]

  return [
    new TableRow({ children: [headerCell('Meeting')] }),
    labelValueRow('Meeting Title', minute.title),
    labelValueRow('Meeting Location', minute.location),
    labelValueRow('Meeting Date', minute.date),
    new TableRow({ children: [headerCell('Attendance')] }),
    new TableRow({
      children: [
        new TableCell({
          borders: BORDER,
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [p('Name', { bold: true, center: true })],
        }),
        new TableCell({
          borders: BORDER,
          width: { size: 50, type: WidthType.PERCENTAGE },
          children: [p('Designation', { bold: true, center: true })],
        }),
      ],
    }),
    ...attendees.map(
      (a) =>
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [p(a.name || ' ')],
            }),
            new TableCell({
              borders: BORDER,
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [p(a.designation || ' ')],
            }),
          ],
        }),
    ),
    fullWidthRow('Discussion and Summary', { header: true }),
    fullWidthRow(minute.discussion || ' ', { minLines: 4 }),
    fullWidthRow('Recommendations and Decisions', { header: true }),
    ...decisions.map(
      (d, i) =>
        new TableRow({
          children: [
            new TableCell({
              borders: BORDER,
              width: { size: 10, type: WidthType.PERCENTAGE },
              verticalAlign: VerticalAlign.CENTER,
              children: [p(String(i + 1), { bold: true, center: true })],
            }),
            new TableCell({
              borders: BORDER,
              width: { size: 90, type: WidthType.PERCENTAGE },
              children: [p(d.text || ' ')],
            }),
          ],
        }),
    ),
    labelValueRow('Prepared by', minute.preparedBy),
  ]
}

/** Centered: Tahawul | vertical line | MOH (close together) */
function topBrandTable(mohBytes: Uint8Array, tahawulBytes: Uint8Array) {
  const lineBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.SINGLE, size: 12, color: '000000' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  }

  return new Table({
    alignment: AlignmentType.CENTER,
    width: { size: 4200, type: WidthType.DXA },
    columnWidths: [1700, 200, 2300],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: NO_BORDER,
            width: { size: 1700, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new ImageRun({
                    type: 'png',
                    data: tahawulBytes,
                    transformation: { width: 100, height: 44 },
                    altText: {
                      title: 'Tahawul',
                      description: 'Tahawul logo',
                      name: 'tahawul',
                    },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: lineBorders,
            width: { size: 200, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: ' ', size: 40 })],
              }),
            ],
          }),
          new TableCell({
            borders: NO_BORDER,
            width: { size: 2300, type: WidthType.DXA },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new ImageRun({
                    type: 'png',
                    data: mohBytes,
                    transformation: { width: 140, height: 54 },
                    altText: {
                      title: 'Ministry of Health',
                      description: 'MOH logo',
                      name: 'moh-logo',
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
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

function belowTableSlogans() {
  return [
    sloganParagraph(ARABIC_TRANSFORM, { arabic: true, before: 280 }),
    sloganParagraph(ARABIC_SLOGAN, { arabic: true }),
    sloganParagraph(ENGLISH_SLOGAN),
    sloganParagraph(ENGLISH_TRANSFORM),
  ]
}

export async function downloadWord(minute: ExportMinute) {
  const [mohBytes, tahawulBytes] = await Promise.all([
    loadBrandBytes('/brand/moh-logo.png'),
    loadBrandBytes('/brand/tahawul.png'),
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
          topBrandTable(mohBytes, tahawulBytes),
          new Paragraph({ spacing: { after: 200 }, children: [] }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: buildTableRows(minute),
          }),
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
  const leftW = tableW * 0.3
  const rightW = tableW * 0.7
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

  // Centered header: Tahawul | line | MOH (close together)
  const tahW = 32
  const tahH = 14
  const mohW = 42
  const mohH = 16
  const gap = 4
  const lineGap = 5
  const groupW = tahW + gap + lineGap + mohW
  const groupX = (pageW - groupW) / 2
  const logoY = y

  doc.addImage(tahawulUrl, 'PNG', groupX, logoY + 1, tahW, tahH)
  const lineX = groupX + tahW + gap
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.line(lineX, logoY, lineX, logoY + Math.max(tahH, mohH))
  doc.addImage(mohUrl, 'PNG', lineX + lineGap, logoY, mohW, mohH)
  y += Math.max(mohH, tahH) + 8

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
    drawCell(margin, y, tableW / 2, h, 'Name', {
      bold: true,
      center: true,
    })
    drawCell(margin + tableW / 2, y, tableW / 2, h, 'Designation', {
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
    const h = Math.max(
      rowHeight(a.name, tableW / 2),
      rowHeight(a.designation, tableW / 2),
      10,
    )
    ensureSpace(h)
    drawCell(margin, y, tableW / 2, h, a.name)
    drawCell(margin + tableW / 2, y, tableW / 2, h, a.designation)
    y += h
  })

  headerRow('Discussion and Summary')
  {
    const h = Math.max(rowHeight(minute.discussion, tableW, 28), 28)
    ensureSpace(h)
    drawCell(margin, y, tableW, h, minute.discussion)
    y += h
  }

  headerRow('Recommendations and Decisions')
  const decisions =
    minute.decisions?.length > 0 ? minute.decisions : [{ text: '' }]
  decisions.forEach((d, i) => {
    const numW = tableW * 0.1
    const textW = tableW * 0.9
    const h = Math.max(rowHeight(d.text, textW), 10)
    ensureSpace(h)
    drawCell(margin, y, numW, h, String(i + 1), {
      bold: true,
      center: true,
    })
    drawCell(margin + numW, y, textW, h, d.text)
    y += h
  })

  labelValue('Prepared by', minute.preparedBy)

  // Real text slogans (not images)
  ensureSpace(36)
  y += 8
  const [sr, sg, sb] = [46, 116, 181]
  doc.setTextColor(sr, sg, sb)

  doc.setFont('NotoNaskhArabic', 'normal')
  doc.setFontSize(11)
  doc.text(ARABIC_TRANSFORM, pageW / 2, y, { align: 'center' })
  y += 6
  doc.text(ARABIC_SLOGAN, pageW / 2, y, { align: 'center' })
  y += 6

  doc.setFont('times', 'normal')
  doc.setFontSize(10)
  doc.text(ENGLISH_SLOGAN, pageW / 2, y, { align: 'center' })
  y += 5
  doc.text(ENGLISH_TRANSFORM, pageW / 2, y, { align: 'center' })

  doc.save(`${fileBase(minute)}.pdf`)
}
