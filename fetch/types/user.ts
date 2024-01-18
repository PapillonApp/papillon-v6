export interface CachedPapillonUser {
  date: Date
  user: PapillonUser
}

export interface PapillonUser {
  name: string
  class: string
  establishment: string
  phone: string
  address: string[]
  email: string
  ine: string
  profile_picture?: string
  delegue: boolean
  periodes: PapillonUserPeriod[]
}

export interface PapillonUserPeriod {
  start: string
  end: string
  name: string
  id: string
  actual: boolean
}
