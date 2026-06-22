import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import * as path from 'path'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
  )

  const configService = app.get(ConfigService)

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } })

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  await app.register(require('@fastify/static'), {
    root: path.join(process.cwd(), 'public'),
    prefix: '/',
    decorateReply: false,
  })

  // Register @fastify/helmet if available
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const helmet = require('@fastify/helmet')
    await app.register(helmet)
  } catch {
    // @fastify/helmet not installed, skipping
  }

  const rawOrigins = configService.get<string>('CORS_ORIGINS', '*')
  const origins = rawOrigins === '*' ? true : rawOrigins.split(',').map((o) => o.trim())
  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Maharaty API')
    .setDescription('مهاراتي - Skills platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document)

  const port = configService.get<number>('PORT', 3001)
  await app.listen(port, '0.0.0.0')
  console.log(`Maharaty API running on http://localhost:${port}`)
  console.log(`Swagger docs at http://localhost:${port}/docs`)
}

bootstrap()
