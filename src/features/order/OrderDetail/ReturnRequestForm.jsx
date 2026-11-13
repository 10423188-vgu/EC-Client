import { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import { FiRotateCcw } from 'react-icons/fi'
import { useCreateReturn } from '../../../entities/order'
import { uploadService } from '../../../shared/api/upload.service'
import { PanelButton, UploadDropzone } from '../../../shared/components'
import { getRemainingReturnItems } from './returnItems'
import './ReturnRequestForm.css'

const MAX_IMAGES = 5

const uploadEvidence = async (file) => {
  const { data: presign } = (await uploadService.getPresignedUrl('returns'))
    .data
  const body = new FormData()
  body.append('file', file)
  body.append('timestamp', presign.timestamp)
  body.append('signature', presign.signature)
  body.append('folder', presign.folder)
  body.append('api_key', presign.apiKey)
  const { data } = await axios.post(
    `https://api.cloudinary.com/v1_1/${presign.cloudName}/image/upload`,
    body,
  )
  return data.secure_url
}

export default function ReturnRequestForm({ order, returnDeadlineAt }) {
  const [reason, setReason] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [quantities, setQuantities] = useState({})
  const [quantityErrors, setQuantityErrors] = useState({})
  const [files, setFiles] = useState([])
  const { mutateAsync: createReturn, isPending } = useCreateReturn()
  const remainingItems = getRemainingReturnItems(order)
  const selectedItems = remainingItems
    .filter((item) => Number(quantities[item.id]) > 0)
    .map((item) => ({
      orderItemId: item.id,
      quantity: Number(quantities[item.id]),
    }))
  const selectedQuantity = selectedItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )
  const validSelection =
    selectedItems.length > 0 &&
    selectedItems.every((selected) => {
      const remaining = remainingItems.find(
        (item) => item.id === selected.orderItemId,
      )?.remaining
      return (
        Number.isInteger(selected.quantity) && selected.quantity <= remaining
      )
    })

  const handleQuantityChange = (item, rawValue) => {
    if (rawValue === '') {
      setQuantities((current) => ({ ...current, [item.id]: '' }))
      setQuantityErrors((current) => ({ ...current, [item.id]: '' }))
      return
    }
    const value = Number(rawValue)
    if (!Number.isFinite(value)) return
    const quantity = Math.min(item.remaining, Math.max(0, Math.trunc(value)))
    setQuantities((current) => ({ ...current, [item.id]: quantity }))
    setQuantityErrors((current) => ({
      ...current,
      [item.id]:
        value > item.remaining
          ? `Maximum ${item.remaining} item${item.remaining === 1 ? '' : 's'}. Quantity adjusted.`
          : value < 0 || !Number.isInteger(value)
            ? 'Enter a whole number of items.'
            : '',
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validSelection || isPending) return
    try {
      const evidenceImages = await Promise.all(files.map(uploadEvidence))
      await createReturn({
        id: order.id,
        reason,
        customerNote: customerNote || undefined,
        evidenceImages,
        items: selectedItems,
      })
      toast.success('Return request submitted')
    } catch (error) {
      toast.error(
        error.response?.data?.message ?? 'Failed to submit return request',
      )
    }
  }

  return (
    <form className="return-request-form" onSubmit={handleSubmit}>
      <header className="return-request-form__header">
        <span className="return-request-form__icon">
          <FiRotateCcw aria-hidden="true" />
        </span>
        <div className="return-request-form__heading">
          <h2 className="return-request-form__title">Request a return</h2>
          <p className="return-request-form__note">
            Choose the items and quantities you want to return.
          </p>
        </div>
        <span className="return-request-form__deadline">
          Submit by{' '}
          {new Date(returnDeadlineAt).toLocaleDateString('en-US', {
            dateStyle: 'medium',
          })}
        </span>
      </header>
      <fieldset className="return-request-form__items">
        <legend>Items to return</legend>
        {remainingItems.map((item) => (
          <div
            key={item.id}
            className={`return-request-form__item${Number(quantities[item.id]) > 0 ? ' return-request-form__item--selected' : ''}`}
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="return-request-form__item-image"
              />
            ) : (
              <span className="return-request-form__item-image return-request-form__item-image--fallback">
                {item.productName.slice(0, 1)}
              </span>
            )}
            <span className="return-request-form__item-info">
              <strong>{item.productName}</strong>
              <span>{item.variantName}</span>
            </span>
            <span className="return-request-form__available">
              {item.remaining > 0
                ? `${item.remaining} available`
                : 'Already returned'}
            </span>
            <label className="return-request-form__quantity-field">
              <span>Quantity</span>
              <input
                type="number"
                min="0"
                max={item.remaining}
                step="1"
                value={quantities[item.id] ?? 0}
                className="return-request-form__quantity"
                onChange={(event) =>
                  handleQuantityChange(item, event.target.value)
                }
                disabled={item.remaining === 0 || isPending}
                aria-label={`Quantity to return for ${item.productName}`}
                aria-describedby={
                  quantityErrors[item.id]
                    ? `return-quantity-error-${item.id}`
                    : undefined
                }
              />
            </label>
            {quantityErrors[item.id] && (
              <span
                id={`return-quantity-error-${item.id}`}
                className="return-request-form__quantity-error"
                role="status"
              >
                {quantityErrors[item.id]}
              </span>
            )}
          </div>
        ))}
      </fieldset>
      <section
        className="return-request-form__details"
        aria-label="Return details"
      >
        <label className="return-request-form__field">
          <span>
            Reason <span className="return-request-form__required">*</span>
          </span>
          <textarea
            name="reason"
            value={reason}
            className="return-request-form__input"
            onChange={(event) => setReason(event.target.value)}
            placeholder="Tell us why you're returning these items"
            maxLength={500}
            required
          />
        </label>
        <label className="return-request-form__field">
          <span>
            Additional note{' '}
            <span className="return-request-form__optional">Optional</span>
          </span>
          <textarea
            name="customerNote"
            value={customerNote}
            className="return-request-form__input"
            onChange={(event) => setCustomerNote(event.target.value)}
            placeholder="Add any details that may help with inspection"
            maxLength={1000}
          />
        </label>
      </section>
      <div className="return-request-form__evidence">
        <span>
          Evidence images{' '}
          <span className="return-request-form__optional">
            Optional · up to 5
          </span>
        </span>
        <UploadDropzone
          label="Return evidence images"
          maxFiles={MAX_IMAGES}
          onFilesSelect={setFiles}
          disabled={isPending}
          status={
            files.length
              ? `${files.length} image${files.length === 1 ? '' : 's'} selected`
              : undefined
          }
          multiple
          compact
        />
      </div>
      <footer className="return-request-form__footer">
        <span className="return-request-form__selection">
          {selectedItems.length > 0
            ? `${selectedQuantity} item${selectedQuantity === 1 ? '' : 's'} selected`
            : 'Select at least one item to continue'}
        </span>
        <PanelButton
          type="submit"
          variant="save"
          label="Submit return request"
          loadingLabel="Submitting…"
          loading={isPending}
          disabled={isPending || reason.trim().length < 3 || !validSelection}
        />
      </footer>
    </form>
  )
}
