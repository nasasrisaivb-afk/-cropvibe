import { useEffect, useState } from 'react'

/** Tracks main scroll to collapse large titles into the sticky header */
export function useScrollCollapse(threshold = 48) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return

    const onScroll = () => {
      setCollapsed(main.scrollTop > threshold)
    }
    onScroll()
    main.addEventListener('scroll', onScroll, { passive: true })
    return () => main.removeEventListener('scroll', onScroll)
  }, [threshold])

  return collapsed
}
