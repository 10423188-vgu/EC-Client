import './AddressBookModal.css'
import { useState } from 'react'
import { toast } from 'sonner'
import { FaPlus, FaStar } from 'react-icons/fa'
import { MdOutlineEditNote } from 'react-icons/md'
import {
  profileAddressSchema,
  AddressCard,
  ADDRESS_COUNTRIES,
} from '../../../entities/user'
import {
  PanelButton,
  ConfirmDialog,
  TrashButton,
  Modal,
} from '../../../shared/components'
import { useEditableForm } from '../../../shared/hooks/useEditableForm'
import ProfileField from '../ProfileField'
const EMPTY_DRAFT = {
  fullName: '',
  phone: '',
  street: '',
  ward: '',
  district: '',
  city: '',
  postalCode: '',
  countryCode: 'VN',
}
const MAX_ADDRESSES = 10
const FIELDS = [
  {
    name: 'fullName',
    label: 'Full name',
  },
  {
    name: 'phone',
    label: 'Phone',
  },
  {
    name: 'street',
    label: 'Street',
  },
  {
    name: 'ward',
    label: 'Ward',
  },
  {
    name: 'district',
    label: 'District',
  },
  {
    name: 'city',
    label: 'City',
  },
  {
    name: 'postalCode',
    label: 'Postal code',
  },
  {
    name: 'countryCode',
    label: 'Country',
    options: ADDRESS_COUNTRIES,
  },
]
function AddressFields({ draft, errors, onChange }) {
  return (
    <div className="address-book-modal__fields">
      {FIELDS.map(({ name, label, options }) => (
        <ProfileField
          key={name}
          label={label}
          name={name}
          options={options}
          value={draft[name] ?? (name === 'countryCode' ? 'VN' : '')}
          error={errors[name]}
          onChange={onChange}
          isEditing
        />
      ))}
    </div>
  )
}
function AddressBookCard({
  address,
  canDelete,
  onEdit,
  onDeleteRequest,
  onSetDefault,
  settingDefault,
}) {
  const [isEditing, setIsEditing] = useState(false)
  const { draft, errors, loading, handleChange, reset, submit } =
    useEditableForm({
      data: address,
      schema: profileAddressSchema,
      onSave: (data) => onEdit(address.id, data),
      isEditing,
    })
  const handleEdit = () => {
    reset()
    setIsEditing(true)
  }
  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }
  const handleSave = async () => {
    // why: server resets isDefault to false when the field is omitted from the
    // payload — pass the address's current value through so editing it doesn't
    // silently un-default it.
    if (
      await submit({
        isDefault: address.isDefault,
      })
    )
      setIsEditing(false)
  }
  return (
    <div
      className={`address-book-modal__card${isEditing ? ' address-book-modal__card--editing' : ''}`}
    >
      {isEditing ? (
        <>
          <span className="address-book-modal__form-title">
            Edit address — {address.fullName}
          </span>
          <AddressFields
            draft={draft}
            errors={errors}
            onChange={handleChange}
          />
          <div className="address-book-modal__card-footer">
            <PanelButton
              variant="cancel"
              label="Cancel"
              onClick={handleCancel}
              disabled={loading}
            />
            <PanelButton
              variant="save"
              label="Save Changes"
              loadingLabel="Saving…"
              onClick={handleSave}
              loading={loading}
            />
          </div>
        </>
      ) : (
        <>
          <AddressCard
            address={address}
            label={address.isDefault ? 'Default address' : 'Address'}
          />
          <div className="address-book-modal__card-actions">
            {!address.isDefault && (
              <PanelButton
                variant="tertiary"
                icon={FaStar}
                label="Set as default"
                className="address-book-modal__default-button"
                onClick={() => onSetDefault(address.id)}
                disabled={settingDefault}
              />
            )}
            <PanelButton
              variant="tertiary"
              icon={MdOutlineEditNote}
              label="Edit"
              onClick={handleEdit}
            />
            {canDelete && (
              <TrashButton
                onClick={() => onDeleteRequest(address)}
                aria-label="Delete address"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
export default function AddressBookModal({
  addresses,
  onCreate,
  onEdit,
  onDelete,
  onSetDefault,
  settingDefault,
  onClose,
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [hiddenIds, setHiddenIds] = useState(() => new Set())
  const visibleAddresses = addresses
    .filter((a) => !hiddenIds.has(a.id))
    .sort((a, b) => Number(b.isDefault) - Number(a.isDefault))
  const atLimit = visibleAddresses.length >= MAX_ADDRESSES
  const {
    draft,
    errors,
    loading: adding,
    handleChange: handleAddChange,
    submit: submitAdd,
  } = useEditableForm({
    data: EMPTY_DRAFT,
    schema: profileAddressSchema,
    onSave: onCreate,
    isEditing: isAdding,
  })
  const handleAddCancel = () => setIsAdding(false)
  const handleAddSave = async () => {
    // why: the very first address should become the default automatically;
    // later additions shouldn't silently steal default status from an existing one.
    if (
      await submitAdd({
        isDefault: addresses.length === 0,
      })
    )
      setIsAdding(false)
  }
  const confirmDelete = () => {
    const address = confirmTarget
    setConfirmTarget(null)
    setHiddenIds((prev) => new Set(prev).add(address.id))
    onDelete(address.id, {
      onSuccess: () => {
        // why: only show the undo action after the server confirms deletion.
        toast.success('Address deleted', {
          action: {
            label: 'Undo',
            onClick: async () => {
              try {
                await onCreate({
                  fullName: address.fullName,
                  phone: address.phone,
                  street: address.street,
                  ward: address.ward,
                  district: address.district,
                  city: address.city,
                  postalCode: address.postalCode ?? '',
                  countryCode: address.countryCode ?? 'VN',
                  isDefault: address.isDefault,
                })
              } catch {
                toast.error('Failed to restore address.')
              }
            },
          },
          duration: 5000,
        })
      },
      onError: () => {
        setHiddenIds((prev) => {
          const next = new Set(prev)
          next.delete(address.id)
          return next
        })
        toast.error('Failed to delete address.')
      },
    })
  }
  return (
    <>
      <Modal title="Address book" maxWidth="600px" onClose={onClose}>
        <div className="address-book-modal__toolbar">
          {atLimit && !isAdding ? (
            <span className="address-book-modal__limit">
              Maximum {MAX_ADDRESSES} addresses reached
            </span>
          ) : (
            <PanelButton
              variant="edit"
              icon={FaPlus}
              label="Add new address"
              onClick={() => setIsAdding(true)}
              disabled={isAdding}
            />
          )}
        </div>

        <div className="address-book-modal__list">
          {isAdding && (
            <div className="address-book-modal__card address-book-modal__card--new">
              <span className="address-book-modal__form-title">
                Add new address
              </span>
              <AddressFields
                draft={draft}
                errors={errors}
                onChange={handleAddChange}
              />
              <div className="address-book-modal__card-footer">
                <PanelButton
                  variant="cancel"
                  label="Cancel"
                  onClick={handleAddCancel}
                  disabled={adding}
                />
                <PanelButton
                  variant="save"
                  label="Save address"
                  loadingLabel="Saving…"
                  onClick={handleAddSave}
                  loading={adding}
                />
              </div>
            </div>
          )}

          {visibleAddresses.length === 0 && !isAdding && (
            <div className="address-book-modal__card">
              <AddressCard address={null} />
            </div>
          )}

          {visibleAddresses.map((address) => (
            <AddressBookCard
              key={address.id}
              address={address}
              settingDefault={settingDefault}
              onEdit={onEdit}
              onDeleteRequest={setConfirmTarget}
              onSetDefault={onSetDefault}
              canDelete={visibleAddresses.length > 1}
            />
          ))}
        </div>
      </Modal>

      {confirmTarget && (
        <ConfirmDialog
          title="Delete this address?"
          message={`"${confirmTarget.street}, ${confirmTarget.city}" will be removed from your account.`}
          confirmLabel="Delete"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmTarget(null)}
        />
      )}
    </>
  )
}
