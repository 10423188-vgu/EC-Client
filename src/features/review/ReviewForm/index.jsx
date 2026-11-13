import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import './ReviewForm.css'
import { StarPicker } from '../../../entities/review/index.js'
const schema = z.object({
  rating: z
    .number({
      required_error: 'Please select a star rating',
    })
    .int()
    .min(1)
    .max(5),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000),
})
export const ReviewForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEdit = !!initialValues
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialValues ?? {
      rating: 0,
      title: '',
      body: '',
    },
  })

  // why: RHF's defaultValues only applies at mount — this re-syncs the form when
  // initialValues changes (e.g. switching which review is being edited) without remounting
  useEffect(() => {
    if (initialValues) reset(initialValues)
  }, [initialValues, reset])
  const rating = useWatch({
    control,
    name: 'rating',
  })
  const bodyValue = useWatch({
    control,
    name: 'body',
  })
  const submit = async (data) => {
    try {
      await onSubmit(data)
      if (!isEdit)
        reset({
          rating: 0,
          title: '',
          body: '',
        })
    } catch {
      toast.error('Could not save review. Please try again.')
    }
  }
  return (
    <form className="review-form" onSubmit={handleSubmit(submit)} noValidate>
      <h3 className="review-form__title">
        {isEdit ? 'Edit your review' : 'Write a review'}
      </h3>

      <div className="review-form__field">
        <label className="review-form__label">Overall rating *</label>
        <StarPicker
          value={rating}
          size={28}
          onChange={(v) =>
            setValue('rating', v, {
              shouldValidate: true,
            })
          }
        />
        {errors.rating && (
          <span className="review-form__error" role="alert">
            {errors.rating.message}
          </span>
        )}
      </div>

      <div className="review-form__field">
        <label htmlFor="review-title" className="review-form__label">
          Review headline *
        </label>
        <input
          id="review-title"
          type="text"
          placeholder="What's most important to know?"
          className={`review-form__input${errors.title ? ' review-form__input--error' : ''}`}
          {...register('title')}
        />
        {errors.title && (
          <span className="review-form__error" role="alert">
            {errors.title.message}
          </span>
        )}
      </div>

      <div className="review-form__field">
        <label htmlFor="review-body" className="review-form__label">
          Written review *
        </label>
        <textarea
          id="review-body"
          placeholder="What did you like or dislike? What did you use this product for?"
          rows={5}
          className={`review-form__textarea${errors.body ? ' review-form__textarea--error' : ''}`}
          {...register('body')}
        />
        <span className="review-form__char-count">
          {bodyValue?.length ?? 0} / 2000
        </span>
        {errors.body && (
          <span className="review-form__error" role="alert">
            {errors.body.message}
          </span>
        )}
      </div>

      <div className="review-form__actions">
        {onCancel && (
          <button
            type="button"
            className="review-form__action-button review-form__action-button--cancel"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="review-form__action-button review-form__action-button--submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving…' : isEdit ? 'Update review' : 'Submit review'}
        </button>
      </div>
    </form>
  )
}
