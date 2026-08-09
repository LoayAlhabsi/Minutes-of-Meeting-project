import { MinuteForm } from './components/MinuteForm'
import { SavedMinutesList } from './components/SavedMinutesList'
import { useMinutesApp } from './hooks/useMinutesApp'
import { t } from './localization'
import './App.css'

export default function App() {
  const app = useMinutesApp()

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <img
            src="/brand/moh-logo-light.png"
            alt={t(app.locale, 'logoAlt')}
            className="logo"
          />
          <div className="topbar-title">
            <strong>{t(app.locale, 'brandTitle')}</strong>
            <span className="sub">{t(app.locale, 'brandSubtitle')}</span>
          </div>
        </div>
        <div className="lang-switch" role="group" aria-label="Language">
          <button
            type="button"
            className={app.locale === 'en' ? 'lang-btn active' : 'lang-btn'}
            onClick={() => app.setLang('en')}
            aria-pressed={app.locale === 'en'}
          >
            {t(app.locale, 'langEn')}
          </button>
          <button
            type="button"
            className={app.locale === 'ar' ? 'lang-btn active' : 'lang-btn'}
            onClick={() => app.setLang('ar')}
            aria-pressed={app.locale === 'ar'}
          >
            {t(app.locale, 'langAr')}
          </button>
        </div>
      </header>

      <main className="content">
        {app.isEditing && (
          <div className="banner edit">{t(app.locale, 'editBanner')}</div>
        )}

        <MinuteForm
          locale={app.locale}
          isEditing={app.isEditing}
          title={app.title}
          location={app.location}
          date={app.date}
          dateMin={app.dateMin}
          discussion={app.discussion}
          preparedBy={app.preparedBy}
          attendees={app.attendees}
          decisions={app.decisions}
          saving={app.saving}
          status={app.status}
          error={app.error}
          onTitleChange={app.setTitle}
          onLocationChange={app.setLocation}
          onDateChange={app.setDate}
          onDiscussionChange={app.setDiscussion}
          onPreparedByChange={app.setPreparedBy}
          onUpdateAttendee={app.updateAttendee}
          onAddAttendee={app.addAttendee}
          onRemoveAttendee={app.removeAttendee}
          onUpdateDecision={app.updateDecision}
          onAddDecision={app.addDecision}
          onRemoveDecision={app.removeDecision}
          onReset={app.resetForm}
          onCancelUpdate={app.cancelUpdate}
          onSubmit={app.handleSubmit}
          onMarkDirty={app.markDirty}
        />

        <SavedMinutesList
          locale={app.locale}
          savedList={app.savedList}
          editingId={app.editingId}
          loading={app.loading}
          onRefresh={() => void app.loadMinutes()}
          onUpdate={app.startUpdate}
        />
      </main>
    </div>
  )
}
