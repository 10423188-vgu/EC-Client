import { useEffect, useRef } from 'react'

// ─── Config ───────────────────────────────────────────────────────────────────

export const FRAME_COUNT = 300
// why: frames are 1-based on disk (ezgif-frame-001…300); pad to 3 digits to match filenames exactly
const FRAME_SRC = (i) =>
  `/images/hero/ezgif-frame-${String(i + 1).padStart(3, '0')}.jpg`
// why: cap DPR at 2 — a 1920×1080 sequence at DPR 3 allocates a ~5760px-wide canvas per redraw with no visible gain
const MAX_DPR = 2
// why: decoded 1920x1080 images are several MB each; retaining all 300 can exhaust memory on
// mobile devices. Keep a sliding window instead and let the browser's HTTP cache handle revisits.
const MAX_CACHED_FRAMES = 48
const PREFETCH_DISTANCE = 12
const MAX_CONCURRENT_LOADS = 6

// ─── Frame Sequence Engine ──────────────────────────────────────────────────────
// why: returns a stable ref exposing { draw(index), resize() } so a scroll driver can
// request frames without knowing anything about the canvas underneath

export function useFrameSequence(canvasRef, sectionRef) {
  const apiRef = useRef({ draw: () => {}, resize: () => {} })

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    if (!section || !canvas) return

    // why: alpha:false — background is opaque, lets the compositor skip per-pixel blending
    const c2d = canvas.getContext('2d', { alpha: false })

    const frames = new Array(FRAME_COUNT)
    const loaded = new Array(FRAME_COUNT).fill(false)
    const loading = new Array(FRAME_COUNT).fill(false)
    const queued = new Array(FRAME_COUNT).fill(false)
    const pendingFrames = []

    // why: split so drawFrame can diff target vs. last-painted and skip redundant repaints
    let currentFrame = -1
    let targetFrame = 0
    let lastRequestedFrame = 0
    let rafId = 0
    let activeLoads = 0
    let disposed = false

    // ─── Cover-fit Paint ──────────────────────────────────────────────────────────
    // why: mimics background-size:cover — fill the canvas, crop overflow, preserve aspect ratio
    const paint = (img) => {
      const cw = canvas.width
      const ch = canvas.height
      const iw = img.naturalWidth
      const ih = img.naturalHeight
      if (!iw || !ih || !cw || !ch) return
      const scale = Math.max(cw / iw, ch / ih)
      const dw = iw * scale
      const dh = ih * scale
      c2d.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
    }

    // why: while the exact target frame is still decoding, show the closest loaded one instead of a blank canvas
    const nearestLoaded = (idx) => {
      for (let i = idx; i >= 0; i--) if (loaded[i]) return i
      for (let i = idx + 1; i < FRAME_COUNT; i++) if (loaded[i]) return i
      return -1
    }

    const drawFrame = (idx, force = false) => {
      if (idx < 0) return
      const use = loaded[idx] ? idx : nearestLoaded(idx)
      if (use < 0) return
      if (!force && use === currentFrame) return
      paint(frames[use])
      currentFrame = use
    }

    // why: coalesce multiple driver calls within a frame into a single drawImage on the next rAF
    const scheduleDraw = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = 0
        drawFrame(targetFrame)
      })
    }

    // ─── Canvas Sizing ────────────────────────────────────────────────────────────
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      const w = Math.round(section.clientWidth * dpr)
      const h = Math.round(section.clientHeight * dpr)
      // why: skip no-op resizes — mobile URL-bar show/hide fires resize at the same size, and each
      //      canvas.width write clears the bitmap + forces a repaint. Also collapses the double call
      //      from window-resize + ScrollTrigger.onRefresh into one real repaint.
      if (w === canvas.width && h === canvas.height) return
      canvas.width = w
      canvas.height = h
      // why: setting width/height clears the canvas — repaint the current frame at the new size
      drawFrame(currentFrame >= 0 ? currentFrame : targetFrame, true)
    }

    // ─── Preload ──────────────────────────────────────────────────────────────────
    const releaseFrame = (i) => {
      const img = frames[i]
      if (!img) return
      img.onload = null
      img.onerror = null
      img.src = ''
      frames[i] = null
      loaded[i] = false
    }

    const evictFrames = () => {
      let cachedCount = loaded.filter(Boolean).length
      while (cachedCount > MAX_CACHED_FRAMES) {
        let furthestFrame = -1
        let furthestDistance = -1
        for (let i = 0; i < FRAME_COUNT; i++) {
          if (!loaded[i] || i === targetFrame) continue
          const distance = Math.abs(i - targetFrame)
          if (distance > furthestDistance) {
            furthestFrame = i
            furthestDistance = distance
          }
        }
        if (furthestFrame < 0) return
        releaseFrame(furthestFrame)
        cachedCount--
      }
    }

    const startLoad = (i) => {
      loading[i] = true
      activeLoads++
      const img = new Image()
      img.decoding = 'async'
      // why: frame 0 is the first thing painted — race it ahead of the other 274 requests
      if (i === 0) img.fetchPriority = 'high'
      img.onload = () => {
        loading[i] = false
        activeLoads--
        if (disposed) return
        loaded[i] = true
        evictFrames()
        // why: paint the first frame the instant it arrives so the hero is never blank — but only
        // if frame 0 is still what's actually wanted (reduced-motion draws the last frame on mount,
        // before any image has loaded, and this used to clobber that request when frame 0 arrived)
        if (i === 0 && currentFrame < 0 && targetFrame === 0) drawFrame(0, true)
        // why: if the frame we're currently waiting on just decoded, upgrade from the fallback to the exact frame
        if (i === targetFrame) drawFrame(targetFrame, true)
        drainLoadQueue()
      }
      img.onerror = () => {
        loading[i] = false
        activeLoads--
        frames[i] = null
        drainLoadQueue()
      }
      frames[i] = img
      img.src = FRAME_SRC(i)
    }

    const drainLoadQueue = () => {
      while (activeLoads < MAX_CONCURRENT_LOADS && pendingFrames.length) {
        const frame = pendingFrames.shift()
        queued[frame] = false
        if (!loaded[frame] && !loading[frame]) startLoad(frame)
      }
    }

    const loadFrame = (i, priority = false) => {
      if (loaded[i] || loading[i] || queued[i]) return
      queued[i] = true
      if (priority) pendingFrames.unshift(i)
      else pendingFrames.push(i)
      drainLoadQueue()
    }

    const preloadNearbyFrames = (frame, direction) => {
      for (let offset = 1; offset <= PREFETCH_DISTANCE; offset++) {
        const ahead = frame + offset * direction
        const behind = frame - offset * direction
        if (ahead >= 0 && ahead < FRAME_COUNT) loadFrame(ahead)
        if (behind >= 0 && behind < FRAME_COUNT) loadFrame(behind)
      }
    }

    loadFrame(0, true)
    preloadNearbyFrames(0, 1)

    // why: the driver only knows "which frame" — clamp + throttle live here, not in the choreography
    apiRef.current = {
      draw: (idx) => {
        targetFrame = Math.min(FRAME_COUNT - 1, Math.max(0, idx))
        const direction = targetFrame >= lastRequestedFrame ? 1 : -1
        lastRequestedFrame = targetFrame
        // why: load the requested frame and likely scroll neighbours, rather than retaining every
        // decoded image after the user reaches frame 300.
        loadFrame(targetFrame, true)
        preloadNearbyFrames(targetFrame, direction)
        scheduleDraw()
      },
      resize,
    }

    resize()
    window.addEventListener('resize', resize, { passive: true })

    return () => {
      disposed = true
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      pendingFrames.length = 0
      // why: drop image refs so the browser can reclaim decoded 1920×1080 bitmaps (300 frames is a lot of memory)
      for (let i = 0; i < FRAME_COUNT; i++) {
        releaseFrame(i)
      }
      apiRef.current = { draw: () => {}, resize: () => {} }
    }
  }, [canvasRef, sectionRef])

  return apiRef
}
