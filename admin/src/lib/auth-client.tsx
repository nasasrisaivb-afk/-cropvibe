'use client'

/**
 * Auth adapter. Normal builds use NextAuth (server session + middleware).
 * The static demo build (NEXT_PUBLIC_STATIC_DEMO=1, deployed to GitHub Pages) has no server,
 * so it keeps a mock session in localStorage and guards routes on the client.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as NextAuth from 'next-auth/react'
import type { Session } from 'next-auth'
import { loginMockApi } from '@/lib/api/auth.api'

export const STATIC_DEMO = process.env.NEXT_PUBLIC_STATIC_DEMO === '1'
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const KEY = 'cv-admin-demo-session'

type Status = 'loading' | 'authenticated' | 'unauthenticated'
type Ctx = { data: Session | null; status: Status; setData: (s: Session | null) => void }

const DemoContext = createContext<Ctx>({ data: null, status: 'loading', setData: () => undefined })

function DemoSessionProvider({ children }: { children: React.ReactNode }) {
  const [data, setDataState] = useState<Session | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY)
      const s = raw ? (JSON.parse(raw) as Session) : null
      setDataState(s)
      setStatus(s ? 'authenticated' : 'unauthenticated')
    } catch {
      setStatus('unauthenticated')
    }
  }, [])

  const setData = useCallback((s: Session | null) => {
    try {
      if (s) window.localStorage.setItem(KEY, JSON.stringify(s))
      else window.localStorage.removeItem(KEY)
    } catch {
      /* storage blocked — session lives for this page only */
    }
    setDataState(s)
    setStatus(s ? 'authenticated' : 'unauthenticated')
  }, [])

  const value = useMemo(() => ({ data, status, setData }), [data, status, setData])
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

let demoSetter: Ctx['setData'] | null = null

function useDemoSession() {
  const ctx = useContext(DemoContext)
  demoSetter = ctx.setData
  return { data: ctx.data, status: ctx.status }
}

async function demoSignIn(
  _provider: string,
  opts: { emailOrPhone: string; password: string; redirect?: boolean }
): Promise<{ error?: string; ok: boolean }> {
  const user = await loginMockApi(opts.emailOrPhone, opts.password)
  if (!user) return { error: 'CredentialsSignin', ok: false }
  demoSetter?.({
    user: { id: user.id, email: user.email, name: user.name, role: user.role, permissions: user.permissions },
    expires: new Date(Date.now() + 7 * 86400000).toISOString(),
  } as Session)
  return { ok: true }
}

async function demoSignOut(opts?: { callbackUrl?: string }) {
  demoSetter?.(null)
  window.location.href = `${BASE}${opts?.callbackUrl ?? '/login'}`
}

export const SessionProvider = (STATIC_DEMO ? DemoSessionProvider : NextAuth.SessionProvider) as (props: {
  children: React.ReactNode
}) => React.ReactElement
export const useSession = (STATIC_DEMO ? useDemoSession : NextAuth.useSession) as () => {
  data: Session | null
  status: Status
}
export const signIn = (STATIC_DEMO ? demoSignIn : NextAuth.signIn) as unknown as typeof demoSignIn
export const signOut = (STATIC_DEMO ? demoSignOut : NextAuth.signOut) as typeof demoSignOut
