import './CheckoutAddressForm.css'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  addressService,
  USER_KEYS,
  profileAddressSchema,
  ADDRESS_COUNTRIES,
} from '../../../entities/user'
import { PanelButton, SelectField } from '../../../shared/components'
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
    label: 'Street address',
    full: true,
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
    full: true,
  },
  {
    name: 'postalCode',
    label: 'Postal code',
  },
  {
    name: 'countryCode',
    label: 'Country',
  },
]

// why: a checkout order can only reference a saved addressId (server requires it),
// so a "new" address must be persisted via addressService.createAddress before it's usable.
export default function CheckoutAddressForm({ onSaved, onCancel }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileAddressSchema),
    defaultValues: { countryCode: 'VN' },
  })

  // why: server always makes a checkout-added address the new default, so the cache
  // update below demotes the previous default locally to match — keep in sync if
  // this ever becomes optional.
  const { mutate: createAddress, isPending } = useMutation({
    mutationFn: (data) =>
      addressService.createAddress({
        ...data,
        isDefault: true,
      }),
    onSuccess: (res) => {
      const created = res.data.data
      queryClient.setQueryData(USER_KEYS.current, (prev) => {
        if (!prev) return prev
        const addresses = (prev.addresses ?? []).map((a) => ({
          ...a,
          isDefault: false,
        }))
        return {
          ...prev,
          addresses: [...addresses, created],
        }
      })
      onSaved(created.id)
    },
    onError: () => toast.error('Failed to save address. Please try again.'),
  })
  return (
    <div className="checkout-address-form">
      <div className="checkout-address-form__grid">
        {FIELDS.map(({ name, label, full }) => (
          <label
            key={name}
            className={`checkout-address-form__field${full ? ' checkout-address-form__field--full' : ''}`}
          >
            <span>{label}</span>
            {name === 'countryCode' ? (
              <SelectField {...register(name)}>
                {ADDRESS_COUNTRIES.map(([code, country]) => (
                  <option key={code} value={code}>
                    {country}
                  </option>
                ))}
              </SelectField>
            ) : (
              <input {...register(name)} />
            )}
            {errors[name] && (
              <span className="checkout-address-form__error">
                {errors[name].message}
              </span>
            )}
          </label>
        ))}
      </div>

      <div className="checkout-address-form__footer">
        {onCancel && (
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={onCancel}
            disabled={isPending}
          />
        )}
        <PanelButton
          variant="save"
          label="Save address"
          loadingLabel="Saving..."
          onClick={handleSubmit((data) => createAddress(data))}
          loading={isPending}
        />
      </div>
    </div>
  )
}
