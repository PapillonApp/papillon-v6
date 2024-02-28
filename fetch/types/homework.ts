import type { PronoteApiHomeworkDifficulty, PronoteApiHomeworkReturnType } from 'pawnote';
import type { PapillonAttachment } from './attachment';

export interface PapillonHomework {
  id: string
  
  /** ID that is used to recognize the homework through every sessions. */
  localID: string
  /** Session ID used when the homework got cached. */
  pronoteCachedSessionID: number
  cacheDateTimestamp: number

  attachments: PapillonAttachment[];
  themes: string[]
  subject: {
    id: string
    name: string
    groups: boolean
  }
  description: string
  background_color: string
  done: boolean
  date: string
  difficulty: PronoteApiHomeworkDifficulty
  return?: {
    type: PronoteApiHomeworkReturnType
    uploaded?: boolean
  }
  lengthInMinutes?: number
}

export interface PapillonGroupedHomeworks {
  date: Date
  formattedDate: string,
  time: number
  homeworks: PapillonHomework[]
}
