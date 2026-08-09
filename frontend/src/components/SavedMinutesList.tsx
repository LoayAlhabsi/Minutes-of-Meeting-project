import { downloadPdf, downloadWord } from '../pdfWordConverter'
import { t, type Locale } from '../localization'
import type { SavedMinute } from '../types'

type Props = {
  locale: Locale
  savedList: SavedMinute[]
  editingId: string | null
  loading: boolean
  onRefresh: () => void
  onUpdate: (row: SavedMinute) => void
}

export function SavedMinutesList({
  locale,
  savedList,
  editingId,
  loading,
  onRefresh,
  onUpdate,
}: Props) {
  return (
    <section className="block saved-block">
      <div className="block-head">
        <h2>{t(locale, 'savedMinutes')}</h2>
        <button
          type="button"
          className="btn-light"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? t(locale, 'loading') : t(locale, 'refresh')}
        </button>
      </div>
      {savedList.length === 0 ? (
        <p className="empty">{t(locale, 'emptyList')}</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t(locale, 'colTitle')}</th>
                <th>{t(locale, 'colDate')}</th>
                <th>{t(locale, 'colLocation')}</th>
                <th>{t(locale, 'colPreparedBy')}</th>
                <th>{t(locale, 'colActions')}</th>
              </tr>
            </thead>
            <tbody>
              {savedList.map((row) => (
                <tr
                  key={row.id}
                  className={editingId === row.id ? 'row-editing' : undefined}
                >
                  <td>{row.title || '—'}</td>
                  <td>{row.date || '—'}</td>
                  <td>{row.location || '—'}</td>
                  <td>{row.preparedBy || '—'}</td>
                  <td className="actions-cell">
                    <button
                      type="button"
                      className="btn-light"
                      onClick={() => onUpdate(row)}
                    >
                      {t(locale, 'update')}
                    </button>
                    <button
                      type="button"
                      className="btn-light"
                      onClick={() => void downloadPdf(row, locale)}
                    >
                      {t(locale, 'pdf')}
                    </button>
                    <button
                      type="button"
                      className="btn-light"
                      onClick={() => void downloadWord(row, locale)}
                    >
                      {t(locale, 'word')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
