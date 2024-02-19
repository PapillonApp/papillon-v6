import type { PapillonHomeworkAttachment } from './homework';

export interface PapillonVieScolaire {
  delays: PapillonDelay[]
  absences: PapillonAbsence[]
  punishments: PapillonPunishment[]
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
    documents: PapillonHomeworkAttachment[]
  }
  reason: {
    text: string[]
    circumstances: string
    documents: PapillonHomeworkAttachment[]
  }
  nature: string
  /** In minutes. */
  duration: number
}
