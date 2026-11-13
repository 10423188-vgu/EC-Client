import { formatDateTime, formatStatus } from './orderDetails.utils'

export default function OrderHistory({ entries = [], totalEntries }) {
  return (
    <section className="order-details__tracking">
      <header>
        <h4>Status tracking</h4>
      </header>
      {totalEntries > entries.length && (
        <p className="order-details__history-limit">
          Showing the latest {entries.length} of {totalEntries} updates.
        </p>
      )}
      {!entries.length && (
        <p className="order-details__message">No history recorded.</p>
      )}
      <div className="order-details__history">
        {entries.map((entry, index) => (
          <article key={entry.id} style={{ '--tracking-index': index }}>
            <strong>
              {formatStatus(entry.fromStatus)} → {formatStatus(entry.toStatus)}
            </strong>
            <div className="order-details__history-meta">
              <span>
                {entry.changedBy
                  ? `${entry.changedBy.name} (${entry.changedBy.role})`
                  : 'System'}
              </span>
              <time>{formatDateTime(entry.createdAt)}</time>
            </div>
            {entry.reason && <p>Reason: {entry.reason}</p>}
          </article>
        ))}
      </div>
    </section>
  )
}
