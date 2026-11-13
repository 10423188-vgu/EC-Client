import './ProfileAddressList.css'
import { useState } from 'react'
import { MdOutlineContacts } from 'react-icons/md'
import { useProfile } from '../hooks'
import { AddressCard } from '../../../entities/user'
import { PanelButton } from '../../../shared/components'
import { userLib } from '../../../shared/utils'
import AddressBookModal from './AddressBookModal'
export default function ProfileAddressList({ addresses = [] }) {
  const { createAddress, editAddress, deleteAddress, setDefaultAddress } =
    useProfile()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const defaultAddress = userLib.getDefaultAddress(addresses)
  return (
    <div className="profile-address-list">
      <div className="profile-address-list__header">
        <span className="profile-address-list__title">Address information</span>
        <PanelButton
          variant="edit"
          icon={MdOutlineContacts}
          label="Manage address book"
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <AddressCard address={defaultAddress} label="Default address" />

      {isModalOpen && (
        <AddressBookModal
          addresses={addresses}
          settingDefault={setDefaultAddress.isPending}
          onCreate={(data) => createAddress.mutateAsync(data)}
          onEdit={(id, data) =>
            editAddress.mutateAsync({
              id,
              ...data,
            })
          }
          onDelete={(id, options) => deleteAddress.mutate(id, options)}
          onSetDefault={(id) => setDefaultAddress.mutateAsync(id)}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
