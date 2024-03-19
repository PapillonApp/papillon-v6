export interface CachedPapillonUser {
  timestamp: number
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

  // We have to split it into different periods for each menu
  // because that is how Pronote works internally.
  // If splitting is not required for a service, just pass
  // the same values everywhere.
  periodes: {
    grades: PapillonUserPeriod[]
    attendance: PapillonUserPeriod[]
    evaluations: PapillonUserPeriod[]
  }
}

export interface PapillonUserPeriod {
  id: string
  name: string

  start: number
  end: number

  /**
   * Whether the default period is this one or not.
   * Should be synced across time.
   */
  actual: boolean
}
