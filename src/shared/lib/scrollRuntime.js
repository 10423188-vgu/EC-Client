import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { lenis } from './lenis'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const lenisRaf = (time) => lenis.raf(time * 1000)
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add(lenisRaf)
gsap.ticker.lagSmoothing(0)

// why: hot reload must not leave an extra ticker callback or scroll listener.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    gsap.ticker.remove(lenisRaf)
    lenis.off('scroll', ScrollTrigger.update)
    lenis.destroy()
  })
}

export { lenis }
