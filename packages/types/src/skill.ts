export interface Skill {
  id: string
  name: string
  nameAr: string
  description?: string
  icon?: string
  category: SkillCategory
  isActive: boolean
  createdAt: string
}

export interface SkillCategory {
  id: string
  name: string
  nameAr: string
  icon?: string
}
