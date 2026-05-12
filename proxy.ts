import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { loginLimit, getClientIp } from '@/lib/ratelimit';

const PROTECTED_PREFIXES = ['/collection', '/dashboard'];

export default auth(async (req) => {
  const path = req.nextUrl.pathname;

  // Rate limit sur la route de callback credentials de NextAuth (= login)
  if (path === '/api/auth/callback/credentials' && req.method === 'POST') {
    const ip = getClientIp(req);
    const { success, reset } = await loginLimit.limit(ip);
    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }
  }

  // Protection des pages
  const isLoggedIn = !!req.auth;
  const isProtected = PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix));

  if (isProtected && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = {
  matcher: [
    // tout sauf assets statiques (on inclut maintenant /api/auth/* pour rate-limit)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};