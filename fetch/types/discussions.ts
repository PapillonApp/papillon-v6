export interface PapillonDiscussionMessage {
  id: string
  content: string
  author?: string
  timestamp: number,
  amountOfRecipients: number,
  files: {
    name: string
    url: string
  }[],
}

export interface PapillonDiscussion {
  local_id: string
  subject: string
  creator: string
  /** Timestamp of the first message ever sent. */
  timestamp: number
  /** Number of messages unread. */
  unread: number
  closed: boolean
  messages: PapillonDiscussionMessage[]
  participants: PapillonRecipient[]
}

export enum PapillonRecipientType {
  TEACHER,
  PERSONAL,
  STUDENT
}

export interface PapillonRecipient {
  id: string
  name: string
  functions: string[]
  type: PapillonRecipientType
}
