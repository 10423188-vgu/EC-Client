import './Footer.css'
import { Tooltip } from '../../shared/components'
import { memo } from 'react'
import { Link } from 'react-router-dom'
const FOOTER_LINKS = [
  {
    heading: 'Customers',
    items: [
      {
        label: 'Buyer',
        to: '/',
      },
      {
        label: 'Supplier',
        to: '/',
      },
    ],
  },
  {
    heading: 'Company',
    items: [
      {
        label: 'About',
        to: '/about',
      },
      {
        label: 'Contact',
        to: '/contact',
      },
    ],
  },
  {
    heading: 'Support',
    items: [
      {
        label: 'Help Center',
        to: '/',
      },
      {
        label: 'Terms of Service',
        to: '/',
      },
    ],
  },
]
const CURRENT_YEAR = new Date().getFullYear()
const SOCIAL_LINKS = [
  {
    label: 'Facebook',
    symbol: 'F',
    key: 'facebook',
    to: '/',
  },
  {
    label: 'Instagram',
    symbol: 'I',
    key: 'instagram',
    to: '/',
  },
  {
    label: 'X',
    symbol: 'X',
    key: 'x',
    to: '/',
  },
  {
    label: 'Steam',
    symbol: 'S',
    key: 'steam',
    to: '/',
  },
]
function Footer() {
  return (
    <footer className="footer">
      <div className="footer__layout">
        <div className="footer__cta">
          <div className="footer__cta-content">
            <div>
              <h3 className="footer__cta-title">Ready to get started?</h3>
              <p className="footer__cta-lead">Let's get started!</p>
            </div>
            <Link to="/products" className="footer__cta-button">
              Get Started
            </Link>
          </div>
        </div>

        <div className="footer__inner">
          <div className="footer__column">
            <h4 className="footer__brand-name">Lorem</h4>
            <span className="footer__copyright">© {CURRENT_YEAR}</span>
          </div>

          {FOOTER_LINKS.map(({ heading, items }) => (
            <div key={heading} className="footer__column">
              <h5 className="footer__title">{heading}</h5>
              {items.map(({ label, to }) => (
                <Link key={label} to={to} className="footer__link">
                  {label}
                </Link>
              ))}
            </div>
          ))}

          <div className="footer__column">
            <h5 className="footer__title">Follow us</h5>
            <div className="footer__socials">
              {SOCIAL_LINKS.map(({ label, symbol, key, to }) => (
                <Tooltip
                  key={key}
                  content={label}
                  wrapperClassName="footer__social-wrapper"
                  tooltipClassName="footer__tooltip"
                  dataSocial={key}
                >
                  <Link
                    to={to}
                    className="footer__social"
                    data-social={key}
                    aria-label={label}
                  >
                    <span className="footer__social-icon">{symbol}</span>
                    <span className="footer__social-fill" />
                  </Link>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default memo(Footer)
