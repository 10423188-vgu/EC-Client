import './StepIndicator.css'
import { FaCheck } from 'react-icons/fa'
export function StepIndicator({ steps, activeIndex }) {
  return (
    <ol className="step-indicator">
      {steps.map((label, i) => {
        const status =
          i < activeIndex ? 'done' : i === activeIndex ? 'active' : 'upcoming'
        return (
          <li
            key={label}
            className={`step-indicator__step step-indicator__step--${status}`}
          >
            <span className="step-indicator__dot">
              {status === 'done' ? <FaCheck size={9} /> : i + 1}
            </span>
            <span className="step-indicator__label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
