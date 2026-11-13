import { IoTrashOutline } from 'react-icons/io5'
import './DeleteButton.css'
export function DeleteButton({ onClick, label = 'Delete' }) {
  return (
    <button type="button" className="delete-button" onClick={onClick}>
      <span className="delete-button__text">{label}</span>
      <span className="delete-button__icon">
        <IoTrashOutline className="delete-button__svg" aria-hidden="true" />
      </span>
    </button>
  )
}
