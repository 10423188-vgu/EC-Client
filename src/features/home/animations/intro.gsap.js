import gsap from 'gsap'
import { useEffect, useLayoutEffect, useState } from 'react'

const INACTIVE_SCALE = 0.8

export default function useIntroGsap({
  wrapperRef,
  cardsRef,
  trackRef,
  listRef,
  ready,
  scrollToCardRef,
  categoriesKey = '',
}) {
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // why: useLayoutEffect runs before paint — prevents flash of unpositioned cards
  useLayoutEffect(() => {
    if (!wrapperRef.current || !cardsRef.current || !trackRef.current || !ready)
      return
    const videos = Array.from(trackRef.current.querySelectorAll('video'))
    if (reducedMotion) {
      videos.forEach((video) => video.pause())
      return
    }

    let categoryVideos = []
    const ctx = gsap.context(() => {
      // ─── Entrance Choreography ──────────────────────────────────────────────────
      // why: card column animated as ONE unit — a per-card entrance would fight the deal/pulse
      //      tweens below that own each card's x/scale/opacity during the pinned scroll
      const qList = gsap.utils.selector(listRef)
      // why: queried once and reused below by both the entrance stagger and updateActive
      //      (which fires on every scroll frame) instead of querying the DOM twice for the same nodes
      const listEls = listRef?.current
        ? Array.from(
            listRef.current.querySelectorAll('.home-intro__accordion-item'),
          )
        : []
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
        defaults: { ease: 'power3.out' },
      })
      // why: single knob for the whole entrance speed — <1 slows down, >1 speeds up
      entranceTl.timeScale(0.5)
      entranceTl
        .from(
          cardsRef.current,
          {
            scale: 0.92,
            autoAlpha: 0,
            filter: 'blur(24px)',
            duration: 1.1,
            onStart: () =>
              gsap.set(cardsRef.current, {
                willChange: 'transform, opacity, filter',
              }),
            onComplete: () =>
              gsap.set(cardsRef.current, { clearProps: 'willChange' }),
          },
          0,
        )
        .from(
          cardsRef.current,
          { xPercent: -6, duration: 1.1, ease: 'power2.out' },
          0.15,
        )
        .from(
          qList('.home-intro__title'),
          { y: 30, autoAlpha: 0, duration: 0.7 },
          0.35,
        )
        .from(
          listEls,
          { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.6 },
          0.5,
        )
        .from(
          qList('.home-intro__logo'),
          { y: 16, autoAlpha: 0, duration: 0.7 },
          0.8,
        )

      const cards = Array.from(
        trackRef.current.querySelectorAll('.home-intro__card'),
      )
      if (cards.length === 0) return

      const GAP = 20
      // why: both are functions so measurements always reflect current layout after resize
      const cardW = () => cards[0].offsetWidth
      // why: scroll is confined to the LEFT column now — distance/centering reference its width, not the viewport
      const colW = () => cardsRef.current?.clientWidth || window.innerWidth
      const dist = () => trackRef.current.scrollWidth - colW()
      const n = cards.length

      // ─── Initial Card Positions (deal) ──────────────────────────────────────────
      gsap.set(cards[0], { zIndex: n + 1 })
      if (cards[1]) {
        gsap.set(cards[1], {
          x: -(cardW() + GAP), // why: positions card 1 exactly one card-width behind card 0, matching track layout
          rotation: -3, // why: slight rotation + scale creates a stacked-deck illusion
          scale: 0.95,
          zIndex: n,
        })
      }
      cards.forEach((card, i) => {
        if (i < 2) return
        gsap.set(card, { opacity: 0, scale: INACTIVE_SCALE, zIndex: n - i })
      })

      // ─── Video Playback Window ───────────────────────────────────────────────────
      // why: only active and adjacent category videos play, avoiding offscreen decoding.
      categoryVideos = cards.map((card) => card.querySelector('video'))
      const setVideoPlaying = (i, playing) => {
        const v = categoryVideos[i]
        if (!v) return
        if (playing) v.play().catch(() => {})
        else v.pause()
      }
      cards.forEach((_, i) => setVideoPlaying(i, i < 2)) // why: matches the initial deal window (cards 0/1 dealt face-up above)

      let prevActive = 0
      const syncVideoWindow = (active) => {
        if (active === prevActive) return
        for (let i = 0; i < n; i++)
          setVideoPlaying(i, Math.abs(i - active) <= 1)
        prevActive = active
      }

      // ─── Timeline Phase Sizing ──────────────────────────────────────────────────
      const DEAL_DUR = 0.6
      const phase2Dur = DEAL_DUR * 5 // why: 5:1 ratio gives enough scrub room for the cards without feeling rushed
      const P1 = DEAL_DUR / (DEAL_DUR + phase2Dur)
      const P2 = 1 - P1

      // ─── Snap Positions ─────────────────────────────────────────────────────────
      let snapPositions = []
      const buildSnapPositions = () => {
        const tDist = trackRef.current.scrollWidth - colW()
        const w = cardW()
        snapPositions = Array.from(
          { length: n },
          (_, i) => P1 + ((i * (w + GAP)) / tDist) * P2,
        )
      }
      buildSnapPositions()

      // ─── Accordion Sync ─────────────────────────────────────────────────────────
      // why: the centred card's category expands on the right — one active item at a time
      const updateActive = (self) => {
        if (!listEls.length) return
        let active = 0
        if (self.progress > P1) {
          active = Math.min(Math.floor(((self.progress - P1) / P2) * n), n - 1)
        }
        listEls.forEach((el) => {
          el.classList.toggle(
            'home-intro__accordion-item--active',
            Number(el.dataset.index) === active,
          )
        })
        syncVideoWindow(active)
      }

      // ─── ScrollTo (accordion click → jump to card) ──────────────────────────────
      // why: st is assigned in onRefresh, not onCreate — always reflects post-layout ST bounds
      let st = null
      if (scrollToCardRef) {
        scrollToCardRef.current = (cardIndex) => {
          if (!st || cardIndex >= snapPositions.length) return
          gsap.to(window, {
            scrollTo: {
              y: st.start + snapPositions[cardIndex] * (st.end - st.start),
            },
            duration: 0.9,
            ease: 'power2.inOut',
          })
        }
      }

      // ─── Scale Pulse + Opacity Window ───────────────────────────────────────────
      let masterTl
      let pulseTweens = []

      const buildPulseTweens = () => {
        pulseTweens.forEach((t) => t.kill())
        pulseTweens = []
        const d = dist()
        const w = cardW()
        // why: when a single card fills the column dist()=0, which would produce Infinity durations
        if (d <= 0 || n < 2) return
        const perCard = ((w + GAP) / d) * phase2Dur
        const half = perCard * 0.5
        const at = (k) => DEAL_DUR + ((k * (w + GAP)) / d) * phase2Dur

        const add = (tween, pos) => {
          masterTl.add(tween, pos)
          pulseTweens.push(tween)
        }

        add(
          gsap.to(cards[0], {
            scale: INACTIVE_SCALE,
            ease: 'expo.inOut',
            duration: half,
          }),
          at(0) + half,
        )
        for (let i = 1; i < n - 1; i++) {
          add(
            gsap.to(cards[i], { scale: 1, ease: 'expo.out', duration: half }),
            at(i) - half,
          )
          add(
            gsap.to(cards[i], {
              scale: INACTIVE_SCALE,
              ease: 'expo.inOut',
              duration: half,
            }),
            at(i) + half,
          )
        }
        add(
          gsap.to(cards[n - 1], { scale: 1, ease: 'expo.out', duration: half }),
          at(n - 1) - half,
        )

        // NOTE: only active card ± 1 are visible; cards outside that window fade via opacity
        for (let i = 2; i < n; i++) {
          add(gsap.set(cards[i], { opacity: 0 }), DEAL_DUR)
        }
        for (let i = 2; i < n; i++) {
          add(
            gsap.to(cards[i], {
              opacity: 1,
              ease: 'power2.out',
              duration: half,
            }),
            at(i - 1) - half,
          )
        }
        for (let i = 0; i < n - 2; i++) {
          add(
            gsap.to(cards[i], {
              opacity: 0,
              ease: 'power2.in',
              duration: half,
            }),
            at(i + 2) - half,
          )
        }
      }

      // ─── Master Timeline ────────────────────────────────────────────────────────
      // why: anticipatePin: 1 prevents the visual jump when GSAP switches element from relative to fixed positioning
      masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: () => `+=${dist() * (5 / 4)}`,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: updateActive,
          onRefresh: (self) => {
            st = self
            buildSnapPositions()
            buildPulseTweens() // why: recomputes keyframe positions with fresh dist() after resize
          },
          snap: {
            // why: skips snap entirely during Phase 1 range; only snaps to named card positions in Phase 2
            snapTo: (value) => {
              if (value < P1) return value
              return snapPositions.reduce((prev, curr) =>
                Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev,
              )
            },
            duration: { min: 0.3, max: 0.7 },
            delay: 0.08,
            ease: 'power2.inOut',
          },
        },
      })

      // ─── Phase 1: Deal ──────────────────────────────────────────────────────────
      if (cards[1]) {
        masterTl.to(
          cards[1],
          {
            x: 0,
            rotation: 0,
            scale: INACTIVE_SCALE,
            ease: 'power3.out',
            duration: DEAL_DUR,
          },
          0,
        )
      }

      // ─── Phase 2: Horizontal Scroll ─────────────────────────────────────────────
      // why: will-change toggles on around this tween instead of sitting in CSS permanently —
      // the track never moves again once the user scrolls past this pinned section
      masterTl.to(
        trackRef.current,
        {
          x: () => -dist(),
          ease: 'none',
          duration: phase2Dur,
          onStart: () =>
            gsap.set(trackRef.current, { willChange: 'transform' }),
          onComplete: () =>
            gsap.set(trackRef.current, { clearProps: 'willChange' }),
          onReverseComplete: () =>
            gsap.set(trackRef.current, { clearProps: 'willChange' }),
        },
        DEAL_DUR,
      )

      buildPulseTweens()
    })

    // why: ctx.revert() removes all pinned ScrollTriggers on unmount; critical for React strict mode and hot reload
    return () => {
      ctx.revert()
      categoryVideos.forEach((video) => video?.pause())
    }
  }, [
    ready,
    wrapperRef,
    cardsRef,
    trackRef,
    listRef,
    scrollToCardRef,
    categoriesKey,
    reducedMotion,
  ])
}
