export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  skills: UserSkill[]
  completedCourses: number
  totalPoints: number
}

export interface UserSkill {
  skillId: string
  skillName: string
  level: SkillLevel
  progress: number
}

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
