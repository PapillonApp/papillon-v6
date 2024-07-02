import type { PapillonAttachment } from './attachment';

export interface CachedPapillonNews {
  /** Timestamp */
  date: number;
  news: (PapillonNewsInformation | PapillonNewsSurvey)[];
}

export type PapillonNews = PapillonNewsInformation | PapillonNewsSurvey

export interface PapillonNewsInformation {
  /** A local ID for Papillon. */
  id: string
  is: 'information'
  title?: string
  date: string
  content: string
  read: boolean
  acknowledged: boolean
  author: string
  category: string
  attachments: PapillonAttachment[]
  height: number
}

export interface PapillonNewsSurvey {
  /** A local ID for Papillon. */
  id: string
  is: 'survey'
  title?: string
  date: string
  read: boolean
  author: string
  category: string
  questions: PapillonNewsSurveyQuestion[]
  height: number
}

export interface PapillonNewsSurveyQuestion {
  title: string
  attachments: PapillonAttachment[]

  textAnswer?: string
  choicesAnswer?: number[]
  
  choices: Array<{
    label: string,
    position: number,
    textInputRequired: boolean
  }>
  
  maxChoices: number | null
  maxInputLength: number
  required: boolean

  type: 'input' | 'multiple' | 'unique' | 'info'
}
