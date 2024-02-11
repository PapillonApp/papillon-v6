export interface CachedPapillonNews {
  /** Timestamp */
  date: number;
  news: PapillonNews[];
}

export interface PapillonNews {
  title?: string
  date: string
  content: string
  survey: any // TODO
  read: boolean

  attachments: any[] // TODO
}
