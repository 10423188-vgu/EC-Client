import { useCallback, useState } from 'react'

export function useShake() {
  const [shake, setShake] = useState(false)

  const trigger = useCallback(() => setShake(true), [])
  const onShakeEnd = useCallback(() => setShake(false), [])

  return { shake, trigger, onShakeEnd }
}
