import { useState } from 'react'
import { toast } from 'sonner'
import { userService } from '../../../entities/user'
import { Modal, PanelButton } from '../../../shared/components'

export default function CustomerCreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }))

  const submit = async (event) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setError('')
    try {
      await userService.createAdminCustomer({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      toast.success('Customer created')
      onCreated()
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ?? 'Could not create customer',
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <Modal
      title="Add customer"
      maxWidth="440px"
      onClose={() => {
        if (!pending) onClose()
      }}
      footer={
        <div className="customers-workspace__form-actions">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={onClose}
            disabled={pending}
          />
          <PanelButton
            type="submit"
            form="customer-create-form"
            label="Create customer"
            loadingLabel="Creating…"
            loading={pending}
          />
        </div>
      }
    >
      <form
        id="customer-create-form"
        className="customers-workspace__form"
        onSubmit={submit}
      >
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            minLength={3}
            maxLength={15}
            autoComplete="name"
            required
          />
        </label>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={(event) => update('email', event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            minLength={6}
            autoComplete="new-password"
            required
          />
        </label>
        <p>
          Share the password securely with the customer. A verification email is
          sent when available.
        </p>
        {error && (
          <p className="customers-workspace__form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
