import { useState } from 'react'

import { useParams } from 'react-router-dom'

import { useProduct } from '../../entities/product'

export const useProductDetail = () => {
  const { id } = useParams()
  const {
    data: product,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
  } = useProduct(id)

  const [selectedVariant, setSelectedVariant] = useState(null)
  const [resetForId, setResetForId] = useState(id)

  // why: reset synchronously during render instead of useEffect+setState — avoids the extra
  // render-commit-effect-render cascade every time the product id changes
  if (id !== resetForId) {
    setResetForId(id)
    setSelectedVariant(null)
  }

  const variants = product?.variants ?? []

  // why: prefer the first in-stock variant; fall back to the first variant so the UI is
  // never empty when everything is out of stock
  const activeVariant =
    selectedVariant ?? variants.find((v) => v.stock > 0) ?? variants[0] ?? null

  return {
    product,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
    selectedVariant: activeVariant,
    onVariantChange: setSelectedVariant,
  }
}
