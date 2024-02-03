import type { PronoteApiGradeType } from 'pawnote';

export interface CachedPapillonGrades {
  date: Date
  grades: PapillonGrades
}

export type PapillonGradeValue = {
  significant: true
  type: PronoteApiGradeType
} | {
  significant: false
  value: number
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
    isSimulated?: boolean

    color?: string

    grade: {
      value: PapillonGradeValue
      out_of: PapillonGradeValue
      coefficient: number
      average: PapillonGradeValue
      max: PapillonGradeValue
      min: PapillonGradeValue
    }
  }>

  averages: Array<{
    subject: {
      id: string
      name: string
      groups: boolean
    }

    average: PapillonGradeValue
    class_average: PapillonGradeValue
    max: PapillonGradeValue
    min: PapillonGradeValue
    out_of: PapillonGradeValue
    color: string
  }>

  overall_average: PapillonGradeValue
  class_overall_average: PapillonGradeValue
}

export interface PapillonGradesViewAverages {
  student: number
  group: number
  max: number
  min: number
}
