/**
 * Builds the static demo (no server): `BASE_PATH=/-cropvibe/admin npm run build:static`.
 * Server-only files (middleware, NextAuth route) can't be exported, so they are moved
 * aside for the build and always restored afterwards. Output: admin/out/
 */
import { execSync } from 'node:child_process'
import { existsSync, renameSync } from 'node:fs'

const aside = [
  ['src/middleware.ts', '.static-aside-middleware.ts'],
  ['src/app/api', '.static-aside-api'],
]

for (const [from, to] of aside) if (existsSync(from)) renameSync(from, to)
try {
  execSync('next build', { stdio: 'inherit', env: { ...process.env, STATIC_DEMO: '1' } })
} finally {
  for (const [from, to] of aside) if (existsSync(to)) renameSync(to, from)
}
