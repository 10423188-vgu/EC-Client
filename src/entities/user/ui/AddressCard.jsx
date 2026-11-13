import './AddressCard.css'
import { MdLocationPin, MdPhone, MdPerson } from 'react-icons/md'
import { RiMapPin2Fill } from 'react-icons/ri'
import { formatAddress } from '../model/address'
export function AddressCard({ address, label = 'Default address' }) {
  const hasData = address?.fullName || address?.street
  if (!hasData) {
    return (
      <div className="address-card address-card--empty">
        <RiMapPin2Fill className="address-card__empty-icon" />
        <span>No address added yet</span>
      </div>
    )
  }
  const location = formatAddress(address)
  return (
    <div className="address-card">
      <div className="address-card__accent" />

      <div className="address-card__body">
        <div className="address-card__label">
          <RiMapPin2Fill className="address-card__label-icon" />
          <span>{label}</span>
        </div>

        <div className="address-card__row">
          <span className="address-card__chip">
            <MdPerson className="address-card__chip-icon" />
            {address.fullName}
          </span>
          <div className="address-card__separator" />
          <span className="address-card__chip">
            <MdPhone className="address-card__chip-icon" />
            {address.phone}
          </span>
        </div>

        <div className="address-card__location">
          <MdLocationPin className="address-card__pin" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  )
}
