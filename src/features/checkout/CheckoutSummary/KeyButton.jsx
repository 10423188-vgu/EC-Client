import './KeyButton.css'
export function KeyButton({
  label,
  onClick,
  type = 'button',
  disabled,
  variant,
}) {
  return (
    <button
      type={type}
      className={`key-button${variant ? ` key-button--${variant}` : ''}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="key-button__edge key-button__edge--top-a" />
      <span className="key-button__edge key-button__edge--top-b" />
      <span className="key-button__edge key-button__edge--bottom-a" />
      <span className="key-button__edge key-button__edge--bottom-b" />
      <span className="key-button__text">{label}</span>
    </button>
  )
}
