import { CredentialsSignin, type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { loginSchema } from '@/lib/validation/auth';

class EmailNotVerified extends CredentialsSignin {
  code = 'email_not_verified';
}

// Compared against when the email is unknown, so that a missing account and a
// wrong password take the same time (no account enumeration by timing).
const DUMMY_HASH = '$2b$10$7lbtXPoPAnB0tXLrBOOQ3uvdxyXfL.hqsNXdcDwCmz1mjzRxMETvG';

// How often a session is re-validated against the database (deleted account,
// password changed elsewhere, renamed).
const SESSION_RECHECK_MS = 5 * 60 * 1000;

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const { prisma } = await import('@/lib/prisma');
        const bcrypt = await import('bcryptjs');
        const { isEmailEnabled } = await import('@/lib/email');

        const user = await prisma.user.findUnique({ where: { email } });
        const passwordMatch = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
        if (!user || !passwordMatch) return null;

        if (!user.emailVerified && isEmailEnabled()) {
          throw new EmailNotVerified();
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnCollection = nextUrl.pathname.startsWith('/collection');

      if (isOnCollection) {
        if (isLoggedIn) return true;
        return false;
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.sessionVersion = user.sessionVersion ?? 0;
        token.checkedAt = Date.now();
        return token;
      }

      if (!token.id) return token;
      const due = trigger === 'update' || Date.now() - (token.checkedAt ?? 0) > SESSION_RECHECK_MS;
      if (!due) return token;

      try {
        const { prisma } = await import('@/lib/prisma');
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { name: true, email: true, sessionVersion: true },
        });
        // Returning null clears the session cookie.
        if (!dbUser || dbUser.sessionVersion !== (token.sessionVersion ?? 0)) return null;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.checkedAt = Date.now();
      } catch (error) {
        // A database hiccup must not log everybody out: try again next request.
        console.error('Session re-validation failed:', error);
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
