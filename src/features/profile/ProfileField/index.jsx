import './ProfileField.css'
import { SelectField } from '../../../shared/components'
export default function ProfileField({
  label,
  value,
  name,
  isEditing,
  onChange,
  placeholder,
  error,
  options,
}) {
  return (
    <div className="profile-field">
      <label htmlFor={name} className="profile-field__label">
        {label}
      </label>
      {isEditing ? (
        <>
          {options ? (
            <SelectField
              id={name}
              name={name}
              value={value}
              className="profile-field__input"
              onChange={onChange}
            >
              {options.map(([optionValue, optionLabel]) => (
                <option key={optionValue} value={optionValue}>
                  {optionLabel}
                </option>
              ))}
            </SelectField>
          ) : (
            <input
              id={name}
              name={name}
              value={value}
              placeholder={placeholder || label}
              autoComplete="off"
              className={`profile-field__input${error ? ' profile-field__input--error' : ''}`}
              onChange={onChange}
            />
          )}
          {error && <span className="profile-field__error">{error}</span>}
        </>
      ) : (
        <div className="profile-field__display">
          {value ? (
            <span className="profile-field__value">{value}</span>
          ) : (
            <span className="profile-field__placeholder">—</span>
          )}
        </div>
      )}
    </div>
  )
}
