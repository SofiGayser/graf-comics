// app/api/auth/[...nextauth]/options.ts
import prisma from '@/services/prisma';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import type { DefaultSession, DefaultUser, NextAuthOptions } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import VkProvider from 'next-auth/providers/vk';
import YandexProvider from 'next-auth/providers/yandex';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: DefaultSession['user'] & {
      role: Role;
      id: string;
    };
  }
  interface User extends DefaultUser {
    role: Role;
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    role: Role;
    id: string;
  }
}

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    VkProvider({
      clientId: process.env.VK_CLIENT_ID!,
      clientSecret: process.env.VK_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    YandexProvider({
      clientId: process.env.YANDEX_CLIENT_ID!,
      clientSecret: process.env.YANDEX_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        login: { label: 'Login', type: 'text' },
        password: { label: 'Password', type: 'password' },
        authKey: { label: 'Auth Key', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password || !credentials?.authKey) {
          throw new Error('Missing credentials');
        }

        const { login, password, authKey } = credentials;

        // Validate authKey
        if (authKey !== 'email' && authKey !== 'name') {
          throw new Error('Invalid auth key');
        }

        const user = await prisma.user.findFirst({
          where: { [authKey]: login },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordMatched = await bcrypt.compare(password, user.password);

        if (!isPasswordMatched) {
          throw new Error('Invalid password');
        }

        if (!user.emailVerified) {
          throw new Error('Email not verified');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        // Handle session update
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.email) token.email = session.user.email;
      }

      if (user) {
        token.role = user.role;
        token.id = user.id;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
