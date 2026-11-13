import { SearchField, SelectField } from '../../../shared/components'

export default function CatalogFilters({ filters, onChange }) {
  return (
    <div className="workspace-controls__filters catalog-workspace__filters">
      <SearchField
        type="text"
        value={filters.search ?? ''}
        placeholder="Search name or slug"
        onSearch={(value) => onChange({ catalogSearch: value })}
        ariaLabel="Search catalog"
      />
      <SelectField
        wrapperClassName="workspace-controls__select"
        value={filters.status ?? ''}
        onChange={(event) => onChange({ catalogStatus: event.target.value })}
        aria-label="Catalog status"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </SelectField>
      <SelectField
        wrapperClassName="workspace-controls__select"
        value={filters.sortOrder}
        onChange={(event) => onChange({ catalogSort: event.target.value })}
        aria-label="Sort catalog"
      >
        <option value="asc">Name A–Z</option>
        <option value="desc">Name Z–A</option>
      </SelectField>
    </div>
  )
}
