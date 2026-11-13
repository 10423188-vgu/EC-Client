import { useEffect, useRef, useState } from 'react'
import { FaSearch } from 'react-icons/fa'
import './SearchField.css'

const SEARCH_DELAY_MS = 350

export function SearchField({
  ariaLabel,
  className = '',
  name,
  onSearch,
  placeholder,
  resetKey = 0,
  type = 'text',
  value = '',
}) {
  const [searchValue, setSearchValue] = useState(value)
  const [previousValue, setPreviousValue] = useState(value)
  const [previousResetKey, setPreviousResetKey] = useState(resetKey)
  const searchTimerRef = useRef(null)
  const onSearchRef = useRef(onSearch)

  // Sync URL changes and cleared filters without remounting the input.
  if (previousValue !== value || previousResetKey !== resetKey) {
    setPreviousValue(value)
    setPreviousResetKey(resetKey)
    setSearchValue(value)
  }

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => () => clearTimeout(searchTimerRef.current), [value, resetKey])

  const handleChange = (event) => {
    const nextValue = event.target.value
    setSearchValue(nextValue)
    clearTimeout(searchTimerRef.current)
    searchTimerRef.current = setTimeout(
      () => onSearchRef.current(nextValue.trim()),
      SEARCH_DELAY_MS,
    )
  }

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return
    event.preventDefault()
    clearTimeout(searchTimerRef.current)
    onSearch(searchValue.trim())
  }

  return (
    <div className={`search-field${className ? ` ${className}` : ''}`}>
      <input
        type={type}
        name={name}
        value={searchValue}
        placeholder={placeholder}
        className="search-field__input"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
      />
      <span className="search-field__icon" aria-hidden="true">
        <FaSearch />
      </span>
    </div>
  )
}
