import './ProductPage.css'
import { BREADCRUMB_ITEMS } from '../../entities/product/model/product.constants'
import {
  ProductBreadcrumb,
  ProductFacet,
  ProductList,
  useProductCatalog,
} from '../../features/product'

export default function ProductPage() {
  const {
    params,
    filterOpen,
    toggleFilter,
    handleParamsChange,
    products,
    pagination,
    aggregations,
    isLoading,
    isError,
    isFetching,
    isPlaceholderData,
    hasData,
    refetch,
  } = useProductCatalog()
  return (
    <main className="product">
      <ProductBreadcrumb items={BREADCRUMB_ITEMS} />
      <div className="product__body">
        <ProductFacet
          aggregations={aggregations}
          onFilterChange={handleParamsChange}
          isOpen={filterOpen}
          isLoading={isLoading}
        />
        <ProductList
          products={products}
          pagination={pagination}
          params={params}
          filterOpen={filterOpen}
          onParamsChange={handleParamsChange}
          onToggleFilter={toggleFilter}
          isLoading={isLoading}
          isError={isError}
          isFetching={isFetching}
          isPlaceholderData={isPlaceholderData}
          hasData={hasData}
          onRetry={refetch}
        />
      </div>
    </main>
  )
}
