import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CommunityService } from './community.service'
import { CreatePostDto } from './dto/create-post.dto'
import { CreateCommentDto } from './dto/create-comment.dto'
import { JwtAuthGuard } from '../auth/guards/jwt.guard'

@ApiTags('Community')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  @ApiOperation({ summary: 'List community posts' })
  async getPosts(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Request() req: any,
  ) {
    const data = await this.communityService.getPosts(
      parseInt(page),
      parseInt(limit),
      req.user.id,
    )
    return { success: true, data }
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create a community post' })
  async createPost(@Body() dto: CreatePostDto, @Request() req: any) {
    const data = await this.communityService.createPost(dto, req.user.id, req.user.role)
    return { success: true, data }
  }

  @Delete('posts/:id')
  @ApiOperation({ summary: 'Delete a post (own or admin)' })
  async deletePost(@Param('id') id: string, @Request() req: any) {
    await this.communityService.deletePost(id, req.user.id, req.user.role)
    return { success: true }
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get comments for a post' })
  async getComments(
    @Param('id') postId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '30',
  ) {
    const data = await this.communityService.getComments(
      postId,
      parseInt(page),
      parseInt(limit),
    )
    return { success: true, data }
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a post' })
  async addComment(
    @Param('id') postId: string,
    @Body() dto: CreateCommentDto,
    @Request() req: any,
  ) {
    const data = await this.communityService.addComment(postId, dto, req.user.id)
    return { success: true, data }
  }

  @Delete('posts/:postId/comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment (own or admin)' })
  async deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Request() req: any,
  ) {
    await this.communityService.deleteComment(postId, commentId, req.user.id, req.user.role)
    return { success: true }
  }

  @Post('posts/:id/reactions')
  @ApiOperation({ summary: 'Toggle like reaction on a post' })
  async toggleReaction(@Param('id') postId: string, @Request() req: any) {
    const data = await this.communityService.toggleReaction(postId, req.user.id)
    return { success: true, data }
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get community stats' })
  async getStats() {
    const data = await this.communityService.getStats()
    return { success: true, data }
  }
}
