import { auth } from '@/auth';

const PROTECTED_PREFIXES = ['/collection', '/dashboard'];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix));

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};