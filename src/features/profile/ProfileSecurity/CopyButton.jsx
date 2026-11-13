import { useEffect, useRef, useState } from 'react'
import { RiCheckLine, RiFileCopyLine } from 'react-icons/ri'
import './CopyButton.css'

export function CopyButton({
  children,
  className = '',
  disabled = false,
  onClick,
}) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef(null)

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const handleClick = async () => {
    clearTimeout(resetTimer.current)
    setCopied(false)
    const succeeded = await onClick()
    if (succeeded === false) return

    setCopied(true)
    resetTimer.current = setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      className={`copy-button${className ? ` ${className}` : ''}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={copied ? 'Copied!' : children}
    >
      {copied ? (
        <RiCheckLine className="copy-button__icon" aria-hidden="true" />
      ) : (
        <RiFileCopyLine className="copy-button__icon" aria-hidden="true" />
      )}
    </button>
  )
}
