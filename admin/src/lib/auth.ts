import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { loginMockApi } from '@/lib/api/auth.api'
import type { AdminRole, Permission } from '@/lib/types'

declare module 'next-auth' {
  interface User {
    role: AdminRole
    permissions: Permission[]
  }
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: AdminRole
      permissions: Permission[]
    }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    role: AdminRole
    permissions: Permission[]
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        emailOrPhone: { label: 'Email or Phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const emailOrPhone = credentials?.emailOrPhone as string | undefined
        const password = credentials?.password as string | undefined
        if (!emailOrPhone || !password) return null
        const user = await loginMockApi(emailOrPhone, password)
        if (!user) return null
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as AdminRole
        session.user.permissions = token.permissions as Permission[]
      }
      return session
    },
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? 'cropvibe-admin-dev-secret-change-me',
})
