export interface CachedPapillonTimetable {
  interval: { from: string, to?: string }
  timetable: PapillonLesson[]
  cacheTimestamp: number
}

export interface PapillonLesson {
  id: string
  num: number
  subject?: {
    id: string
    name: string
    groups: boolean
  }
  teachers: string[]
  rooms: string[]
  group_names: string[]
  memo?: string
  virtual: string[]
  start: string
  end: string
  background_color?: string
  status?: string
  is_cancelled: boolean
  is_outing: boolean
  is_detention: boolean
  is_exempted: boolean
  is_test: boolean
}
