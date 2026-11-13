import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { lenis } from '../lib/scrollRuntime'

const scrollPositions = new Map()

// why: lenis owns the real scroll animation (see shared/lib/lenis.js) — jumping via
// raw window.scrollTo would desync its internal state, so restoring/resetting must
// go through lenis.scrollTo instead.
export function useScrollRestoration() {
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    history.scrollRestoration = 'manual'
  }, [])

  useEffect(() => {
    const onScroll = ({ scroll }) => scrollPositions.set(location.key, scroll)
    lenis.on('scroll', onScroll)
    return () => lenis.off('scroll', onScroll)
  }, [location.key])

  useEffect(() => {
    if (navigationType === 'POP' && scrollPositions.has(location.key)) {
      lenis.scrollTo(scrollPositions.get(location.key), { immediate: true })
      return
    }

    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1))
      if (target) {
        lenis.scrollTo(target, { immediate: true })
        return
      }
    }

    lenis.scrollTo(0, { immediate: true })
  }, [location.key, location.hash, navigationType])
}
