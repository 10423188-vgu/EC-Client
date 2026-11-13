import './CheckoutAddressSection.css'
import { useState } from 'react'
import { FaPlus, FaExchangeAlt } from 'react-icons/fa'
import CheckoutSection from '../CheckoutSection'
import CheckoutAddressForm from '../CheckoutAddressForm'
import { AddressCard, formatAddress } from '../../../entities/user'
import { PanelButton } from '../../../shared/components'
export default function CheckoutAddressSection({
  addresses,
  register,
  error,
  selectedAddressId,
  onAddressCreated,
}) {
  const hasAddresses = Boolean(addresses?.length)
  const hasMultipleAddresses = (addresses?.length ?? 0) > 1
  const [mode, setMode] = useState(hasAddresses ? 'compact' : 'add')
  const selected =
    addresses?.find((a) => a.id === selectedAddressId) ?? addresses?.[0]
  return (
    <CheckoutSection title="Shipping Address" error={error}>
      {mode === 'add' && (
        <CheckoutAddressForm
          onCancel={hasAddresses ? () => setMode('compact') : undefined}
          onSaved={(id) => {
            onAddressCreated(id)
            setMode('compact')
          }}
        />
      )}

      {mode === 'list' && (
        <ul className="checkout-address-section__list">
          {addresses.map((addr) => (
            <li key={addr.id} className="checkout-address-section__item">
              {/* why: deferred so the browser forwards the label click to the radio first —
                  sync setMode unmounted the list before that forwarding landed */}
              <label
                className="checkout-address"
                onClick={() => setTimeout(() => setMode('compact'), 0)}
              >
                <input
                  type="radio"
                  {...register('addressId')}
                  value={addr.id}
                  className="checkout-address__radio"
                />
                <div className="checkout-address__info">
                  <span className="checkout-address__name">
                    {addr.fullName}
                  </span>
                  {addr.isDefault && (
                    <span className="checkout-address__badge">Default</span>
                  )}
                  <span className="checkout-address__phone">{addr.phone}</span>
                  <span className="checkout-address__detail">
                    {formatAddress(addr)}
                  </span>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}

      {mode === 'compact' && selected && (
        <AddressCard
          address={selected}
          label={selected.isDefault ? 'Default address' : 'Shipping to'}
        />
      )}

      {!hasAddresses && mode !== 'add' && (
        <p className="checkout-section__empty">
          You don't have any saved address yet.
        </p>
      )}

      {mode !== 'add' && mode !== 'list' && (
        <div className="checkout-address-section__actions">
          {hasMultipleAddresses && (
            <PanelButton
              variant="tertiary"
              icon={FaExchangeAlt}
              label="Change address"
              onClick={() => setMode('list')}
            />
          )}
          <PanelButton
            variant="edit"
            icon={FaPlus}
            label="Add new address"
            onClick={() => setMode('add')}
          />
        </div>
      )}
    </CheckoutSection>
  )
}
