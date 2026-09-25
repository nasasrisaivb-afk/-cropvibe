import { contentItems } from '@/lib/data/seeds'
import View from './view'

/** Pre-render seeded records so detail pages also work in the static (GitHub Pages) demo. */
export function generateStaticParams() {
  return [...contentItems.map((c) => ({ contentId: c.id })), { contentId: 'new' }]
}

export default function Page() {
  return <View />
}
