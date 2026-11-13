import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { FRAME_COUNT } from './useFrameSequence.js'

// ─── Timeline map (fractions of the pinned scroll, 0 → 1) ───────────────────────

const OUT = 0.18 // why: corner text finishes flying out at 18% of the pin
const FRAMES_END = 0.45 // why: frame scrub ends here; the final frame holds after
const REVEAL_AT = 0.3 // why: statement words start revealing here — after OUT so the letter
// never appears while corner text is still fading, avoiding the visual stutter
const REVEAL_SPREAD = 0.62 // NOTE: REVEAL_AT + spread + word dur (0.08) must = 1.0 → last word lands at pin end
const STATEMENT_IN = 0.12 // NOTE: starts exactly at OUT (REVEAL_AT - STATEMENT_IN = 0.18) so the corner
// fade-out and the dark overlay crossfade meet instead of overlapping

export default function useHeroGsap(sectionRef, frameApiRef) {
  // why: state (not a plain const) so flipping the OS "reduce motion" setting while the hero is
  // mounted re-runs the effect below instead of being stuck with whatever it read on first mount
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const gctx = gsap.context(() => {
      const lead = section.querySelector('.home-hero__title--lead')
      const accent = section.querySelector('.home-hero__title--accent')
      const intro = section.querySelector('.home-hero__intro')
      const scroll = section.querySelector('.home-hero__scroll')
      const statement = section.querySelector('.home-hero__statement')
      const stWords = gsap.utils.toArray('.home-hero__statement-word', section)
      // why: elements the OUT dolly animates once then leaves static — will-change toggles
      // around that single tween instead of sitting permanently in CSS (same reasoning as stWords below)
      const revealEls = gsap.utils.toArray('[data-hero-reveal]', section)

      // why: reduced-motion gets no pin/scrub — show final frame statically
      if (reduced) {
        gsap.set(statement, { autoAlpha: 1 })
        gsap.set(stWords, { opacity: 1 })
        frameApiRef.current.draw(FRAME_COUNT - 1)
        return
      }

      // ─── Pinned scroll: frame scrub + text dolly + word reveal (one timeline) ────
      // why: a single ScrollTrigger only — a 2nd ST on the same pinned element double-counts the pin
      const tl = gsap.timeline({
        defaults: { ease: 'none', immediateRender: false },
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=250%', // why: total scroll length — bigger = slower scrub
          pin: true,
          scrub: 1, // why: smoothing lag (s) — 0 feels jittery when frames lag decode
          // why: on a fast/flung scroll, scrub:1 would keep tl.progress() catching up for up to
          // 1s after the user already scrolled past — this snaps it straight to the target instead
          fastScrollEnd: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          refreshPriority: 1, // why: topmost pinned section — must refresh before intro/features
          onRefresh: () => frameApiRef.current.resize(),
          onUpdate: () => {
            // why: use tl.progress() (scrubbed), not self.progress (raw) — self.progress
            // is instant while the text tweens lag behind scrub:1; on fast scroll that
            // desync made the background jump ahead of the still-animating text
            const p = Math.min(tl.progress() / FRAMES_END, 1)
            frameApiRef.current.draw(Math.round(p * (FRAME_COUNT - 1)))
          },
        },
      })

      // why: each block dollies toward its own edge + scales up — the camera-through-window feel
      tl.fromTo(
        lead,
        { x: 0, y: 0, scale: 1, autoAlpha: 1 },
        {
          x: '-32vw',
          y: '-14vh',
          scale: 1.5,
          autoAlpha: 0,
          duration: OUT,
          onStart: () =>
            gsap.set(revealEls, { willChange: 'transform, opacity' }),
          onComplete: () => gsap.set(revealEls, { clearProps: 'willChange' }),
          onReverseComplete: () =>
            gsap.set(revealEls, { clearProps: 'willChange' }),
        },
        0,
      )
        .fromTo(
          accent,
          { x: 0, y: 0, scale: 1, autoAlpha: 1 },
          { x: '34vw', y: '14vh', scale: 1.6, autoAlpha: 0, duration: OUT },
          0,
        )
        .fromTo(
          intro,
          { x: 0, y: 0, autoAlpha: 1 },
          { x: '-18vw', y: '12vh', autoAlpha: 0, duration: OUT },
          0,
        )
        .fromTo(
          scroll,
          { x: 0, y: 0, autoAlpha: 1 },
          { x: '16vw', y: '10vh', autoAlpha: 0, duration: OUT },
          0,
        )
        .to(
          statement,
          {
            autoAlpha: 1,
            duration: STATEMENT_IN,
            onStart: () => gsap.set(statement, { willChange: 'opacity' }),
            onComplete: () => gsap.set(statement, { clearProps: 'willChange' }),
            onReverseComplete: () =>
              gsap.set(statement, { clearProps: 'willChange' }),
          },
          REVEAL_AT - STATEMENT_IN,
        )
        // why: words stay fully invisible then snap straight to opacity 1 — steps(1) holds at the
        // "from" state for the whole duration and jumps on the last tick, no fade in between.
        // DO NOT: add a will-change toggle here — onStart/onComplete fire once PER staggered
        // target (36 words), so each one would batch-set/clear will-change across the whole
        // array; the first word's onStart alone promotes all 36 spans to compositor layers in
        // one tick, exactly while the frame-sequence canvas is still scrubbing (FRAMES_END >
        // REVEAL_AT) — that's what caused the stutter right as the letter starts revealing.
        // steps(1) also never paints more than once per word, so there's no continuous
        // repaint for will-change to accelerate in the first place.
        .fromTo(
          stWords,
          { opacity: 0, scale: 0.6 },
          {
            opacity: 1,
            scale: 1,
            ease: 'steps(1)',
            duration: 0.08,
            stagger: { amount: REVEAL_SPREAD },
          },
          REVEAL_AT,
        )
    }, sectionRef)

    return () => gctx.revert()
  }, [sectionRef, frameApiRef, reduced])
}
