export interface Assessment {
  id: string
  title: string
  titleAr: string
  skillId: string
  questions: Question[]
  duration: number
  passingScore: number
  isActive: boolean
}

export interface Question {
  id: string
  text: string
  textAr: string
  options: Option[]
  correctOptionId: string
}

export interface Option {
  id: string
  text: string
  textAr: string
}

export interface AssessmentResult {
  id: string
  assessmentId: string
  userId: string
  score: number
  passed: boolean
  completedAt: string
}
