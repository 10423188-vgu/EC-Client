export function UserAvatar({
  src,
  name,
  alt,
  className,
  fallbackClassName = className,
}) {
  const initial =
    String(name ?? '')
      .trim()
      .charAt(0)
      .toUpperCase() || 'U'

  if (!src) {
    return <span className={fallbackClassName}>{initial}</span>
  }

  return <img src={src} className={className} alt={alt ?? name ?? ''} />
}
