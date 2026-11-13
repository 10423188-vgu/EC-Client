import '../../styles/spinner.css'
import './PanelButton.css'
export function PanelButton({
  variant = 'save',
  label,
  loadingLabel,
  loading = false,
  icon: Icon,
  onClick,
  disabled,
  type = 'button',
  form,
  className,
  title,
}) {
  return (
    <button
      type={type}
      form={form}
      className={`panel-button panel-button--${variant}${Icon ? ' panel-button--icon' : ''}${className ? ` ${className}` : ''}`}
      title={title}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && <span className="spinner" />}
      {Icon && !loading && (
        <span className="panel-button__icon-wrapper">
          <Icon className="panel-button__icon" />
        </span>
      )}
      <span className="panel-button__text">
        {loading ? (loadingLabel ?? label) : label}
      </span>
    </button>
  )
}
