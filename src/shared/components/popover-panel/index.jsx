import './PopoverPanel.css'

export function PopoverPanel({
  arrowPlacement = 'top',
  children,
  className = '',
}) {
  return (
    <div
      className={`popover-panel popover-panel--arrow-${arrowPlacement}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  )
}
