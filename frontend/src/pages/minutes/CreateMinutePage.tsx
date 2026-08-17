import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MinuteForm } from '../user/components/MinuteForm'
import { useMinutesApp } from '../user/hooks/useMinutesApp'
import { t, type Locale } from '../../localization'
import type { SavedMinute } from '../../types'

type Props = {
  locale: Locale
  listPath: string
}

export function CreateMinutePage({ locale, listPath }: Props) {
  const app = useMinutesApp(locale)
  const location = useLocation()
  const navigate = useNavigate()
  const formLocale = app.language

  useEffect(() => {
    const editMinute = (location.state as { editMinute?: SavedMinute } | null)
      ?.editMinute
    if (editMinute) {
      app.startUpdate(editMinute)
      navigate(location.pathname, { replace: true, state: null })
    }
    // Only apply navigation state once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCancelUpdate() {
    app.cancelUpdate()
    navigate(listPath)
  }

  return (
    <div className="admin-page" dir={formLocale === 'ar' ? 'rtl' : 'ltr'} lang={formLocale}>
      <div className="admin-intro">
        <h1>
          {app.isEditing
            ? t(formLocale, 'updateMeeting')
            : t(formLocale, 'createMinuteTitle')}
        </h1>
        <p>{t(formLocale, 'createMinuteSub')}</p>
      </div>

      {app.isEditing ? (
        <div className="banner edit">{t(formLocale, 'editBanner')}</div>
      ) : null}

      <MinuteForm
        locale={formLocale}
        isEditing={app.isEditing}
        language={app.language}
        title={app.title}
        location={app.location}
        date={app.date}
        dateMax={app.dateMax}
        discussion={app.discussion}
        preparedBy={app.preparedBy}
        approvedBy={app.approvedBy}
        attendees={app.attendees}
        decisions={app.decisions}
        saving={app.saving}
        status={app.status}
        error={app.error}
        onLanguageChange={app.setLanguage}
        onTitleChange={app.setTitle}
        onLocationChange={app.setLocation}
        onDateChange={app.setDate}
        onDiscussionChange={app.setDiscussion}
        onPreparedByChange={app.setPreparedBy}
        onApprovedByChange={app.setApprovedBy}
        onUpdateAttendee={app.updateAttendee}
        onAddAttendee={app.addAttendee}
        onRemoveAttendee={app.removeAttendee}
        onUpdateDecision={app.updateDecision}
        onAddDecision={app.addDecision}
        onRemoveDecision={app.removeDecision}
        onReset={app.resetForm}
        onCancelUpdate={handleCancelUpdate}
        onSubmit={app.handleSubmit}
        onMarkDirty={app.markDirty}
      />
    </div>
  )
}
