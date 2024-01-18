export interface CachedPapillonGrades {
  date: Date
  grades: PapillonGrades
}

export interface PapillonGrades {
  grades: Array<{
    id: string
    subject: {
      id: string
      name: string
      groups: boolean
    }

    date: string
    description: string

    is_bonus: boolean
    is_optional: boolean
    is_out_of_20: boolean

    grade: {
      value: number
      out_of: number
      coefficient: number
      average: number
      max: number
      min: number
      significant: number
    }
  }>

  averages: Array<{
    subject: {
      id: string
      name: string
      groups: boolean
    }

    average: number
    class_average: number
    max: number
    min: number
    out_of: number
    significant: number
    color: string
  }>

  overall_average: number
  class_overall_average: number
}
