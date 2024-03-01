export enum PapillonAttachmentType {
  Link = 0,
  File = 1
}

export interface PapillonAttachment {
  name: string
  type: PapillonAttachmentType
  /**
   * URL that only works as long
   * as the session that fetched
   * this attachment is still alive.
   */
  url: string
}
