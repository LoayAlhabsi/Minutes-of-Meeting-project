import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import { LoginPage } from './auth/LoginPage'
import { ProtectedRoute } from './auth/ProtectedRoute'
import { RegisterPage } from './auth/RegisterPage'
import {
  applyDocumentLocale,
  getStoredLocale,
  storeLocale,
  t,
  type Locale,
} from './localization'
import { AdminLayout } from './pages/admin/AdminLayout'
import { DashboardPage } from './pages/admin/pages/DashboardPage'
import { DocumentFormatPage } from './pages/admin/pages/DocumentFormatPage'
import { ManageMeetingsPage } from './pages/admin/pages/ManageMeetingsPage'
import { CreateUserPage } from './pages/admin/pages/CreateUserPage'
import { ManageUsersPage } from './pages/admin/pages/ManageUsersPage'
import { CreateMinutePage } from './pages/minutes/CreateMinutePage'
import { ListMinutesPage } from './pages/minutes/ListMinutesPage'
import { PresentationFormatPage } from './pages/minutes/PresentationFormatPage'
import { MeetingReportPage } from './pages/minutes/MeetingReportPage'
import { UserLayout } from './pages/user/UserLayout'
import { UserHomePage } from './pages/user/pages/UserHomePage'
import './App.css'

function AppShell() {
  const [locale, setLocale] = useState<Locale>(() => getStoredLocale())
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    applyDocumentLocale(locale)
    storeLocale(locale)
  }, [locale])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-brand">
          <img
            src="/brand/moh-logo-light.png"
            alt={t(locale, 'logoAlt')}
            className="logo"
          />
          <div className="topbar-title">
            <strong>{t(locale, 'brandTitle')}</strong>
            <span className="sub">{t(locale, 'brandSubtitle')}</span>
          </div>
        </div>
        <div className="topbar-actions">
          {isAuthenticated && user ? (
            <div className="user-chip">
              <span>{user.name}</span>
              <small>
                {user.role === 'A' ? t(locale, 'roleAdmin') : t(locale, 'roleUser')}
              </small>
            </div>
          ) : null}
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={locale === 'en' ? 'lang-btn active' : 'lang-btn'}
              onClick={() => setLocale('en')}
              aria-pressed={locale === 'en'}
            >
              {t(locale, 'langEn')}
            </button>
            <button
              type="button"
              className={locale === 'ar' ? 'lang-btn active' : 'lang-btn'}
              onClick={() => setLocale('ar')}
              aria-pressed={locale === 'ar'}
            >
              {t(locale, 'langAr')}
            </button>
          </div>
          {isAuthenticated ? (
            <button type="button" className="btn-logout" onClick={handleLogout}>
              {t(locale, 'logout')}
            </button>
          ) : null}
        </div>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage locale={locale} />} />
        <Route path="/register" element={<RegisterPage locale={locale} />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/user" element={<UserLayout locale={locale} />}>
            <Route index element={<UserHomePage locale={locale} />} />
            <Route
              path="minutes/create"
              element={
                <CreateMinutePage locale={locale} listPath="/user/minutes" />
              }
            />
            <Route
              path="minutes"
              element={
                <ListMinutesPage
                  locale={locale}
                  createPath="/user/minutes/create"
                />
              }
            />
            <Route
              path="presentation-format"
              element={<PresentationFormatPage locale={locale} />}
            />
            <Route
              path="meeting-report"
              element={<MeetingReportPage locale={locale} />}
            />
          </Route>
        </Route>
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayout locale={locale} />}>
            <Route index element={<DashboardPage locale={locale} />} />
            <Route path="users" element={<ManageUsersPage locale={locale} />} />
            <Route
              path="users/create"
              element={<CreateUserPage locale={locale} />}
            />
            <Route
              path="meetings/create"
              element={
                <CreateMinutePage locale={locale} listPath="/admin/meetings" />
              }
            />
            <Route
              path="meetings"
              element={<ManageMeetingsPage locale={locale} />}
            />
            <Route
              path="presentation-format"
              element={<PresentationFormatPage locale={locale} />}
            />
            <Route
              path="meeting-report"
              element={<MeetingReportPage locale={locale} />}
            />
            <Route
              path="document-format"
              element={<DocumentFormatPage locale={locale} />}
            />
          </Route>
        </Route>
        <Route
          path="*"
          element={
            <Navigate
              to={
                isAuthenticated
                  ? isAdmin
                    ? '/admin'
                    : '/user'
                  : '/login'
              }
              replace
            />
          }
        />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}
