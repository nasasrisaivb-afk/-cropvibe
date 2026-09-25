import { listings } from '@/lib/data/seeds'
import View from './view'

/** Pre-render seeded records so detail pages also work in the static (GitHub Pages) demo. */
export function generateStaticParams() {
  return listings.map((l) => ({ listingId: l.id }))
}

export default function Page() {
  return <View />
}
