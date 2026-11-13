import './CompareBar.css'
import { memo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaTimes } from 'react-icons/fa'
import { useShallow } from 'zustand/react/shallow'
import { useCompareStore } from '../../entities/product'
import { toast } from 'sonner'
import { DeleteButton } from './DeleteButton.jsx'
import { CompareButton } from './CompareButton.jsx'
function CompareBar() {
  const { items, remove, clear, restore } = useCompareStore(
    useShallow((s) => ({
      items: s.items,
      remove: s.remove,
      clear: s.clear,
      restore: s.restore,
    })),
  )
  const navigate = useNavigate()
  const handleClear = useCallback(() => {
    const snapshot = items
    clear()
    toast.success('Compare list cleared.', {
      action: {
        label: 'Undo',
        onClick: () => restore(snapshot),
      },
      duration: 3000,
    })
  }, [items, clear, restore])

  // NOTE: 4 must stay in sync with MAX_COMPARE in entities/product/model/compare.store.js
  const emptySlots = Array.from({
    length: 4 - items.length,
  })
  if (items.length === 0) return null
  return (
    <div className="compare-bar">
      <div className="compare-bar__slots">
        {items.map((item) => (
          <div key={item.id} className="compare-bar__slot">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="compare-bar__slot-image"
            />
            <button
              className="compare-bar__slot-remove"
              onClick={() => remove(item.id)}
              aria-label="Remove from compare"
            >
              <FaTimes />
            </button>
          </div>
        ))}
        {emptySlots.map((_, i) => (
          <div
            key={items.length + i}
            className="compare-bar__slot compare-bar__slot--empty"
          />
        ))}
      </div>

      <p className="compare-bar__hint">
        {items.length < 2
          ? 'Select at least 2 products'
          : `${items.length} products selected`}
      </p>

      <div className="compare-bar__actions">
        <DeleteButton onClick={handleClear} />
        <CompareButton
          onClick={() => navigate('/compare')}
          disabled={items.length < 2}
        />
      </div>
    </div>
  )
}
export default memo(CompareBar)
