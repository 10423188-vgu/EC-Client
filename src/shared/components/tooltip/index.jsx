import { createElement } from 'react'
import './Tooltip.css'

export function TooltipContent({
  as: Element = 'span',
  children,
  className = '',
  ...props
}) {
  return createElement(
    Element,
    { className: `tooltip__surface ${className}`.trim(), ...props },
    children,
  )
}

export function Tooltip({
  children,
  content,
  mode = 'trigger',
  active = true,
  title,
  rows = [],
  contentRole,
  placement = 'top',
  wrapperClassName = '',
  tooltipClassName = '',
  contentClassName = '',
  dataSocial,
}) {
  if (mode === 'content') {
    if (!active) return null

    return (
      <TooltipContent
        as="div"
        className={`tooltip__surface--animated ${contentClassName}`.trim()}
        role={contentRole}
      >
        {title && <strong className="tooltip__title">{title}</strong>}
        {rows.length ? (
          <ul className="tooltip__rows">
            {rows.map((row, index) => (
              <li key={row.key ?? row.label ?? index} className="tooltip__row">
                <i
                  className="tooltip__marker"
                  style={{
                    background: row.color ?? 'var(--color-primary-hover)',
                  }}
                  aria-hidden="true"
                />
                <span>{row.label}</span>
                <b>{row.value}</b>
              </li>
            ))}
          </ul>
        ) : (
          children
        )}
      </TooltipContent>
    )
  }

  return (
    <span className={`tooltip__wrapper ${wrapperClassName}`.trim()}>
      {children}
      <TooltipContent
        as="span"
        className={`tooltip__bubble tooltip__bubble--${placement} ${tooltipClassName}`.trim()}
        data-social={dataSocial}
        aria-hidden="true"
      >
        {content}
      </TooltipContent>
    </span>
  )
}
