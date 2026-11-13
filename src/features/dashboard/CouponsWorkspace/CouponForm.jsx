import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateCoupon, useUpdateCoupon } from '../../../entities/coupon'
import {
  Checkbox,
  Modal,
  PanelButton,
  RetryButton,
} from '../../../shared/components'
import CouponDateRangeFields from './CouponDateRangeFields'
import CouponDetailsFields from './CouponDetailsFields'

const toLocalInput = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16)
}

const initialForm = (coupon) => ({
  code: coupon?.code ?? '',
  name: coupon?.name ?? '',
  description: coupon?.description ?? '',
  type: coupon?.type ?? 'PERCENTAGE',
  value: coupon?.value == null ? '10' : String(coupon.value),
  maxDiscount: coupon?.maxDiscount == null ? '' : String(coupon.maxDiscount),
  minOrderAmount:
    coupon?.minOrderAmount == null ? '' : String(coupon.minOrderAmount),
  usageLimit: coupon?.usageLimit == null ? '' : String(coupon.usageLimit),
  perUserLimit: String(coupon?.perUserLimit ?? 1),
  startsAt: toLocalInput(coupon?.startsAt),
  expiresAt: toLocalInput(coupon?.expiresAt),
  isActive: coupon?.isActive ?? true,
})

const positiveOrEmpty = (value) =>
  value === '' || (Number.isFinite(Number(value)) && Number(value) > 0)

function CouponForm({ coupon, loadError, onRetry, onClose }) {
  const [form, setForm] = useState(() => initialForm(coupon))
  const [error, setError] = useState('')
  const createMutation = useCreateCoupon()
  const updateMutation = useUpdateCoupon()
  const busy = createMutation.isPending || updateMutation.isPending
  const editing = Boolean(coupon)
  const dirty = JSON.stringify(form) !== JSON.stringify(initialForm(coupon))
  const change = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }))
  const close = () => {
    if (busy) return
    if (dirty && !window.confirm('Discard unsaved coupon changes?')) return
    onClose()
  }

  const submit = async (event) => {
    event.preventDefault()
    if (busy) return
    const code = form.code.trim().toUpperCase()
    const name = form.name.trim()
    const value = form.type === 'FREE_SHIPPING' ? 1 : Number(form.value)
    const optionalNumbers = [
      form.maxDiscount,
      form.minOrderAmount,
      form.usageLimit,
    ]
    const startsAt = form.startsAt
      ? new Date(form.startsAt).toISOString()
      : null
    const expiresAt = form.expiresAt
      ? new Date(form.expiresAt).toISOString()
      : null
    if (!editing && !/^[A-Z0-9_-]{3,50}$/.test(code)) {
      return setError(
        'Use 3–50 uppercase letters, numbers, _ or - for the code.',
      )
    }
    if (name.length < 2 || name.length > 100) {
      return setError('Name must be 2–100 characters.')
    }
    if (
      !positiveOrEmpty(String(value)) ||
      (form.type === 'PERCENTAGE' && value > 100)
    ) {
      return setError(
        'Enter a discount greater than zero, at most 100% for percentages.',
      )
    }
    if (optionalNumbers.some((number) => !positiveOrEmpty(number))) {
      return setError(
        'Optional amounts and usage limit must be greater than zero.',
      )
    }
    if (
      !Number.isInteger(Number(form.perUserLimit)) ||
      Number(form.perUserLimit) < 1
    ) {
      return setError(
        'Per-customer limit must be a whole number of at least 1.',
      )
    }
    if (form.usageLimit && !Number.isInteger(Number(form.usageLimit))) {
      return setError('Usage limit must be a whole number.')
    }
    if (startsAt && expiresAt && startsAt >= expiresAt) {
      return setError('Expiry must be after the start date.')
    }
    setError('')
    const optional = (text) => (text === '' ? null : Number(text))
    const data = {
      name,
      description: form.description.trim() || null,
      value,
      maxDiscount:
        form.type === 'PERCENTAGE' ? optional(form.maxDiscount) : null,
      minOrderAmount: optional(form.minOrderAmount),
      usageLimit: optional(form.usageLimit),
      perUserLimit: Number(form.perUserLimit),
      startsAt,
      expiresAt,
      isActive: form.isActive,
    }
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: coupon.id, data })
      } else {
        await createMutation.mutateAsync({
          ...data,
          code,
          description: data.description ?? undefined,
          maxDiscount: data.maxDiscount ?? undefined,
          minOrderAmount: data.minOrderAmount ?? undefined,
          usageLimit: data.usageLimit ?? undefined,
          startsAt: data.startsAt ?? undefined,
          expiresAt: data.expiresAt ?? undefined,
          scope: 'ALL',
          scopeIds: [],
        })
      }
      toast.success(editing ? 'Coupon updated' : 'Coupon created')
      onClose()
    } catch (requestError) {
      setError(requestError.response?.data?.message ?? 'Could not save coupon')
    }
  }

  return (
    <Modal
      title={editing ? `Edit ${coupon.code}` : 'Add coupon'}
      maxWidth="620px"
      bodyClassName="coupons-workspace__editor-body"
      onClose={close}
      footer={
        <div className="coupons-workspace__dialog-actions">
          <PanelButton
            variant="cancel"
            label="Cancel"
            onClick={close}
            disabled={busy}
          />
          <PanelButton
            type="submit"
            form="coupon-editor-form"
            label={editing ? 'Save changes' : 'Create coupon'}
            loadingLabel="Saving…"
            loading={busy}
          />
        </div>
      }
    >
      <form
        id="coupon-editor-form"
        className="coupons-workspace__form"
        onSubmit={submit}
      >
        {loadError && (
          <div className="coupons-workspace__error" role="alert">
            <p>Could not refresh this coupon.</p>
            <RetryButton onClick={onRetry} />
          </div>
        )}
        <CouponDetailsFields
          form={form}
          change={change}
          editing={editing}
          coupon={coupon}
        />
        <div className="coupons-workspace__form-grid">
          <label>
            Total uses
            <input
              type="number"
              value={form.usageLimit}
              onChange={(event) => change('usageLimit', event.target.value)}
              min="1"
              step="1"
              placeholder="Unlimited"
            />
          </label>
          <label>
            Uses per customer
            <input
              type="number"
              value={form.perUserLimit}
              onChange={(event) => change('perUserLimit', event.target.value)}
              min="1"
              step="1"
              required
            />
          </label>
        </div>
        <CouponDateRangeFields
          startsAt={form.startsAt}
          expiresAt={form.expiresAt}
          onChange={change}
        />
        <label className="coupons-workspace__checkbox">
          <Checkbox
            checked={form.isActive}
            onChange={(event) => change('isActive', event.target.checked)}
          />
          Enabled
        </label>
        <p className="coupons-workspace__form-note">
          New codes apply to all products. Leave dates empty to make the code
          available immediately.
        </p>
        {error && (
          <p className="coupons-workspace__form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}

export default CouponForm
