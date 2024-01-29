import type { PronoteApiAttachmentType, PronoteApiHomeworkDifficulty, PronoteApiHomeworkReturnType } from 'pawnote';

export interface PapillonHomeworkAttachment {
  name: string
  type: PronoteApiAttachmentType
  /**
   * URL that only works as long
   * as the session that fetched
   * this attachment is still alive.
   */
  url: string
}

export interface PapillonHomework {
  id: string
  
  /** ID that is used to recognize the homework through every sessions. */
  localID: string
  /** Session ID used when the homework got cached. */
  pronoteCachedSessionID: number
  cacheDateTimestamp: number

  attachments: PapillonHomeworkAttachment[];
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
