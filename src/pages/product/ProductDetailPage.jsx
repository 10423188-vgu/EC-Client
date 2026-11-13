import './ProductDetailPage.css'
import {
  ProductBreadcrumb,
  ProductDetailGallery,
  ProductDetailInfo,
  ProductDetailActions,
  ProductRelated,
  ProductRelatedSkeleton,
  ProductDetailSkeleton,
  useProductDetail,
  useProductDetailGsap,
} from '../../features/product'
import { BREADCRUMB_DETAIL_ITEMS } from '../../entities/product/model/product.constants'
import { ReviewProduct, ReviewProductSkeleton } from '../../features/review'
import { RetryButton } from '../../shared/components'
export default function ProductDetailPage() {
  const {
    product,
    isLoading,
    isError,
    isFetching,
    error,
    refetch,
    selectedVariant,
    onVariantChange,
  } = useProductDetail()
  const pageRef = useProductDetailGsap(product?.id)
  if (isLoading) {
    return (
      <main className="product-detail">
        <ProductDetailSkeleton />
        <ReviewProductSkeleton showCta={false} />
        <ProductRelatedSkeleton />
      </main>
    )
  }
  if (isError || !product) {
    return (
      <main className="product-detail">
        <div className="product-detail__error">
          <p>
            {isError && error?.response?.status !== 404
              ? 'Could not load product.'
              : 'Product not found.'}
          </p>
          {isError && error?.response?.status !== 404 && (
            <RetryButton onClick={() => refetch()} loading={isFetching} />
          )}
        </div>
      </main>
    )
  }
  return (
    <main ref={pageRef} className="product-detail">
      <ProductBreadcrumb items={BREADCRUMB_DETAIL_ITEMS(product.name)} />

      <div className="product-detail__layout">
        <div className="product-detail__gallery-column">
          <ProductDetailGallery
            key={product.id}
            images={product.images}
            selectedVariant={selectedVariant}
          />
        </div>

        <div className="product-detail__info-column">
          <ProductDetailInfo
            product={product}
            selectedVariant={selectedVariant}
          />
          <div className="product-detail__divider" />
          <ProductDetailActions
            variants={product.variants}
            selectedVariant={selectedVariant}
            onVariantChange={onVariantChange}
          />
        </div>
      </div>

      <ReviewProduct productId={product.id} />
      <ProductRelated productId={product.id} />
    </main>
  )
}
