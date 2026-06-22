import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreatePostDto } from './dto/create-post.dto'
import { CreateCommentDto } from './dto/create-comment.dto'

const POST_SELECT = {
  id: true,
  content: true,
  image: true,
  isAdminPost: true,
  isPinned: true,
  createdAt: true,
  author: { select: { id: true, name: true, avatar: true, role: true } },
  _count: { select: { comments: true, reactions: true } },
} as const

@Injectable()
export class CommunityService {
  constructor(private prisma: PrismaService) {}

  async getPosts(page: number, limit: number, userId: string) {
    const skip = (page - 1) * limit
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        select: {
          ...POST_SELECT,
          reactions: { where: { userId }, select: { id: true } },
        },
      }),
      this.prisma.post.count(),
    ])
    return {
      posts: posts.map(({ reactions, ...p }) => ({
        ...p,
        hasReacted: reactions.length > 0,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    }
  }

  async createPost(dto: CreatePostDto, userId: string, role: string) {
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    const isAdminPost = isAdmin ? (dto.isAdminPost ?? true) : false
    return this.prisma.post.create({
      data: { content: dto.content, image: dto.image, isAdminPost, authorId: userId },
      select: {
        ...POST_SELECT,
        reactions: { where: { userId }, select: { id: true } },
      },
    }).then(({ reactions, ...p }) => ({ ...p, hasReacted: reactions.length > 0 }))
  }

  async deletePost(id: string, userId: string, role: string) {
    const post = await this.prisma.post.findUnique({ where: { id }, select: { authorId: true } })
    if (!post) throw new NotFoundException('Post not found')
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    if (post.authorId !== userId && !isAdmin) throw new ForbiddenException('Not allowed')
    await this.prisma.post.delete({ where: { id } })
  }

  async getComments(postId: string, page: number, limit: number) {
    const skip = (page - 1) * limit
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          content: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatar: true, role: true } },
        },
      }),
      this.prisma.comment.count({ where: { postId } }),
    ])
    return { comments, total, page, totalPages: Math.ceil(total / limit) }
  }

  async addComment(postId: string, dto: CreateCommentDto, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new NotFoundException('Post not found')
    return this.prisma.comment.create({
      data: { content: dto.content, postId, authorId: userId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true, avatar: true, role: true } },
      },
    })
  }

  async deleteComment(postId: string, commentId: string, userId: string, role: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true },
    })
    if (!comment || comment.postId !== postId) throw new NotFoundException('Comment not found')
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
    if (comment.authorId !== userId && !isAdmin) throw new ForbiddenException('Not allowed')
    await this.prisma.comment.delete({ where: { id: commentId } })
  }

  async toggleReaction(postId: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } })
    if (!post) throw new NotFoundException('Post not found')
    const existing = await this.prisma.reaction.findUnique({
      where: { postId_userId: { postId, userId } },
    })
    if (existing) {
      await this.prisma.reaction.delete({ where: { id: existing.id } })
      return { hasReacted: false }
    }
    await this.prisma.reaction.create({ data: { postId, userId, type: 'LIKE' } })
    return { hasReacted: true }
  }

  async getStats() {
    const [total, adminPosts] = await Promise.all([
      this.prisma.post.count(),
      this.prisma.post.count({ where: { isAdminPost: true } }),
    ])
    return { total, adminPosts }
  }
}
