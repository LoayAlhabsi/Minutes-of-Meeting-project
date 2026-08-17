import type { ReactNode } from 'react'
import { shortPersonName } from '../../../formUtils'

type Props = {
  name?: string
  email?: string
  extra?: ReactNode
}

export function PersonNameCell({ name, email, extra }: Props) {
  const full = (name || '').trim()
  const mail = (email || '').trim()
  return (
    <div className="person-block">
      <div className="person-cell">
        {extra}
        <span className="cell-ellipsis" title={full || undefined}>
          {shortPersonName(full) || '—'}
        </span>
      </div>
      {mail ? (
        <div className="muted cell-ellipsis" title={mail}>
          {mail}
        </div>
      ) : null}
    </div>
  )
}
