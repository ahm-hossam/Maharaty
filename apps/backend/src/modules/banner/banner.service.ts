import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'

export interface BannerConfig {
  isActive: boolean
  title: string
  subtitle: string
  ctaText: string
  bgColor1: string
  bgColor2: string
  contentId?: string | null
  contentType?: string | null
  contentTitle?: string | null
}

const DEFAULT: BannerConfig = {
  isActive: false,
  title: '',
  subtitle: '',
  ctaText: 'ابدأ التعلم ←',
  bgColor1: '#6C63FF',
  bgColor2: '#9C5CF7',
  contentId: null,
  contentType: null,
  contentTitle: null,
}

const BANNER_PATH = path.join(process.cwd(), 'public', 'banner.json')

@Injectable()
export class BannerService {
  get(): BannerConfig {
    try {
      const raw = fs.readFileSync(BANNER_PATH, 'utf8')
      return { ...DEFAULT, ...JSON.parse(raw) }
    } catch {
      return DEFAULT
    }
  }

  save(config: Partial<BannerConfig>): BannerConfig {
    const current = this.get()
    const next = { ...current, ...config }
    fs.mkdirSync(path.dirname(BANNER_PATH), { recursive: true })
    fs.writeFileSync(BANNER_PATH, JSON.stringify(next, null, 2))
    return next
  }
}
