import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { loginLimit, getClientIp } from '@/lib/ratelimit';

const PROTECTED_PREFIXES = ['/collection', '/dashboard', '/account'];

export default auth(async (req) => {
  const path = req.nextUrl.pathname;

  // Rate limit sur la route de callback credentials de NextAuth (= login)
  if (path === '/api/auth/callback/credentials' && req.method === 'POST') {
    const ip = getClientIp(req);
    const { success, reset } = await loginLimit.limit(ip);
    if (!success) {
      const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
      // next-auth's client signIn() reads `url` and its error/code params.
      const url = new URL('/login', req.url);
      url.searchParams.set('error', 'CredentialsSignin');
      url.searchParams.set('code', 'rate_limited');
      return NextResponse.json(
        { error: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.', url: url.toString() },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }
  }

  // Protection des pages
  const isLoggedIn = !!req.auth;
  const isProtected = PROTECTED_PREFIXES.some(prefix => path.startsWith(prefix));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', path + req.nextUrl.search);
    return Response.redirect(loginUrl);
  }
});

export const config = {
  matcher: [
    // Tout sauf les assets statiques (on inclut /api/auth/* pour le rate-limit).
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|webp|svg|ico|json)$).*)',
  ],
};
