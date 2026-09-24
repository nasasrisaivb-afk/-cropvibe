'use client'

import { useEffect, useState } from 'react'

/** True after hydration — gate clock- and locale-dependent text behind it to avoid SSR mismatches. */
export function useMounted() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted
}
