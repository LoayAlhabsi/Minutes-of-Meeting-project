export type LogoSize = 'small' | 'medium' | 'large'

export type LogoSlot = {
  enabled: boolean
  /** Custom uploaded image as data URL; empty means use defaultPath */
  customDataUrl: string
  /** Built-in asset path used when customDataUrl is empty */
  defaultPath: string
}

export type SloganPair = {
  ar: string
  en: string
}

export type ExportFormatSettings = {
  headerColor: string
  accentColor: string
  fontSize: number
  showLogos: boolean
  showSlogans: boolean
  showDivider: boolean
  logoSize: LogoSize
  leftLogo: LogoSlot
  rightLogo: LogoSlot
  extraLogo: LogoSlot
  slogans: SloganPair[]
}

const STORAGE_KEY = 'mom-export-format'
const MAX_LOGO_BYTES = 700_000

export const DEFAULT_SLOGANS: SloganPair[] = [
  {
    ar: 'رقمنة الصحة والإبتكار لعناية راقية وصحة مستدامة',
    en: 'Digitalized Health and Innovation Quality Care and sustainable',
  },
  {
    ar: 'التحول الرقمي الصحي من أجل خدمات ذكية متكاملة',
    en: 'Digital Health Transformation for Integrated Smart Services',
  },
]

export const DEFAULT_EXPORT_FORMAT: ExportFormatSettings = {
  headerColor: 'BDD6EE',
  accentColor: '2E74B5',
  fontSize: 10,
  showLogos: true,
  showSlogans: true,
  showDivider: true,
  logoSize: 'medium',
  leftLogo: {
    enabled: true,
    customDataUrl: '',
    defaultPath: '/brand/tahawul.png',
  },
  rightLogo: {
    enabled: true,
    customDataUrl: '',
    defaultPath: '/brand/moh-logo.png',
  },
  extraLogo: {
    enabled: false,
    customDataUrl: '',
    defaultPath: '',
  },
  slogans: structuredClone(DEFAULT_SLOGANS),
}

function normalizeHex(value: string, fallback: string) {
  const cleaned = value.replace('#', '').trim().toUpperCase()
  return /^[0-9A-F]{6}$/.test(cleaned) ? cleaned : fallback
}

function normalizeSlot(
  slot: Partial<LogoSlot> | undefined,
  fallback: LogoSlot,
): LogoSlot {
  return {
    enabled: slot?.enabled ?? fallback.enabled,
    customDataUrl:
      typeof slot?.customDataUrl === 'string' ? slot.customDataUrl : '',
    defaultPath:
      typeof slot?.defaultPath === 'string' && slot.defaultPath
        ? slot.defaultPath
        : fallback.defaultPath,
  }
}

function normalizeLogoSize(value: unknown): LogoSize {
  if (value === 'small' || value === 'medium' || value === 'large') return value
  return DEFAULT_EXPORT_FORMAT.logoSize
}

function normalizeText(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value
}

function normalizeSlogans(
  parsed: Partial<ExportFormatSettings> & {
    sloganAr1?: string
    sloganEn1?: string
    sloganAr2?: string
    sloganEn2?: string
  },
): SloganPair[] {
  if (Array.isArray(parsed.slogans) && parsed.slogans.length > 0) {
    return parsed.slogans.map((pair) => ({
      ar: normalizeText(pair?.ar),
      en: normalizeText(pair?.en),
    }))
  }
  // migrate older saved format
  if (parsed.sloganAr1 || parsed.sloganEn1 || parsed.sloganAr2 || parsed.sloganEn2) {
    return [
      {
        ar: normalizeText(parsed.sloganAr1, DEFAULT_SLOGANS[0].ar),
        en: normalizeText(parsed.sloganEn1, DEFAULT_SLOGANS[0].en),
      },
      {
        ar: normalizeText(parsed.sloganAr2, DEFAULT_SLOGANS[1].ar),
        en: normalizeText(parsed.sloganEn2, DEFAULT_SLOGANS[1].en),
      },
    ]
  }
  return structuredClone(DEFAULT_SLOGANS)
}

export function getExportFormatSettings(): ExportFormatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULT_EXPORT_FORMAT)
    const parsed = JSON.parse(raw) as Partial<ExportFormatSettings>
    return {
      headerColor: normalizeHex(
        String(parsed.headerColor ?? DEFAULT_EXPORT_FORMAT.headerColor),
        DEFAULT_EXPORT_FORMAT.headerColor,
      ),
      accentColor: normalizeHex(
        String(parsed.accentColor ?? DEFAULT_EXPORT_FORMAT.accentColor),
        DEFAULT_EXPORT_FORMAT.accentColor,
      ),
      fontSize: Math.min(
        14,
        Math.max(8, Number(parsed.fontSize) || DEFAULT_EXPORT_FORMAT.fontSize),
      ),
      showLogos: parsed.showLogos !== false,
      showSlogans: parsed.showSlogans !== false,
      showDivider: parsed.showDivider !== false,
      logoSize: normalizeLogoSize(parsed.logoSize),
      leftLogo: normalizeSlot(parsed.leftLogo, DEFAULT_EXPORT_FORMAT.leftLogo),
      rightLogo: normalizeSlot(parsed.rightLogo, DEFAULT_EXPORT_FORMAT.rightLogo),
      extraLogo: normalizeSlot(parsed.extraLogo, DEFAULT_EXPORT_FORMAT.extraLogo),
      slogans: normalizeSlogans(parsed),
    }
  } catch {
    return structuredClone(DEFAULT_EXPORT_FORMAT)
  }
}

export function saveExportFormatSettings(settings: ExportFormatSettings) {
  const next: ExportFormatSettings = {
    headerColor: normalizeHex(settings.headerColor, DEFAULT_EXPORT_FORMAT.headerColor),
    accentColor: normalizeHex(settings.accentColor, DEFAULT_EXPORT_FORMAT.accentColor),
    fontSize: Math.min(14, Math.max(8, settings.fontSize || DEFAULT_EXPORT_FORMAT.fontSize)),
    showLogos: settings.showLogos !== false,
    showSlogans: settings.showSlogans !== false,
    showDivider: settings.showDivider !== false,
    logoSize: normalizeLogoSize(settings.logoSize),
    leftLogo: normalizeSlot(settings.leftLogo, DEFAULT_EXPORT_FORMAT.leftLogo),
    rightLogo: normalizeSlot(settings.rightLogo, DEFAULT_EXPORT_FORMAT.rightLogo),
    extraLogo: normalizeSlot(settings.extraLogo, DEFAULT_EXPORT_FORMAT.extraLogo),
    slogans:
      settings.slogans?.length > 0
        ? settings.slogans.map((pair) => ({
            ar: normalizeText(pair.ar),
            en: normalizeText(pair.en),
          }))
        : structuredClone(DEFAULT_SLOGANS),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex, DEFAULT_EXPORT_FORMAT.headerColor)
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

export function logoPreviewSrc(slot: LogoSlot): string {
  if (slot.customDataUrl) return slot.customDataUrl
  return slot.defaultPath || ''
}

/** Read image file, resize if needed, return data URL */
export async function fileToLogoDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (PNG or JPG)')
  }
  const dataUrl = await readFileAsDataUrl(file)
  const compressed = await compressDataUrl(dataUrl, 420)
  if (compressed.length > MAX_LOGO_BYTES) {
    throw new Error('Image is too large. Use a smaller PNG/JPG (under ~500 KB).')
  }
  return compressed
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read image'))
    reader.readAsDataURL(file)
  })
}

function compressDataUrl(dataUrl: string, maxWidth: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxWidth / Math.max(img.width, 1))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      const isJpeg = dataUrl.startsWith('data:image/jpeg')
      resolve(canvas.toDataURL(isJpeg ? 'image/jpeg' : 'image/png', 0.9))
    }
    img.onerror = () => reject(new Error('Invalid image file'))
    img.src = dataUrl
  })
}

export function dataUrlToBytes(dataUrl: string): Uint8Array {
  const comma = dataUrl.indexOf(',')
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function dataUrlFormat(dataUrl: string): 'PNG' | 'JPEG' {
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) {
    return 'JPEG'
  }
  return 'PNG'
}

export function logoSizeScale(size: LogoSize): number {
  if (size === 'small') return 0.8
  if (size === 'large') return 1.25
  return 1
}

export type DocumentSloganLine = { text: string; arabic: boolean }

/** Always emit Arabic + English for each slogan pair (both languages on every export). */
function sloganLinesFromPairs(pairs: SloganPair[]): DocumentSloganLine[] {
  const lines: DocumentSloganLine[] = []
  for (const pair of pairs) {
    if (pair.ar.trim()) lines.push({ text: pair.ar.trim(), arabic: true })
    if (pair.en.trim()) lines.push({ text: pair.en.trim(), arabic: false })
  }
  return lines
}

export function getExportSlogans(
  settings: ExportFormatSettings,
  _locale?: 'en' | 'ar',
): DocumentSloganLine[] {
  const pairs =
    settings.slogans?.length > 0 ? settings.slogans : DEFAULT_SLOGANS
  const lines = sloganLinesFromPairs(pairs)
  if (lines.length > 0) return lines
  return sloganLinesFromPairs(DEFAULT_SLOGANS)
}
