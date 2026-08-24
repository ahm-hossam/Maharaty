import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

// Like JwtAuthGuard, but never rejects the request — it populates
// req.user when a valid token is present and leaves it undefined
// otherwise, so a single route can serve both guests and logged-in users.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(_err: any, user: any) {
    return user || undefined
  }
}
