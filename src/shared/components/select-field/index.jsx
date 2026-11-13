import { FaChevronDown } from 'react-icons/fa'
import './SelectField.css'

export function SelectField({
  children,
  className = '',
  wrapperClassName = '',
  ...props
}) {
  return (
    <span
      className={`select-field${wrapperClassName ? ` ${wrapperClassName}` : ''}`}
    >
      <select
        {...props}
        className={`select-field__control${className ? ` ${className}` : ''}`}
      >
        {children}
      </select>
      <FaChevronDown className="select-field__arrow" aria-hidden="true" />
    </span>
  )
}
