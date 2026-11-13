export function SkeletonBlock({ className = '', style }) {
  return (
    <span
      className={`dashboard-skeleton__block${className ? ` ${className}` : ''}`}
      style={style}
      aria-hidden="true"
    />
  )
}

export function SkeletonLines({ count = 1, className = '' }) {
  return (
    <div
      className={`dashboard-skeleton__lines${className ? ` ${className}` : ''}`}
    >
      {Array.from({ length: count }, (_, index) => (
        <SkeletonBlock className="dashboard-skeleton__line" key={index} />
      ))}
    </div>
  )
}
