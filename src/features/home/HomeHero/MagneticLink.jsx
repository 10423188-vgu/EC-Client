import { Link } from 'react-router-dom'
import { useMagnetic } from '../../../shared/hooks/useMagnetic'
export default function MagneticLink({
  children,
  moveDuration,
  snapDuration,
  ...props
}) {
  const { ref, onMouseEnter, onMouseMove, onMouseLeave } = useMagnetic({
    moveDuration,
    snapDuration,
  })
  return (
    <Link
      ref={ref}
      {...props}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </Link>
  )
}
