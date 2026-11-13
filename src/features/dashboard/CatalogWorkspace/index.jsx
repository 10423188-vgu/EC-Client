import { useState } from 'react'
import {
  CreateButton,
  Pagination,
  RetryButton,
  SelectField,
} from '../../../shared/components'
import { useCatalogWorkspace } from '../useCatalogWorkspace'
import DashboardWorkspaceSkeleton from '../DashboardWorkspaceSkeleton'
import CatalogFilters from './CatalogFilters'
import CatalogTable from './CatalogTable'
import CatalogEditor from './CatalogEditor'
import CatalogDeleteConfirm from './CatalogDeleteConfirm'
import '../workspaceControls.css'
import './CatalogWorkspace.css'

export default function CatalogWorkspace({ kind }) {
  const { filters, change, list, parents, mutation } = useCatalogWorkspace(kind)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const isCategory = kind === 'categories'
  const singular = isCategory ? 'category' : 'brand'
  const records = list.data?.data ?? []
  const meta = list.data?.meta
  const stale = list.isPlaceholderData || list.isError || mutation.isPending
  const sortByName = () =>
    change({ catalogSort: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
  if (list.isPending) {
    return <DashboardWorkspaceSkeleton section={kind} />
  }
  return (
    <section className="catalog-workspace">
      <header className="catalog-workspace__toolbar">
        <CreateButton
          onClick={() => setEditor({ kind, record: null })}
          disabled={mutation.isPending}
        >
          Add {singular}
        </CreateButton>
      </header>

      <CatalogFilters key={kind} filters={filters} onChange={change} />
      <p className="catalog-workspace__notice">
        Product counts include items in Trash. Only items without products
        {isCategory ? ' or child categories' : ''} can be deleted. Use Inactive
        to hide an item.
      </p>
      <div
        className="workspace-controls__summary"
        role="status"
        aria-busy={list.isFetching && !list.isError}
      >
        <output>{meta?.total ?? 0} results</output>
      </div>

      {list.isError && (
        <div className="catalog-workspace__message" role="alert">
          <p>
            {list.data
              ? `Could not refresh ${kind}. Showing previous results.`
              : `Could not load ${kind}.`}
          </p>
          <RetryButton
            onClick={() => list.refetch()}
            loading={list.isFetching}
          />
        </div>
      )}
      {list.data && records.length ? (
        <CatalogTable
          records={records}
          isCategory={isCategory}
          parents={parents.data ?? []}
          disabled={stale}
          onEdit={(record) => setEditor({ kind, record })}
          onDelete={(record) => setDeleting({ kind, record })}
          sortOrder={filters.sortOrder}
          onSort={sortByName}
        />
      ) : list.data ? (
        <p className="catalog-workspace__message">
          No {kind} match these filters.
        </p>
      ) : null}

      <footer className="catalog-workspace__footer">
        <Pagination
          page={filters.page}
          totalPages={meta?.totalPages ?? 0}
          onPageChange={(page) => change({ catalogPage: page })}
        />
        <SelectField
          wrapperClassName="workspace-controls__select"
          value={filters.limit}
          onChange={(event) => change({ catalogLimit: event.target.value })}
          aria-label="Catalog rows per page"
        >
          {[10, 20, 50].map((limit) => (
            <option key={limit} value={limit}>
              Show {limit}
            </option>
          ))}
        </SelectField>
      </footer>

      {editor && (
        <CatalogEditor
          kind={editor.kind}
          record={editor.record}
          parents={parents}
          mutation={mutation}
          onClose={() => setEditor(null)}
        />
      )}
      {deleting && (
        <CatalogDeleteConfirm
          item={deleting}
          mutation={mutation}
          onClose={() => setDeleting(null)}
          onDeleted={() => {
            setDeleting(null)
            if (records.length === 1 && filters.page > 1) {
              change({ catalogPage: filters.page - 1 })
            }
          }}
        />
      )}
    </section>
  )
}
