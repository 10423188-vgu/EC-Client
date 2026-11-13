import { useState, useEffect } from 'react'

export function useEditableForm({ data, schema, onSave, isEditing }) {
  const [draft, setDraft] = useState(data ?? {})
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  // why: keep the draft in sync with background refetches of `data` while the
  // user isn't actively editing, so the read-only view never shows stale values
  useEffect(() => {
    if (!isEditing) {
      setDraft(data ?? {})
      setErrors({})
    }
  }, [data, isEditing])

  const handleChange = (e) => {
    const { name, value } = e.target
    setDraft((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const reset = () => {
    setDraft(data ?? {})
    setErrors({})
  }

  const submit = async (overrides) => {
    const payload = overrides ? { ...draft, ...overrides } : draft
    if (schema) {
      const result = schema.safeParse(payload)
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors
        setErrors(
          Object.fromEntries(
            Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]]),
          ),
        )
        return false
      }
    }
    setLoading(true)
    try {
      await onSave(payload)
      return true
    } catch {
      // why: onSave's mutation already shows an error toast — nothing else to do here
      return false
    } finally {
      setLoading(false)
    }
  }

  return { draft, errors, loading, handleChange, reset, submit }
}
