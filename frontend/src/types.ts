export type Attendee = { id: string; name: string; designation: string }
export type Decision = { id: string; text: string }

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'U' | 'A' | string
  enabled: boolean
  mustSetPassword?: boolean
  createdAt: string
}

export type AdminStats = {
  totalMinutes: number
  totalUsers: number
  meetingsThisMonth: number
}

export type MinuteLanguage = 'en' | 'ar'

export type MinuteSearchRequest = {
  title?: string
  person?: string
  dateFrom?: string
  dateTo?: string
  language?: 'all' | MinuteLanguage | string
  creatorFilter?: 'all' | 'mine' | 'users' | string
  sortKey?: 'title' | 'date' | 'preparedBy' | string
  sortDir?: 'asc' | 'desc' | string
  page?: number
  size?: number
}

export type UserSearchRequest = {
  query?: string
  role?: 'all' | 'U' | 'A' | string
  status?: 'all' | 'active' | 'disabled' | string
  sortKey?: 'name' | 'email' | 'role' | 'createdAt' | string
  sortDir?: 'asc' | 'desc' | string
  page?: number
  size?: number
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  allCount?: number | null
  mineCount?: number | null
  userCount?: number | null
}

export type SavedMinute = {
  id: string
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  approvedBy?: string
  language?: MinuteLanguage | string
  createdByUserId?: string
  createdByName?: string
  createdByEmail?: string
  attendees: Attendee[]
  decisions: Decision[]
}

export type MinuteFormData = {
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  approvedBy: string
  language: MinuteLanguage
  attendees: Attendee[]
  decisions: Decision[]
}
