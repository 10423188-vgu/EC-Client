import './Marquee.css'
import { useRef } from 'react'
import {
  SiNike,
  SiApple,
  SiSamsung,
  SiSony,
  SiAdidas,
  SiDell,
  SiAsus,
  SiLg,
  SiIntel,
  SiAmd,
  SiLogitech,
  SiXiaomi,
} from 'react-icons/si'
import useMarqueeGsap from './animations/marquee.gsap'
const LOGOS = [
  {
    Icon: SiNike,
    name: 'Nike',
  },
  {
    Icon: SiApple,
    name: 'Apple',
  },
  {
    Icon: SiSamsung,
    name: 'Samsung',
  },
  {
    Icon: SiSony,
    name: 'Sony',
  },
  {
    Icon: SiAdidas,
    name: 'Adidas',
  },
  {
    Icon: SiDell,
    name: 'Dell',
  },
  {
    Icon: SiAsus,
    name: 'Asus',
  },
  {
    Icon: SiLg,
    name: 'LG',
  },
  {
    Icon: SiIntel,
    name: 'Intel',
  },
  {
    Icon: SiAmd,
    name: 'AMD',
  },
  {
    Icon: SiLogitech,
    name: 'Logitech',
  },
  {
    Icon: SiXiaomi,
    name: 'Xiaomi',
  },
]

// why: doubled so the xPercent:-50 loop in marquee.gsap wraps seamlessly with no visible seam
const doubled = [...LOGOS, ...LOGOS]
export default function Marquee({ className = '' }) {
  const trackRef = useRef(null)
  useMarqueeGsap(trackRef)
  return (
    <div className={className ? `marquee ${className}` : 'marquee'}>
      <div ref={trackRef} className="marquee__track">
        {doubled.map((logo, i) => (
          <div key={i} className="marquee__item">
            <logo.Icon aria-label={logo.name} />
          </div>
        ))}
      </div>
    </div>
  )
}
