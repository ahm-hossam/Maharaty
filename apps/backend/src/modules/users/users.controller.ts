import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'
import { AdminGuard } from '../auth/guards/admin.guard'

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users (admin)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const data = await this.usersService.findAll({ page, limit, search, role, isActive })
    return { success: true, data }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail (admin)' })
  async findOne(@Param('id') id: string) {
    const data = await this.usersService.findOne(id)
    return { success: true, data }
  }

  @Post()
  @ApiOperation({ summary: 'Create user (admin)' })
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto)
    return { success: true, data, message: 'User created successfully' }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (admin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(id, dto)
    return { success: true, data, message: 'User updated successfully' }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user (admin)' })
  async remove(@Param('id') id: string) {
    const data = await this.usersService.remove(id)
    return { success: true, data }
  }
}
