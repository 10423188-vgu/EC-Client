import { HomeHero, HomeIntro, HomeFeatures, useHome } from '../../features/home'
import { ProductCard } from '../../features/product'
export default function HomePage() {
  const { categories, featuredProducts } = useHome()
  return (
    <main className="home">
      <HomeHero />
      <HomeIntro categoriesQuery={categories} />
      <HomeFeatures
        featuredProductsQuery={featuredProducts}
        renderProduct={(product, isWishlisted) => (
          <ProductCard product={product} isWishlisted={isWishlisted} />
        )}
      />
    </main>
  )
}
