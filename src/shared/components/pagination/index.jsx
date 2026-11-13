import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import './Pagination.css'

const getPageItems = (page, totalPages) => {
  if (totalPages <= 4) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  if (page <= 2) {
    return [1, 2, 'end-ellipsis', totalPages - 1, totalPages]
  }
  if (page >= totalPages - 1) {
    return [1, 'start-ellipsis', totalPages - 1, totalPages]
  }
  return [1, 'start-ellipsis', page, 'end-ellipsis', totalPages]
}

export function Pagination({ page, totalPages, onPageChange, className = '' }) {
  if (totalPages <= 1) return null

  const pageItems = getPageItems(page, totalPages)

  return (
    <nav
      className={`pagination${className ? ` ${className}` : ''}`}
      aria-label="Pagination"
    >
      <button
        type="button"
        className="pagination__button pagination__button--arrow"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <FaChevronLeft aria-hidden="true" />
      </button>
      {pageItems.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            className={`pagination__button${page === item ? ' pagination__button--active' : ''}`}
            onClick={() => onPageChange(item)}
            aria-current={page === item ? 'page' : undefined}
            aria-label={`Page ${item}`}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="pagination__ellipsis" aria-hidden="true">
            …
          </span>
        ),
      )}
      <button
        type="button"
        className="pagination__button pagination__button--arrow"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </nav>
  )
}
