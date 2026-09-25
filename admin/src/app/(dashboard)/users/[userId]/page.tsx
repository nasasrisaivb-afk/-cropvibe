import { users } from '@/lib/data/seeds'
import View from './view'

/** Pre-render seeded records so detail pages also work in the static (GitHub Pages) demo. */
export function generateStaticParams() {
  return users.map((u) => ({ userId: u.id }))
}

export default function Page() {
  return <View />
}
