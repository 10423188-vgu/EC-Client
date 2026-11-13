import './ProductBreadcrumb.css'
import { Link } from 'react-router-dom'
import { FaChevronRight } from 'react-icons/fa'
export default function ProductBreadcrumb({ items = [] }) {
  return (
    <nav className="product-breadcrumb" aria-label="breadcrumb">
      <ol className="product-breadcrumb__list">
        {items.map((item, i) => (
          <li
            key={item.href ?? item.label}
            className="product-breadcrumb__item"
          >
            {i > 0 && (
              <FaChevronRight
                className="product-breadcrumb__separator"
                aria-hidden="true"
              />
            )}
            {item.href ? (
              <Link to={item.href} className="product-breadcrumb__link">
                {item.label}
              </Link>
            ) : (
              <span className="product-breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
