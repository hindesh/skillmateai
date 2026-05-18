import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const publicPaths = ['/', '/auth', '/teachers']
  const token = request.cookies.get('skillmate_token')?.value

  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  if (token && pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
