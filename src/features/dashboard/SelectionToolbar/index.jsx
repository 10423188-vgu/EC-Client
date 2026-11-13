import { useEffect, useId, useRef, useState } from 'react'
import { FaChevronDown, FaTimes } from 'react-icons/fa'
import './SelectionToolbar.css'

export default function SelectionToolbar({
  count,
  onClear,
  clearDisabled = false,
  clearLabel = 'Clear selection',
  ariaLabel = 'Selected item actions',
  moreLabel = 'More actions',
  actions,
  menuActions = [],
}) {
  const [open, setOpen] = useState(false)
  const moreRef = useRef(null)
  const toggleRef = useRef(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    const closeOutside = (event) => {
      if (!moreRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])

  if (!count) return null
  return (
    <section className="selection-toolbar" aria-label={ariaLabel}>
      <button
        type="button"
        className="selection-toolbar__clear"
        onClick={onClear}
        disabled={clearDisabled}
        aria-label={clearLabel}
      >
        <FaTimes aria-hidden="true" />
      </button>
      <span className="selection-toolbar__count">Selected: {count}</span>
      {actions.map(({ id, label, icon: Icon, onClick, disabled }) => (
        <button
          key={id}
          type="button"
          className="selection-toolbar__action"
          onClick={onClick}
          disabled={disabled}
        >
          {Icon && <Icon aria-hidden="true" />}
          {label}
        </button>
      ))}
      {!!menuActions.length && (
        <div
          ref={moreRef}
          className="selection-toolbar__more"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setOpen(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && open) {
              event.stopPropagation()
              setOpen(false)
              toggleRef.current?.focus()
            }
          }}
        >
          <button
            ref={toggleRef}
            type="button"
            className="selection-toolbar__action selection-toolbar__toggle"
            onClick={() => setOpen((current) => !current)}
            aria-label={moreLabel}
            aria-expanded={open}
            aria-controls={menuId}
          >
            More <FaChevronDown aria-hidden="true" />
          </button>
          <div
            id={menuId}
            className={`selection-toolbar__menu${open ? ' selection-toolbar__menu--open' : ''}`}
            aria-hidden={!open}
          >
            {menuActions.map(({ id, label, onClick, disabled }) => (
              <button
                key={id}
                type="button"
                className="selection-toolbar__menu-action"
                onClick={() => {
                  setOpen(false)
                  toggleRef.current?.focus()
                  onClick()
                }}
                disabled={disabled}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
