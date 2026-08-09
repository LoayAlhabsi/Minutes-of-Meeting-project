export type Attendee = { id: string; name: string; designation: string }
export type Decision = { id: string; text: string }

export type SavedMinute = {
  id: string
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  attendees: Attendee[]
  decisions: Decision[]
}

export type MinuteFormData = {
  title: string
  location: string
  date: string
  discussion: string
  preparedBy: string
  attendees: Attendee[]
  decisions: Decision[]
}
