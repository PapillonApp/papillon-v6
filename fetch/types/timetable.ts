import type { PapillonAttachment } from './attachment';

export interface CachedPapillonTimetable {
  interval: { from: string, to?: string }
  timetable: PapillonLesson[]
  cacheTimestamp: number
}

export interface PapillonLesson {
  id: string
  subject?: {
    id: string
    name: string
    groups: boolean
  }
  teachers: string[]
  rooms: string[]
  group_names: string[]
  memo?: string
  /** Virtual classroom or video conference URLs. */
  virtual: string[]
  start: number
  end: number
  background_color?: string
  status?: string
  is_cancelled: boolean
  is_outing: boolean
  is_detention: boolean
  is_exempted: boolean
  is_test: boolean
  num?: number;
  classroom: string;
  contents?: Array<{
    description?: string
    title?: string
    files?: PapillonAttachment[]
  }>
}
