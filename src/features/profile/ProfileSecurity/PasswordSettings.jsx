import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { FiChevronRight } from 'react-icons/fi'
import { RiKey2Line } from 'react-icons/ri'
import { toast } from 'sonner'
import { PanelButton } from '../../../shared/components'
import { authService, userService, useAuthStore } from '../../../entities/user'

export default function PasswordSettings({ user }) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const clearUser = useAuthStore((state) => state.clearUser)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const changePassword = useMutation({
    mutationFn: () =>
      userService.changePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      }),
    onSuccess: () => {
      clearUser()
      localStorage.setItem('logout', Date.now())
      queryClient.clear()
      toast.success('Password changed. Sign in again.')
      navigate('/login', { replace: true })
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || 'Could not change password.',
      ),
  })
  const sendSetupLink = useMutation({
    mutationFn: () => authService.forgotPassword({ email: user.email }),
    onSuccess: () =>
      toast.success('Password setup link sent. Sign out before opening it.'),
    onError: (error) =>
      toast.error(
        error.response?.data?.message || 'Could not send setup link.',
      ),
  })
  const updatedAt = user?.passwordChangedAt
    ? new Date(user.passwordChangedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null

  const submit = (event) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }
    changePassword.mutate()
  }

  return (
    <details
      className="profile-security__item"
      aria-labelledby="security-password-title"
    >
      <summary className="profile-security__summary">
        <RiKey2Line className="profile-security__icon" aria-hidden="true" />
        <span className="profile-security__label">
          <strong id="security-password-title">Password</strong>
          <span>
            {user?.hasPassword
              ? updatedAt
                ? `Last updated ${updatedAt}`
                : 'Last update unavailable'
              : 'No password set. Use password reset to create one.'}
          </span>
        </span>
        <span className="profile-security__status">
          {user?.hasPassword ? 'Change password' : 'Set password'}
        </span>
        <FiChevronRight
          className="profile-security__chevron"
          aria-hidden="true"
        />
      </summary>
      {user?.hasPassword ? (
        <form
          id="security-password-form"
          className="profile-security__password-form"
          onSubmit={submit}
        >
          <label htmlFor="security-current-password">Current password</label>
          <input
            id="security-current-password"
            type="password"
            value={oldPassword}
            onChange={(event) => setOldPassword(event.target.value)}
            autoComplete="current-password"
            minLength={6}
            required
          />
          <label htmlFor="security-new-password">New password</label>
          <input
            id="security-new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <label htmlFor="security-confirm-password">
            Confirm new password
          </label>
          <input
            id="security-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            minLength={6}
            required
          />
          <footer className="profile-security__password-actions">
            <PanelButton
              type="submit"
              label="Save password"
              loading={changePassword.isPending}
            />
          </footer>
        </form>
      ) : (
        <div className="profile-security__content">
          <button
            type="button"
            className="profile-security__action"
            onClick={() => sendSetupLink.mutate()}
            disabled={sendSetupLink.isPending || !user?.email}
          >
            {sendSetupLink.isPending ? 'Sending…' : 'Send setup link'}
          </button>
        </div>
      )}
    </details>
  )
}
