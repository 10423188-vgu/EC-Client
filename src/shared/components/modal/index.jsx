import { FaTimes } from 'react-icons/fa'
import './Modal.css'
export function Modal({
  title,
  bodyClassName,
  panelClassName,
  footer,
  onClose,
  maxWidth,
  children,
}) {
  return (
    <div
      className="modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* why: data-lenis-prevent stops the global Lenis smooth-scroll instance from
          hijacking wheel/touch events meant for this box's own internal scroll */}
      <div
        className={`modal__box${panelClassName ? ` ${panelClassName}` : ''}`}
        style={
          maxWidth
            ? {
                maxWidth,
              }
            : undefined
        }
        data-lenis-prevent
      >
        {title && (
          <header className="modal__header">
            <span className="modal__title">{title}</span>
            <button
              type="button"
              className="modal__close"
              onClick={onClose}
              aria-label="Close modal"
            >
              <FaTimes aria-hidden="true" />
            </button>
          </header>
        )}
        <div
          className={`modal__body${bodyClassName ? ` ${bodyClassName}` : ''}`}
        >
          {children}
        </div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </div>
    </div>
  )
}
