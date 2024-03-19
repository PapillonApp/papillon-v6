export interface PapillonEvaluationAcquisition {
  id: string
  name: string
  coefficient: number
  abbreviation: string
  level: string
}

export interface PapillonEvaluation {
  id: string
  subject: {
    id: string
    name: string
    groups: boolean
  }
  name: string
  description: string
  teacher: string
  date: number
  paliers: string[]
  coefficient: number
  acquisitions: PapillonEvaluationAcquisition[]
}
