/**
 * Local enum definitions that mirror the Prisma schema.
 * These are used in DTOs and guards before `prisma generate` runs.
 * After running `prisma generate`, you can optionally import directly from @prisma/client.
 */

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum ContentType {
  COURSE = 'COURSE',
  ARTICLE = 'ARTICLE',
  VIDEO = 'VIDEO',
}

export enum ActivityType {
  REGISTER = 'REGISTER',
  LOGIN = 'LOGIN',
  VIEW_COURSE = 'VIEW_COURSE',
  COMPLETE_COURSE = 'COMPLETE_COURSE',
  START_ASSESSMENT = 'START_ASSESSMENT',
  COMPLETE_ASSESSMENT = 'COMPLETE_ASSESSMENT',
  BUILD_CV = 'BUILD_CV',
  PRACTICE_INTERVIEW = 'PRACTICE_INTERVIEW',
  VIEW_JOBS = 'VIEW_JOBS',
  VIEW_COMMUNITY = 'VIEW_COMMUNITY',
  PATH_STEP_COMPLETE = 'PATH_STEP_COMPLETE',
}

export enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}
