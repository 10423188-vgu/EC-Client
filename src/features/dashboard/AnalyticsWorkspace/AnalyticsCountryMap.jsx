import { useMemo, useState } from 'react'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { feature } from 'topojson-client'
import * as countries from 'i18n-iso-countries'
import englishCountries from 'i18n-iso-countries/langs/en.json'
import world from 'world-atlas/countries-110m.json'
import { formatLib } from '../../../shared/utils'
import { Tooltip } from '../../../shared/components'

const worldCountries = feature(world, world.objects.countries).features
countries.registerLocale(englishCountries)

export default function AnalyticsCountryMap({ countrySales }) {
  const [activeCountry, setActiveCountry] = useState(null)
  const hasSales = countrySales.length > 0
  const salesByCountry = useMemo(
    () =>
      new Map(
        countrySales.map((country) => [
          countries.alpha2ToNumeric(country.countryCode.toUpperCase()),
          country,
        ]),
      ),
    [countrySales],
  )
  const maxRevenue = Math.max(
    0,
    ...countrySales.map((country) => country.revenue),
  )
  const totalRevenue = countrySales.reduce(
    (sum, country) => sum + country.revenue,
    0,
  )
  const topCountries = [...countrySales]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return (
    <article
      className={`analytics-workspace__panel analytics-workspace__panel--countries${hasSales ? '' : ' analytics-workspace__panel--countries-empty'}`}
    >
      <header className="analytics-workspace__panel-header">
        <div>
          <h3>Gross sales by country</h3>
          <p>Gross paid amount by shipping destination; refunds not deducted</p>
        </div>
        <span>{countrySales.length} countries</span>
      </header>
      <div
        className="analytics-workspace__country-map"
        role="group"
        aria-label={`World map showing sales in ${countrySales.length} countries`}
      >
        <Tooltip
          mode="content"
          active={Boolean(activeCountry)}
          contentRole="status"
          contentClassName="analytics-workspace__map-tooltip"
        >
          {activeCountry && (
            <>
              <strong>
                {countries.getName(activeCountry.countryCode, 'en') ??
                  activeCountry.countryCode}
              </strong>
              <span>{formatLib.vnd(activeCountry.revenue)}</span>
              <span>{activeCountry.orders} orders</span>
            </>
          )}
        </Tooltip>
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 145 }}
        >
          <Geographies geography={worldCountries}>
            {({ geographies }) =>
              geographies.map((geography) => {
                const sale = salesByCountry.get(geography.id)
                const intensity = sale?.revenue / maxRevenue || 0
                return (
                  <Geography
                    key={geography.rsmKey}
                    geography={geography}
                    fill={
                      sale
                        ? 'var(--color-primary-hover)'
                        : 'var(--color-border-cream)'
                    }
                    fillOpacity={sale ? 0.3 + intensity * 0.7 : 1}
                    stroke="var(--color-surface-cream)"
                    strokeWidth={0.45}
                    tabIndex={sale ? 0 : -1}
                    onMouseEnter={() => sale && setActiveCountry(sale)}
                    onMouseLeave={() => setActiveCountry(null)}
                    onFocus={() => sale && setActiveCountry(sale)}
                    onBlur={() => setActiveCountry(null)}
                    title={
                      sale
                        ? `${countries.getName(sale.countryCode, 'en')}: ${formatLib.vnd(sale.revenue)} · ${sale.orders} orders`
                        : geography.properties.name
                    }
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>
      <div className="analytics-workspace__country-summary">
        <div className="analytics-workspace__country-total">
          <span>Mapped revenue</span>
          <strong>{formatLib.vnd(totalRevenue)}</strong>
        </div>
        {hasSales ? (
          <ol className="analytics-workspace__country-list">
            {topCountries.map((country) => (
              <li key={country.countryCode}>
                <span>
                  {countries.getName(country.countryCode, 'en') ??
                    country.countryCode}
                </span>
                <strong>{formatLib.vnd(country.revenue)}</strong>
              </li>
            ))}
          </ol>
        ) : (
          <p className="analytics-workspace__country-note">
            No paid orders with a saved shipping country in this period.
          </p>
        )}
      </div>
    </article>
  )
}
