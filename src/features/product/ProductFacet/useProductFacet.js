import { useCallback, useMemo, useState } from 'react'

import { useCategories } from '../../../entities/category'
import { formatLib } from '../../../shared/utils'

export function useProductFacet(onFilterChange, aggregations, isLoading) {
  // ─── Categories ──────────────────────────────────────────────────────────────
  const {
    data: categories = [],
    isLoading: loadingCats,
    isError: categoriesError,
    isFetching: fetchingCategories,
    refetch: refetchCategories,
  } = useCategories()
  const [categorySlugs, setCategorySlugs] = useState([])

  const handleCategoryClick = useCallback(
    (slug) => {
      setCategorySlugs((prev) => {
        const next = prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [...prev, slug]
        onFilterChange({ categorySlugs: next })
        return next
      })
    },
    [onFilterChange],
  )

  // ─── Price ───────────────────────────────────────────────────────────────────
  const rawMin = aggregations?.priceStats
    ? Math.floor(aggregations.priceStats.min)
    : 0
  const rawMax = aggregations?.priceStats
    ? Math.ceil(aggregations.priceStats.max)
    : 0
  const loadingBounds = !aggregations && isLoading

  const [userRange, setUserRange] = useState(null)

  // why: freezes bounds while a price filter is active — without this, the aggregation
  // returns the filtered range (e.g. [1M, 5M] when filter is [1M, 5M]) and the slider
  // collapses. ES post_filter makes this a no-op on the ES path; it only guards the
  // MongoDB fallback path.
  const [boundsMin, setBoundsMin] = useState(0)
  const [boundsMax, setBoundsMax] = useState(0)
  const [prevRaw, setPrevRaw] = useState([0, 0])

  if (prevRaw[0] !== rawMin || prevRaw[1] !== rawMax) {
    setPrevRaw([rawMin, rawMax])
    if (userRange === null) {
      setBoundsMin(rawMin)
      setBoundsMax(rawMax)
    }
  }

  const priceRange = useMemo(
    () => userRange ?? [boundsMin, boundsMax],
    [userRange, boundsMin, boundsMax],
  )

  const commitPrice = useCallback(
    (range) => {
      onFilterChange({
        minPrice: range[0] > boundsMin ? range[0] : undefined,
        maxPrice: range[1] < boundsMax ? range[1] : undefined,
      })
    },
    [boundsMin, boundsMax, onFilterChange],
  )

  const handleRangeCommit = useCallback(
    (range) => {
      setUserRange(range)
      commitPrice(range)
    },
    [commitPrice],
  )

  const handleMinInput = useCallback(
    (raw) => {
      const val = Math.max(
        boundsMin,
        Math.min(priceRange[1], formatLib.parseVND(raw)),
      )
      const range = [val, priceRange[1]]
      setUserRange(range)
      commitPrice(range)
    },
    [boundsMin, priceRange, commitPrice],
  )

  const handleMaxInput = useCallback(
    (raw) => {
      const val = Math.min(
        boundsMax,
        Math.max(priceRange[0], formatLib.parseVND(raw)),
      )
      const range = [priceRange[0], val]
      setUserRange(range)
      commitPrice(range)
    },
    [boundsMax, priceRange, commitPrice],
  )

  return {
    categories,
    loadingCats,
    categoriesError,
    fetchingCategories,
    refetchCategories,
    categorySlugs,
    handleCategoryClick,
    loadingBounds,
    boundsMin,
    boundsMax,
    priceRange,
    handleRangeCommit,
    handleMinInput,
    handleMaxInput,
  }
}
