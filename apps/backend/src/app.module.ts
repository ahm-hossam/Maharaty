import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { DatabaseModule } from './database/database.module'
import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { SkillsModule } from './modules/skills/skills.module'
import { CoursesModule } from './modules/courses/courses.module'
import { AssessmentsModule } from './modules/assessments/assessments.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { AdminModule } from './modules/admin/admin.module'
import { ContentModule } from './modules/content/content.module'
import { ActivitiesModule } from './modules/activities/activities.module'
import { UploadModule } from './modules/upload/upload.module'
import { BannerModule } from './modules/banner/banner.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    SkillsModule,
    CoursesModule,
    AssessmentsModule,
    NotificationsModule,
    AdminModule,
    ContentModule,
    ActivitiesModule,
    UploadModule,
    BannerModule,
  ],
})
export class AppModule {}
