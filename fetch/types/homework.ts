export interface PapillonHomeworkAttachment {
  name: string
  type: number // TODO: export enum in pawnote
  /**
   * URL that only works as long
   * as the session that fetched
   * this attachment is still alive.
   */
  url: string
}

export interface PapillonHomework {
  id: string
  localID: string
  attachments: PapillonHomeworkAttachment[];
  subject: {
    id: string
    name: string
    groups: boolean
  }
  description: string
  background_color: string
  done: boolean
  date: string
}

export interface PapillonGroupedHomeworks {
  date: Date
  formattedDate: string,
  time: number
  homeworks: PapillonHomework[]
}
