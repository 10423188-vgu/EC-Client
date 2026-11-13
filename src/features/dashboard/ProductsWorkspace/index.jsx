import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useAdminProducts,
  useExportAdminProducts,
  useDeleteAdminProduct,
  useRestoreAdminProduct,
  getAdminProduct,
  useProductOverview,
  useSaveAdminProduct,
  useAdminBrands,
} from '../../../entities/product'
import {
  CreateButton,
  Modal,
  Pagination,
  PanelButton,
  RetryButton,
  SelectField,
} from '../../../shared/components'
import ProductTable from './ProductTable'
import { useCategories } from '../../../entities/category'
import { flattenCategories } from './productCategories'
import ProductOverview from './ProductOverview'
import ProductEditor from './ProductEditor'
import ProductFilters from './ProductFilters'
import ProductBulkActions from './ProductBulkActions'
import ProductHistory from './ProductHistory'
import { DASHBOARD_PERIOD_DAYS } from '../dashboardPeriodDays'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import {
  ProductsOverviewSkeleton,
  ProductsTableSkeleton,
} from './ProductsWorkspaceSkeleton'
import '../workspaceControls.css'
import './ProductsWorkspace.css'

export default function ProductsWorkspace() {
  const [params, setParams] = useSearchParams()
  const page = Math.max(1, Number(params.get('productPage')) || 1)
  const limit = Number(params.get('productLimit')) || 5
  const search = params.get('productSearch') ?? ''
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [selection, setSelection] = useState({ key: '', ids: [] })
  const [loadingEditor, setLoadingEditor] = useState(false)
  const [overviewDays, setOverviewDays] = useState(7)
  const [historyProduct, setHistoryProduct] = useState(null)
  const filters = {
    page,
    limit,
    search: search || undefined,
    status: params.get('productStatus') || undefined,
    trash: params.get('productTrash') === 'true' ? 'true' : 'false',
    stock: params.get('productStock') || undefined,
    categorySlug: params.get('productCategory') || undefined,
    brandSlug: params.get('productBrand') || undefined,
    sortBy: params.get('productSort') || 'updatedAt',
    sortOrder: ['asc', 'desc'].includes(params.get('productSortOrder'))
      ? params.get('productSortOrder')
      : params.get('productSort') === 'name'
        ? 'asc'
        : 'desc',
  }
  const selectionKey = JSON.stringify(filters)
  const selected = selection.key === selectionKey ? selection.ids : []
  // why: browser Back/Forward bypasses updateFilters, so clear stale selection
  // after the active page or filters change.
  useEffect(() => {
    setSelection((current) =>
      current.key !== selectionKey && current.ids.length
        ? { key: selectionKey, ids: [] }
        : current,
    )
  }, [selectionKey])
  const setSelected = (update) =>
    setSelection((current) => ({
      key: selectionKey,
      ids:
        typeof update === 'function'
          ? update(current.key === selectionKey ? current.ids : [])
          : update,
    }))
  const { data, isLoading, isFetching, isPlaceholderData, isError, refetch } =
    useAdminProducts(filters)
  const overview = useProductOverview(overviewDays)
  const categoryQuery = useCategories({ includeChildren: true })
  const brandsQuery = useAdminBrands()
  // why: table/editor updates should not re-traverse an unchanged category tree.
  const categories = useMemo(
    () => flattenCategories(categoryQuery.data ?? []),
    [categoryQuery.data],
  )
  const save = useSaveAdminProduct()
  const remove = useDeleteAdminProduct()
  const restore = useRestoreAdminProduct()
  const exportProducts = useExportAdminProducts()
  const products = data?.data ?? []
  const updateFilters = (updates) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(updates)) {
      if (value) next.set(key, String(value))
      else next.delete(key)
    }
    if (!('productPage' in updates)) next.delete('productPage')
    setSelected([])
    setParams(next)
  }
  const removeFromCurrentPage = (id) => {
    setSelected((current) => current.filter((value) => value !== id))
    if (products.length === 1 && page > 1) {
      updateFilters({ productPage: page - 1 })
    }
  }
  const handleSort = (field) => {
    const direction =
      filters.sortBy === field
        ? filters.sortOrder === 'asc'
          ? 'desc'
          : 'asc'
        : field === 'name'
          ? 'asc'
          : 'desc'
    updateFilters({ productSort: field, productSortOrder: direction })
  }
  const openEditor = async (product) => {
    setLoadingEditor(true)
    try {
      setEditor(await getAdminProduct(product.id))
    } catch (error) {
      toast.error(error.response?.data?.message ?? 'Could not load product')
    } finally {
      setLoadingEditor(false)
    }
  }
  const toggleSelection = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    )
  const allSelected =
    products.length > 0 &&
    products.every((product) => selected.includes(product.id))
  const downloadCsv = async (ids) => {
    try {
      const blob = await exportProducts.mutateAsync({ filters, ids })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `products-${ids ? 'selected' : 'filtered'}-${new Date().toISOString().slice(0, 10)}.csv`
      link.click()
      setTimeout(() => URL.revokeObjectURL(url), 0)
    } catch (error) {
      let message = error.response?.data?.message
      if (error.response?.data instanceof Blob) {
        try {
          message = JSON.parse(await error.response.data.text()).message
        } catch {
          // why: a disconnected CSV stream may not contain JSON.
        }
      }
      toast.error(message ?? 'Could not export products')
    }
  }
  const toggleActive = (product) =>
    save.mutate(
      { id: product.id, data: { isActive: !product.isActive } },
      {
        onSuccess: () =>
          toast.success(
            product.isActive ? 'Product deactivated' : 'Product activated',
          ),
        onError: (error) =>
          toast.error(
            error.response?.data?.message ?? 'Could not update product',
          ),
      },
    )
  if (isLoading && overview.isLoading) {
    return <DashboardWorkspaceSkeleton section="products" />
  }
  if (isLoading) {
    return (
      <div className="products-workspace workspace-controls">
        <ProductOverview
          days={overviewDays}
          categories={categories}
          onRetry={overview.refetch}
          data={overview.data}
          isError={overview.isError}
          isFetching={overview.isFetching}
        />
        <ProductsTableSkeleton />
      </div>
    )
  }
  return (
    <div className="products-workspace workspace-controls">
      {overview.isLoading ? (
        <ProductsOverviewSkeleton />
      ) : (
        <ProductOverview
          days={overviewDays}
          categories={categories}
          onRetry={overview.refetch}
          data={overview.data}
          isError={overview.isError}
          isFetching={overview.isFetching}
        />
      )}
      <section className="products-workspace__table-panel">
        <header className="products-workspace__table-header">
          <h2 className="products-workspace__title">
            {filters.trash === 'true' ? 'Product trash' : 'Products list'}
          </h2>
          <div className="products-workspace__header-actions">
            <SelectField
              value={overviewDays}
              wrapperClassName="workspace-controls__select"
              onChange={(event) => setOverviewDays(Number(event.target.value))}
              aria-label="Product overview period"
            >
              {DASHBOARD_PERIOD_DAYS.map((days) => (
                <option key={days} value={days}>
                  Last {days} days
                </option>
              ))}
            </SelectField>
            <CreateButton
              onClick={() => {
                if (filters.trash === 'true')
                  updateFilters({ productTrash: '' })
                setEditor({})
              }}
            >
              Add product
            </CreateButton>
          </div>
        </header>

        <ProductFilters
          filters={filters}
          categories={categories}
          brands={brandsQuery.data ?? []}
          resultCount={data?.pagination.total ?? 0}
          selectedCount={selected.length}
          isUpdating={isFetching && isPlaceholderData}
          updateFailed={isError && Boolean(data)}
          onChange={updateFilters}
        />
        <ProductBulkActions
          disabled={isPlaceholderData || isError}
          selected={selected}
          isTrash={filters.trash === 'true'}
          onClear={() => setSelected([])}
          onCompleted={(outcome, action) => {
            setSelected(outcome.failed.map((entry) => entry.id))
            const leavesView =
              ['trash', 'restore'].includes(action) ||
              (action === 'deactivate' && filters.status === 'active') ||
              (action === 'activate' && filters.status === 'inactive')
            if (
              leavesView &&
              page > 1 &&
              products.length &&
              products.every((product) => outcome.changed.includes(product.id))
            ) {
              updateFilters({ productPage: page - 1 })
            }
          }}
          onExport={() => downloadCsv(selected)}
          onExportFiltered={() => downloadCsv()}
          isExporting={exportProducts.isPending}
        />
        {isError && !data ? (
          <div className="products-workspace__error">
            Could not load products.{' '}
            <RetryButton onClick={() => refetch()} loading={isFetching} />
          </div>
        ) : (
          <>
            <ProductTable
              onHistory={setHistoryProduct}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={handleSort}
              onDelete={setDeleting}
              onRestore={(product) =>
                restore.mutate(product.id, {
                  onSuccess: () => {
                    removeFromCurrentPage(product.id)
                    toast.success('Product restored as inactive')
                  },
                  onError: (error) =>
                    toast.error(
                      error.response?.data?.message ??
                        'Could not restore product',
                    ),
                })
              }
              isRestoring={restore.isPending}
              isTrash={filters.trash === 'true'}
              products={products}
              isFetching={isFetching}
              isStale={isPlaceholderData || isError}
              selected={selected}
              allSelected={allSelected}
              setSelected={setSelected}
              toggleSelection={toggleSelection}
              openEditor={openEditor}
              loadingEditor={loadingEditor}
              toggleActive={toggleActive}
              isSaving={save.isPending}
            />
            <footer className="products-workspace__table-footer">
              <Pagination
                onPageChange={(value) => updateFilters({ productPage: value })}
                page={page}
                totalPages={data?.pagination.totalPages ?? 1}
              />
              <span>
                Showing {products.length} of {data?.pagination.total ?? 0}{' '}
                products
              </span>
              <SelectField
                wrapperClassName="workspace-controls__select products-workspace__page-size"
                value={limit}
                onChange={(event) =>
                  updateFilters({ productLimit: event.target.value })
                }
                aria-label="Products per page"
              >
                <option value="5">Show 5</option>
                <option value="10">Show 10</option>
                <option value="20">Show 20</option>
                <option value="50">Show 50</option>
              </SelectField>
            </footer>
          </>
        )}
      </section>
      {editor && (
        <ProductEditor onClose={() => setEditor(null)} product={editor} />
      )}
      {historyProduct && (
        <Modal
          title={`Change history · ${historyProduct.name}`}
          maxWidth="760px"
          onClose={() => setHistoryProduct(null)}
        >
          <ProductHistory
            key={historyProduct.id}
            productId={historyProduct.id}
          />
        </Modal>
      )}
      {deleting && (
        <Modal
          onClose={remove.isPending ? () => {} : () => setDeleting(null)}
          title="Move product to trash"
          maxWidth="420px"
        >
          <p>
            Move “{deleting.name}” to trash? Customers will no longer see or buy
            it. Images, stock and order history are kept. You can restore it
            from Trash.
          </p>
          <footer className="products-workspace__editor-actions">
            <PanelButton
              variant="cancel"
              label="Cancel"
              onClick={() => setDeleting(null)}
              disabled={remove.isPending}
            />
            <PanelButton
              variant="danger"
              label="Move to trash"
              loadingLabel="Moving…"
              onClick={() =>
                remove.mutate(deleting.id, {
                  onSuccess: () => {
                    removeFromCurrentPage(deleting.id)
                    setDeleting(null)
                    toast.success('Product moved to trash')
                  },
                  onError: (error) =>
                    toast.error(
                      error.response?.data?.message ??
                        'Could not delete product',
                    ),
                })
              }
              loading={remove.isPending}
            />
          </footer>
        </Modal>
      )}
    </div>
  )
}
