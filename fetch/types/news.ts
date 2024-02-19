export interface CachedPapillonNews {
  /** Timestamp */
  date: number;
  news: PapillonNews[];
}

export interface PapillonNews {
  title?: string
  date: string
  content: string
  survey: boolean
  read: boolean
  author: string
  category: string

  attachments: any[] // TODO
}
