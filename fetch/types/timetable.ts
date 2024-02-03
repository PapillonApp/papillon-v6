export interface CachedPapillonTimetable {
  interval: { from: string, to?: string }
  timetable: PapillonLesson[]
}

export interface PapillonLesson {
  id: string
  num: number
  subject?: { // TODO: Export the type in Pawnote of `StudentSubject` : we're reusing it here.
    id: string
    name: string
    groups: boolean
  }
  teachers: string[]
  rooms: string[]
  group_names: string[]
  memo?: string
  // content: Array<{
  //   title: string
  //   description: string
  //   category: string
  //   files: Array<{
  //     id: string
  //     name: string
  //     url: string
  //     type: number
  //   }>
  // }>
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
