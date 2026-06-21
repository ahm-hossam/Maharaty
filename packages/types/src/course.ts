export interface Course {
  id: string
  title: string
  titleAr: string
  description?: string
  thumbnail?: string
  duration: number
  skillId: string
  skill?: import('./skill').Skill
  level: import('./user').SkillLevel
  isActive: boolean
  createdAt: string
}

export interface CourseProgress {
  courseId: string
  userId: string
  progress: number
  completedAt?: string
  startedAt: string
}
