import type { PapillonAttachment } from './attachment';

export interface PapillonVieScolaire {
  delays: PapillonDelay[]
  absences: PapillonAbsence[]
  punishments: PapillonPunishment[]
}

export interface CachedPapillonVieScolaire extends PapillonVieScolaire {
  timestamp: number
}

export interface PapillonAbsence {
  id: string
  from: number
  to: number
  justified: boolean
  hours: string
  reasons: [string | null]
}

export interface PapillonDelay {
  id: string
  date: number
  /** Duration in minutes. */
  duration: number
  justified: boolean
  justification: string | null
  reasons: [string | null]
}

export interface PapillonPunishmentSchedule {
  id: string
  start: number
  /** In minutes. */
  duration: number
}

export interface PapillonPunishment {
  id: string
  schedulable: boolean
  schedule: PapillonPunishmentSchedule[] // TODO in Pawnote
  date: number
  given_by: string
  exclusion: boolean
  during_lesson: boolean
  homework: {
    text: string
    documents: PapillonAttachment[]
  }
  reason: {
    text: string[]
    circumstances: string
    documents: PapillonAttachment[]
  }
  nature: string
  /** In minutes. */
  duration: number
}
