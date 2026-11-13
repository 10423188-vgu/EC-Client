import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FiChevronRight } from 'react-icons/fi'
import { RiComputerLine, RiShieldLine, RiSmartphoneLine } from 'react-icons/ri'
import { toast } from 'sonner'
import { authService, useLogout } from '../../../entities/user'
import { RetryButton } from '../../../shared/components'

const sessionKey = ['activeSessions']

const sessionDateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatSessionDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown'
    : sessionDateFormatter.format(date)
}

export default function ActiveSessions() {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const logout = useLogout()
  const sessionsQuery = useQuery({
    queryKey: sessionKey,
    queryFn: () =>
      authService.getSessions().then((response) => response.data.data),
    enabled: isOpen,
  })
  const revokeSession = useMutation({
    mutationFn: authService.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKey })
      toast.success('Session revoked.')
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Could not revoke session.'),
  })
  const revokeOthers = useMutation({
    mutationFn: authService.revokeOtherSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sessionKey })
      toast.success('Other sessions revoked.')
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || 'Could not revoke sessions.',
      ),
  })
  const sessions = sessionsQuery.data ?? []
  const hasOtherSessions = sessions.some((session) => !session.current)

  return (
    <details
      className="profile-security__item"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      aria-labelledby="security-sessions-title"
    >
      <summary className="profile-security__summary">
        <RiShieldLine className="profile-security__icon" aria-hidden="true" />
        <span className="profile-security__label">
          <strong id="security-sessions-title">Active sessions</strong>
          <span>Manage devices signed in to your account</span>
        </span>
        <FiChevronRight
          className="profile-security__chevron"
          aria-hidden="true"
        />
      </summary>
      <div className="profile-security__session-content">
        {sessionsQuery.isLoading && (
          // why: the authenticated current session is always present.
          <article
            className="profile-security__session"
            role="status"
            aria-busy="true"
            aria-label="Active sessions loading"
          >
            <div className="skeleton profile-security__session-skeleton-icon" />
            <div className="profile-security__session-details">
              <div className="skeleton profile-security__session-skeleton-line profile-security__session-skeleton-line--title" />
              <div className="skeleton profile-security__session-skeleton-line" />
              <div className="skeleton profile-security__session-skeleton-line" />
            </div>
            <div className="skeleton profile-security__session-skeleton-action" />
          </article>
        )}
        {sessionsQuery.isError && (
          <div role="alert">
            <p>
              {sessionsQuery.data
                ? 'Could not refresh your sessions. Showing saved sessions.'
                : 'Could not load your sessions.'}
            </p>
            <RetryButton
              onClick={() => sessionsQuery.refetch()}
              loading={sessionsQuery.isFetching}
            />
          </div>
        )}
        {sessions.map((session) => {
          const DeviceIcon = /iPhone|iPad|Android/.test(session.device)
            ? RiSmartphoneLine
            : RiComputerLine
          return (
            <article key={session.id} className="profile-security__session">
              <DeviceIcon
                className="profile-security__session-icon"
                aria-hidden="true"
              />
              <div className="profile-security__session-details">
                <strong>{session.device}</strong>
                <span>Signed in: {formatSessionDate(session.createdAt)}</span>
                <span>
                  Last active: {formatSessionDate(session.lastSeenAt)}
                </span>
              </div>
              {session.current ? (
                <span className="profile-security__current-badge">Current</span>
              ) : (
                <button
                  type="button"
                  className="profile-security__revoke"
                  onClick={() => revokeSession.mutate(session.id)}
                  disabled={revokeSession.isPending || revokeOthers.isPending}
                >
                  Revoke
                </button>
              )}
            </article>
          )
        })}
        {sessions.some((session) => session.current) && (
          <footer className="profile-security__session-footer">
            {hasOtherSessions && (
              <button
                type="button"
                className="profile-security__revoke"
                onClick={() => revokeOthers.mutate()}
                disabled={revokeSession.isPending || revokeOthers.isPending}
              >
                Revoke all other sessions
              </button>
            )}
            <button
              type="button"
              className="profile-security__revoke"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
            >
              Log out of this session
            </button>
          </footer>
        )}
      </div>
    </details>
  )
}
