import './CheckoutNote.css'
import { useWatch } from 'react-hook-form'
import CheckoutSection from '../CheckoutSection'
const MAX_LENGTH = 500
export default function CheckoutNote({ register, control }) {
  const note = useWatch({
    control,
    name: 'note',
    defaultValue: '',
  })
  return (
    <CheckoutSection title="Order Note (optional)">
      <textarea
        rows={3}
        maxLength={MAX_LENGTH}
        placeholder="Leave a note for the courier..."
        className="checkout-note"
        {...register('note')}
      />
      <span className="checkout-note__counter">
        {note?.length ?? 0}/{MAX_LENGTH}
      </span>
    </CheckoutSection>
  )
}
