import { useLayoutEffect, useRef } from 'react'
import './SlidingTabs.css'

export function SlidingTabs({
  tabs,
  value,
  onChange,
  ariaLabel,
  stretch = false,
  className,
}) {
  const trackRef = useRef(null)
  const indicatorRef = useRef(null)
  const initializedRef = useRef(false)
  const tabRefs = useRef(new Map())

  useLayoutEffect(() => {
    const track = trackRef.current
    const activeTab = tabRefs.current.get(value)
    const indicator = indicatorRef.current
    if (!activeTab) {
      indicator.style.width = '0px'
      return
    }
    const updateIndicator = () => {
      indicator.style.transform = `translateX(${activeTab.offsetLeft}px)`
      indicator.style.width = `${activeTab.offsetWidth}px`
    }
    if (!initializedRef.current) {
      indicator.style.transition = 'none'
      updateIndicator()
      // Commit the initial position before enabling transitions for tab changes.
      indicator.getBoundingClientRect()
      indicator.style.removeProperty('transition')
      initializedRef.current = true
    } else {
      updateIndicator()
    }
    const observer = new ResizeObserver(updateIndicator)
    observer.observe(track)
    for (const tab of tabRefs.current.values()) observer.observe(tab)
    return () => observer.disconnect()
  }, [tabs, value])

  return (
    <nav
      ref={trackRef}
      className={`sliding-tabs${stretch ? ' sliding-tabs--stretch' : ''}${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          ref={(element) => {
            if (element) tabRefs.current.set(tab.value, element)
            else tabRefs.current.delete(tab.value)
          }}
          type="button"
          className={`sliding-tabs__tab${value === tab.value ? ' sliding-tabs__tab--active' : ''}`}
          onClick={() => onChange(tab.value)}
          aria-current={value === tab.value ? 'page' : undefined}
        >
          <span>{tab.label}</span>
          {tab.count != null && (
            <span className="sliding-tabs__count">{tab.count}</span>
          )}
        </button>
      ))}
      <span
        ref={indicatorRef}
        className="sliding-tabs__indicator"
        aria-hidden="true"
      />
    </nav>
  )
}
