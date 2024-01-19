import type { PapillonGrades } from './grades';

export interface PapillonSubject {
  name: string
  parsedName?: {
    name: string,
    sub?: string
  }
  subject: PapillonGrades['grades'][number]['subject']
  grades: PapillonGrades['grades']
  averages: {
    average: number
    class_average: number
    min: number
    max: number
    out_of: number
  }
}
