import { create } from 'zustand'

export interface PersonalInfo {
  fullName: string
  title: string
  email: string
  phone: string
  city: string
  linkedIn: string
  summary: string
}

export interface ExperienceItem {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  isCurrent: boolean
  bullets: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  graduationYear: string
  gpa: string
}

export interface SkillItem {
  id: string
  name: string
  level: 'مبتدئ' | 'متوسط' | 'متقدم' | 'خبير'
}

export interface CertItem {
  id: string
  name: string
  issuer: string
  date: string
}

export interface CvDraft {
  personal: PersonalInfo
  experiences: ExperienceItem[]
  education: EducationItem[]
  skills: SkillItem[]
  certifications: CertItem[]
  languages: { id: string; name: string; level: string }[]
}

export type WizardStep = 0 | 1 | 2 | 3 | 4 | 5

const INITIAL_PERSONAL: PersonalInfo = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  city: '',
  linkedIn: '',
  summary: '',
}

const INITIAL_DRAFT: CvDraft = {
  personal: INITIAL_PERSONAL,
  experiences: [],
  education: [],
  skills: [],
  certifications: [],
  languages: [],
}

interface CvStore {
  draft: CvDraft
  currentStep: WizardStep
  isDirty: boolean

  setStep: (step: WizardStep) => void
  updatePersonal: (fields: Partial<PersonalInfo>) => void
  addExperience: (item: ExperienceItem) => void
  updateExperience: (id: string, fields: Partial<ExperienceItem>) => void
  removeExperience: (id: string) => void
  addEducation: (item: EducationItem) => void
  updateEducation: (id: string, fields: Partial<EducationItem>) => void
  removeEducation: (id: string) => void
  addSkill: (item: SkillItem) => void
  removeSkill: (id: string) => void
  addCertification: (item: CertItem) => void
  removeCertification: (id: string) => void
  addLanguage: (item: { id: string; name: string; level: string }) => void
  removeLanguage: (id: string) => void
  resetDraft: () => void
}

export const useCvStore = create<CvStore>()((set) => ({
  draft: INITIAL_DRAFT,
  currentStep: 0,
  isDirty: false,

  setStep: (step) => set({ currentStep: step }),

  updatePersonal: (fields) =>
    set((s) => ({
      draft: { ...s.draft, personal: { ...s.draft.personal, ...fields } },
      isDirty: true,
    })),

  addExperience: (item) =>
    set((s) => ({
      draft: { ...s.draft, experiences: [...s.draft.experiences, item] },
      isDirty: true,
    })),

  updateExperience: (id, fields) =>
    set((s) => ({
      draft: {
        ...s.draft,
        experiences: s.draft.experiences.map((e) =>
          e.id === id ? { ...e, ...fields } : e
        ),
      },
      isDirty: true,
    })),

  removeExperience: (id) =>
    set((s) => ({
      draft: { ...s.draft, experiences: s.draft.experiences.filter((e) => e.id !== id) },
      isDirty: true,
    })),

  addEducation: (item) =>
    set((s) => ({
      draft: { ...s.draft, education: [...s.draft.education, item] },
      isDirty: true,
    })),

  updateEducation: (id, fields) =>
    set((s) => ({
      draft: {
        ...s.draft,
        education: s.draft.education.map((e) => (e.id === id ? { ...e, ...fields } : e)),
      },
      isDirty: true,
    })),

  removeEducation: (id) =>
    set((s) => ({
      draft: { ...s.draft, education: s.draft.education.filter((e) => e.id !== id) },
      isDirty: true,
    })),

  addSkill: (item) =>
    set((s) => ({
      draft: { ...s.draft, skills: [...s.draft.skills, item] },
      isDirty: true,
    })),

  removeSkill: (id) =>
    set((s) => ({
      draft: { ...s.draft, skills: s.draft.skills.filter((sk) => sk.id !== id) },
      isDirty: true,
    })),

  addCertification: (item) =>
    set((s) => ({
      draft: { ...s.draft, certifications: [...s.draft.certifications, item] },
      isDirty: true,
    })),

  removeCertification: (id) =>
    set((s) => ({
      draft: {
        ...s.draft,
        certifications: s.draft.certifications.filter((c) => c.id !== id),
      },
      isDirty: true,
    })),

  addLanguage: (item) =>
    set((s) => ({
      draft: { ...s.draft, languages: [...s.draft.languages, item] },
      isDirty: true,
    })),

  removeLanguage: (id) =>
    set((s) => ({
      draft: { ...s.draft, languages: s.draft.languages.filter((l) => l.id !== id) },
      isDirty: true,
    })),

  resetDraft: () => set({ draft: INITIAL_DRAFT, currentStep: 0, isDirty: false }),
}))
