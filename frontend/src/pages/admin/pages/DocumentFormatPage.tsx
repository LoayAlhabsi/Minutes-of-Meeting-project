import { useRef, useState, type FormEvent, type RefObject } from 'react'
import {
  DEFAULT_EXPORT_FORMAT,
  fileToLogoDataUrl,
  getExportFormatSettings,
  logoPreviewSrc,
  saveExportFormatSettings,
  type ExportFormatSettings,
  type LogoSlot,
} from '../../../exportFormat'
import { downloadPdf, downloadWord } from '../../../pdfWordConverter'
import { t, type Locale } from '../../../localization'

type Props = { locale: Locale }
type LogoKey = 'leftLogo' | 'rightLogo' | 'extraLogo'

const sampleMinutes: Record<
  Locale,
  {
    title: string
    location: string
    date: string
    discussion: string
    preparedBy: string
    approvedBy?: string
    attendees: { name: string; designation: string }[]
    decisions: { text: string }[]
  }
> = {
  en: {
    title: 'Sample Meeting',
    location: 'Ministry of Health',
    date: '2026-08-09',
    discussion: 'Sample discussion for previewing the document design.',
    preparedBy: 'Admin',
    approvedBy: 'Director',
    attendees: [
      { name: 'Ahmed Ali', designation: 'Officer' },
      { name: 'Sara Said', designation: 'Coordinator' },
    ],
    decisions: [
      { text: 'Approve the proposed plan' },
      { text: 'Schedule follow-up meeting' },
    ],
  },
  ar: {
    title: 'اجتماع تجريبي',
    location: 'وزارة الصحة',
    date: '2026-08-09',
    discussion: 'نقاش تجريبي لمعاينة تصميم المستند.',
    preparedBy: 'المسؤول',
    approvedBy: 'المدير',
    attendees: [
      { name: 'أحمد علي', designation: 'موظف' },
      { name: 'سارة سعيد', designation: 'منسقة' },
    ],
    decisions: [
      { text: 'اعتماد الخطة المقترحة' },
      { text: 'جدولة اجتماع متابعة' },
    ],
  },
}

export function DocumentFormatPage({ locale }: Props) {
  const [settings, setSettings] = useState<ExportFormatSettings>(() =>
    getExportFormatSettings(),
  )
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)
  const extraInputRef = useRef<HTMLInputElement>(null)

  function update<K extends keyof ExportFormatSettings>(
    key: K,
    value: ExportFormatSettings[K],
  ) {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setStatus('')
    setError('')
  }

  function updateSlot(key: LogoKey, patch: Partial<LogoSlot>) {
    setSettings((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }))
    setStatus('')
    setError('')
  }

  async function handleUpload(key: LogoKey, file: File | null) {
    if (!file) return
    try {
      const dataUrl = await fileToLogoDataUrl(file)
      updateSlot(key, { customDataUrl: dataUrl, enabled: true })
      setStatus(t(locale, 'logoUpdated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : t(locale, 'errRequest'))
    }
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    const saved = saveExportFormatSettings(settings)
    setSettings(saved)
    setStatus(t(locale, 'formatSaved'))
  }

  function handleReset() {
    setSettings(structuredClone(DEFAULT_EXPORT_FORMAT))
    setStatus(t(locale, 'formatResetDraft'))
    setError('')
  }

  function renderLogoCard(
    key: LogoKey,
    title: string,
    inputRef: RefObject<HTMLInputElement | null>,
    allowDisable: boolean,
  ) {
    const slot = settings[key]
    const preview = logoPreviewSrc(slot)

    return (
      <div className="logo-card">
        <div className="logo-card-head">
          <strong>{title}</strong>
          {allowDisable ? (
            <label className="check-row logo-enable">
              <input
                type="checkbox"
                checked={slot.enabled}
                onChange={(e) => updateSlot(key, { enabled: e.target.checked })}
              />
              <span>{t(locale, 'logoEnabled')}</span>
            </label>
          ) : null}
        </div>

        <div className="logo-preview">
          {preview && slot.enabled ? (
            <img src={preview} alt={title} />
          ) : (
            <span className="muted">{t(locale, 'logoEmpty')}</span>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          hidden
          onChange={(e) => {
            void handleUpload(key, e.target.files?.[0] || null)
            e.target.value = ''
          }}
        />

        <div className="logo-actions">
          <button
            type="button"
            className="btn-light"
            onClick={() => inputRef.current?.click()}
          >
            {slot.customDataUrl || !slot.defaultPath
              ? t(locale, 'changeLogo')
              : t(locale, 'uploadLogo')}
          </button>
          {slot.customDataUrl ? (
            <button
              type="button"
              className="btn-light"
              onClick={() => updateSlot(key, { customDataUrl: '' })}
            >
              {t(locale, 'useDefaultLogo')}
            </button>
          ) : null}
          {key === 'extraLogo' && (slot.customDataUrl || slot.enabled) ? (
            <button
              type="button"
              className="btn-text"
              onClick={() =>
                updateSlot(key, {
                  enabled: false,
                  customDataUrl: '',
                })
              }
            >
              {t(locale, 'removeLogo')}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-intro">
        <h1>{t(locale, 'navDocumentFormat')}</h1>
        <p>{t(locale, 'documentFormatSub')}</p>
      </div>

      <form className="block document-format-form" onSubmit={handleSave}>
        <h2>{t(locale, 'logoSection')}</h2>
        <p className="muted">{t(locale, 'logoSectionHint')}</p>
        <p className="banner edit">{t(locale, 'formatSaveHint')}</p>

        <div className="logo-grid">
          {renderLogoCard(
            'leftLogo',
            t(locale, 'leftLogo'),
            leftInputRef,
            true,
          )}
          {renderLogoCard(
            'rightLogo',
            t(locale, 'rightLogo'),
            rightInputRef,
            true,
          )}
          {renderLogoCard(
            'extraLogo',
            t(locale, 'extraLogo'),
            extraInputRef,
            true,
          )}
        </div>

        <h2>{t(locale, 'formatSection')}</h2>
        <div className="grid-2">
          <label>
            {t(locale, 'headerColor')}
            <div className="color-row">
              <input
                type="color"
                value={`#${settings.headerColor}`}
                onChange={(e) =>
                  update('headerColor', e.target.value.replace('#', ''))
                }
              />
              <input
                value={settings.headerColor}
                onChange={(e) => update('headerColor', e.target.value)}
              />
            </div>
          </label>
          <label>
            {t(locale, 'accentColor')}
            <div className="color-row">
              <input
                type="color"
                value={`#${settings.accentColor}`}
                onChange={(e) =>
                  update('accentColor', e.target.value.replace('#', ''))
                }
              />
              <input
                value={settings.accentColor}
                onChange={(e) => update('accentColor', e.target.value)}
              />
            </div>
          </label>
        </div>

        <div className="grid-2">
          <label>
            {t(locale, 'fontSize')}
            <input
              type="number"
              min={8}
              max={14}
              value={settings.fontSize}
              onChange={(e) => update('fontSize', Number(e.target.value))}
            />
          </label>
          <label>
            {t(locale, 'logoSize')}
            <select
              value={settings.logoSize}
              onChange={(e) =>
                update(
                  'logoSize',
                  e.target.value as ExportFormatSettings['logoSize'],
                )
              }
            >
              <option value="small">{t(locale, 'sizeSmall')}</option>
              <option value="medium">{t(locale, 'sizeMedium')}</option>
              <option value="large">{t(locale, 'sizeLarge')}</option>
            </select>
          </label>
        </div>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.showLogos}
            onChange={(e) => update('showLogos', e.target.checked)}
          />
          <span>{t(locale, 'showLogos')}</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.showDivider}
            onChange={(e) => update('showDivider', e.target.checked)}
          />
          <span>{t(locale, 'showDivider')}</span>
        </label>

        <label className="check-row">
          <input
            type="checkbox"
            checked={settings.showSlogans}
            onChange={(e) => update('showSlogans', e.target.checked)}
          />
          <span>{t(locale, 'showSlogans')}</span>
        </label>

        {settings.showSlogans ? (
          <div className="slogan-fields">
            <h2>{t(locale, 'sloganSection')}</h2>
            <p className="muted">{t(locale, 'sloganSectionHint')}</p>
            {settings.slogans.map((pair, index) => (
              <div className="slogan-pair" key={index}>
                <div className="slogan-pair-head">
                  <strong>
                    {t(locale, 'sloganItem')} {index + 1}
                  </strong>
                  {settings.slogans.length > 1 ? (
                    <button
                      type="button"
                      className="btn-light btn-small"
                      onClick={() =>
                        update(
                          'slogans',
                          settings.slogans.filter((_, i) => i !== index),
                        )
                      }
                    >
                      {t(locale, 'removeSlogan')}
                    </button>
                  ) : null}
                </div>
                <label>
                  {t(locale, 'sloganArabic')}
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={pair.ar}
                    onChange={(e) => {
                      const next = settings.slogans.map((item, i) =>
                        i === index ? { ...item, ar: e.target.value } : item,
                      )
                      update('slogans', next)
                    }}
                  />
                </label>
                <label>
                  {t(locale, 'sloganEnglish')}
                  <textarea
                    rows={2}
                    dir="ltr"
                    value={pair.en}
                    onChange={(e) => {
                      const next = settings.slogans.map((item, i) =>
                        i === index ? { ...item, en: e.target.value } : item,
                      )
                      update('slogans', next)
                    }}
                  />
                </label>
              </div>
            ))}
            <button
              type="button"
              className="btn-light"
              onClick={() =>
                update('slogans', [...settings.slogans, { ar: '', en: '' }])
              }
            >
              {t(locale, 'addSlogan')}
            </button>
          </div>
        ) : null}

        {error ? <p className="err">{error}</p> : null}
        {status ? <p className="ok">{status}</p> : null}

        <div className="filter-actions">
          <button type="submit" className="btn-primary">
            {t(locale, 'saveFormat')}
          </button>
          <button type="button" className="btn-light" onClick={handleReset}>
            {t(locale, 'resetFormat')}
          </button>
          <button
            type="button"
            className="btn-light"
            onClick={() =>
              void downloadPdf(sampleMinutes.en, 'en', settings, {
                fitOnePage: true,
              })
            }
          >
            {t(locale, 'previewPdfEn')}
          </button>
          <button
            type="button"
            className="btn-light"
            onClick={() =>
              void downloadPdf(sampleMinutes.ar, 'ar', settings, {
                fitOnePage: true,
              })
            }
          >
            {t(locale, 'previewPdfAr')}
          </button>
          <button
            type="button"
            className="btn-light"
            onClick={() => void downloadWord(sampleMinutes.en, 'en', settings)}
          >
            {t(locale, 'previewWordEn')}
          </button>
          <button
            type="button"
            className="btn-light"
            onClick={() => void downloadWord(sampleMinutes.ar, 'ar', settings)}
          >
            {t(locale, 'previewWordAr')}
          </button>
        </div>
      </form>
    </div>
  )
}
