import './Checkbox.css'

export function Checkbox({ className, ...inputProps }) {
  return (
    <input
      type="checkbox"
      className={`checkbox${className ? ` ${className}` : ''}`}
      {...inputProps}
    />
  )
}
