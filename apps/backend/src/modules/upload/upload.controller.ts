import {
  Controller,
  Post,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'
import * as path from 'path'
import * as fs from 'fs'
import * as crypto from 'crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

@ApiTags('Upload')
@ApiBearerAuth()
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiOperation({ summary: 'Upload an image, returns public URL' })
  @ApiConsumes('multipart/form-data')
  async uploadImage(@Req() req: any) {
    if (!req.isMultipart()) throw new BadRequestException('multipart request required')

    const data = await req.file()
    if (!data) throw new BadRequestException('no file uploaded')

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(data.mimetype)) {
      throw new BadRequestException('only jpeg/png/webp/gif allowed')
    }

    const ext = path.extname(data.filename) || '.' + data.mimetype.split('/')[1]
    const filename = crypto.randomBytes(16).toString('hex') + ext

    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    const dest = path.join(UPLOAD_DIR, filename)
    await fs.promises.writeFile(dest, await data.toBuffer())

    return { success: true, url: `/uploads/${filename}` }
  }
}
