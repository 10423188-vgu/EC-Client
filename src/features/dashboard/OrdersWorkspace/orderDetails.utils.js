export const formatDateTime = (value, fallback = 'Not recorded') =>
  value
    ? new Date(value).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : fallback

export const formatStatus = (value) =>
  value?.replaceAll('_', ' ') ?? 'Not recorded'
