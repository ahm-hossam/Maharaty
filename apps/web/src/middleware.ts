import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.has('maharaty-session') &&
    request.cookies.get('maharaty-session')?.value === '1'

  if (PUBLIC_PATHS.includes(pathname)) {
    if (hasSession) {
      return NextResponse.redirect(new URL('/overview', request.url))
    }
    return NextResponse.next()
  }

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
