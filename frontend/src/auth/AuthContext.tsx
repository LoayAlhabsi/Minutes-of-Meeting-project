import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchMe,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  setupPassword as setupPasswordApi,
} from '../api/authApi'
import { getToken, setToken } from '../api/http'
import type { AuthUser } from '../types'

const USER_KEY = 'mom-user'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  setupPassword: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

function storeUser(user: AuthUser | null) {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = getToken()
    return token ? readStoredUser() : null
  })
  const [token, setTokenState] = useState<string | null>(() => getToken())

  useEffect(() => {
    if (!token) return
    void fetchMe()
      .then((fresh) => {
        storeUser(fresh)
        setUser(fresh)
      })
      .catch(() => {
        logoutApi()
        storeUser(null)
        setTokenState(null)
        setUser(null)
      })
  }, [token])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isAdmin: user?.role === 'A',
      async login(email, password) {
        const data = await loginApi(email, password)
        setToken(data.token)
        storeUser(data.user)
        setTokenState(data.token)
        setUser(data.user)
        return data.user
      },
      async setupPassword(email, password) {
        const data = await setupPasswordApi(email, password)
        setToken(data.token)
        storeUser(data.user)
        setTokenState(data.token)
        setUser(data.user)
        return data.user
      },
      async register(name, email, password) {
        const data = await registerApi(name, email, password)
        setToken(data.token)
        storeUser(data.user)
        setTokenState(data.token)
        setUser(data.user)
        return data.user
      },
      logout() {
        logoutApi()
        storeUser(null)
        setTokenState(null)
        setUser(null)
      },
    }),
    [user, token],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
