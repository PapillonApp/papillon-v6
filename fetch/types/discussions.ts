export interface PapillonDiscussionMessage {
  id: string
  content: string
  author?: string
  timestamp: number
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
  participants: string[]
}
