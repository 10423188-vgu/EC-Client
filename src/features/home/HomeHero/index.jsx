import './HomeHero.css'
import { useRef } from 'react'
import MagneticLink from './MagneticLink.jsx'
import { useAuthStore } from '../../../entities/user'
import { useFrameSequence } from '../animations/useFrameSequence.js'
import useHeroGsap from '../animations/hero.gsap.js'
const LETTER_BODY =
  "Thank you for choosing Lorem. We're committed to creating products that combine thoughtful design, lasting quality, and everyday value. We hope your experience with us is simple, enjoyable, and worth returning to"
export default function HomeHero() {
  const sectionRef = useRef(null)
  const canvasRef = useRef(null)
  const guestName = useAuthStore((state) => state.user?.name)

  // why: canvas owns which frame + painting; the scroll hook only picks the frame index
  const frameApiRef = useFrameSequence(canvasRef, sectionRef)
  useHeroGsap(sectionRef, frameApiRef)
  return (
    <section ref={sectionRef} className="home-hero">
      <canvas ref={canvasRef} className="home-hero__canvas" />

      {/* why: pointer-events:none so the layer never blocks scroll — only interactive nodes re-enable it */}
      <div className="home-hero__overlay">
        {/* why: max-width frame anchors the corner blocks to 1400px, not raw viewport edges */}
        <div className="home-hero__content">
          <h1
            className="home-hero__title home-hero__title--lead"
            data-hero-reveal
          >
            Elevate
            <br />
            your everyday
          </h1>

          <p
            className="home-hero__title home-hero__title--accent"
            data-hero-reveal
          >
            Discover
            <br />
            distinction
          </p>

          <div className="home-hero__intro" data-hero-reveal>
            <p className="home-hero__tagline">
              Curated premium products for a refined lifestyle.
            </p>
            <span className="home-hero__rule" aria-hidden="true" />
            <p className="home-hero__description">
              Our selection features craftsmanship from around the world, built
              on a foundation of quality, design, and attention to detail. Find
              your new favorites, delivered to you with the same care we give to
              every detail.
            </p>
          </div>

          <div className="home-hero__scroll" data-hero-reveal>
            <div className="home-hero__scroll-top">
              <span className="home-hero__scroll-line" />
              <svg
                viewBox="0 0 24 24"
                className="home-hero__scroll-spark"
                aria-hidden="true"
              >
                <path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" />
              </svg>
            </div>
            <div className="home-hero__scroll-cue">
              <svg
                viewBox="0 0 24 24"
                className="home-hero__scroll-chevrons"
                aria-hidden="true"
              >
                <path d="M6 7l6 6 6-6" />
                <path d="M6 13l6 6 6-6" />
              </svg>
              <span className="home-hero__scroll-text">
                Scroll down to see the collection
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* why: sits over the frozen last frame — a letter pulled from the envelope */}
      <div className="home-hero__statement">
        <div className="home-hero__letter">
          {/* why: every span shares .home-hero__statement-word so hero.gsap's single stagger
              sweeps the whole letter — salutation, body, sign — in one continuous reveal */}
          <p className="home-hero__letter-salutation">
            <span className="home-hero__statement-word">Dear</span>
            <span className="home-hero__statement-word home-hero__letter-name">
              {guestName || 'friend'}
            </span>
            <span className="home-hero__statement-word">,</span>
          </p>
          <p className="home-hero__letter-body">
            {LETTER_BODY.split(' ').map((word, i) => (
              <span key={i} className="home-hero__statement-word">
                {word}
              </span>
            ))}
          </p>
          <p className="home-hero__letter-sign">
            <span className="home-hero__statement-word">
              With gratitude, Lorem
            </span>
          </p>
        </div>
      </div>

      {/* why: CTA sits outside the dolly group + above the scrim → stays put and clickable */}
      <div className="home-hero__action">
        <MagneticLink
          to="/products"
          moveDuration={0.3}
          snapDuration={0.7}
          className="home-hero__action-button"
        >
          <span className="home-hero__roll">
            <span className="home-hero__roll-text">Shop the Collection</span>
            <span
              className="home-hero__roll-text home-hero__roll-text--clone"
              aria-hidden="true"
            >
              Shop the Collection
            </span>
          </span>
        </MagneticLink>
      </div>
    </section>
  )
}
