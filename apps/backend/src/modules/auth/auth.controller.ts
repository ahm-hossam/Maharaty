import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Throttle } from '@nestjs/throttler'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'
import { PushTokenDto } from './dto/push-token.dto'
import { JwtAuthGuard } from './guards/jwt.guard'
import { LocalStrategy } from './strategies/local.strategy'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() dto: RegisterDto) {
    const data = await this.authService.register(dto)
    return { success: true, data, message: 'Registration successful' }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login with email and password' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    const data = await this.authService.login(user)
    return { success: true, data, message: 'Login successful' }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshDto) {
    const data = await this.authService.refresh(dto.refreshToken)
    return { success: true, data }
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Body() dto: RefreshDto) {
    const data = await this.authService.logout(dto.refreshToken)
    return { success: true, data }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@Request() req: any) {
    return { success: true, data: req.user }
  }

  @Post('push-token')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register push notification token' })
  async pushToken(@Request() req: any, @Body() dto: PushTokenDto) {
    const data = await this.authService.registerPushToken(req.user.id, dto.token, dto.platform)
    return { success: true, data }
  }
}
