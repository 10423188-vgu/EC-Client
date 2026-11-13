import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QRCodeSVG } from 'qrcode.react'
import { RiKey2Line } from 'react-icons/ri'
import { toast } from 'sonner'
import { PanelButton, RetryButton } from '../../../shared/components'
import { USER_KEYS, userService } from '../../../entities/user'
import { CopyButton } from './CopyButton'
import './TwoFactorSettings.css'

export default function TwoFactorSettings({ statusQuery }) {
  const queryClient = useQueryClient()
  const [setup, setSetup] = useState(null)
  const [setupStep, setSetupStep] = useState(0)
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState([])
  const [isDisabling, setIsDisabling] = useState(false)
  const refreshStatus = () => {
    queryClient.invalidateQueries({ queryKey: USER_KEYS.current })
    queryClient.invalidateQueries({
      queryKey: [...USER_KEYS.current, 'twoFactor'],
    })
  }
  const setupMutation = useMutation({
    mutationFn: () =>
      userService.beginTwoFactorSetup().then((response) => response.data.data),
    onSuccess: (result) => {
      setSetup(result)
      setSetupStep(1)
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Could not start setup.'),
  })
  const enableMutation = useMutation({
    mutationFn: (data) =>
      userService.enableTwoFactor(data).then((response) => response.data.data),
    onSuccess: (result) => {
      setSetup(null)
      setCode('')
      setRecoveryCodes(result.recoveryCodes)
      refreshStatus()
      toast.success('Two-factor authentication enabled.')
    },
    onError: (error) =>
      toast.error(
        error.response?.data?.message || 'Could not verify the code.',
      ),
  })
  const disableMutation = useMutation({
    mutationFn: (data) =>
      userService.disableTwoFactor(data).then((response) => response.data.data),
    onSuccess: () => {
      setCode('')
      setIsDisabling(false)
      refreshStatus()
      toast.success('Two-factor authentication disabled.')
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Could not disable 2FA.'),
  })
  const enabled = statusQuery.data?.enabled ?? false
  const isPending =
    setupMutation.isPending ||
    enableMutation.isPending ||
    disableMutation.isPending
  const normalizedCode = code.trim().toUpperCase()
  const canDisableWithCode =
    /^\d{6}$/.test(normalizedCode) || /^[A-F0-9]{16}$/.test(normalizedCode)

  const submitCode = (event) => {
    event.preventDefault()
    if (setup) {
      enableMutation.mutate({ secret: setup.secret, code: normalizedCode })
      return
    }
    disableMutation.mutate({ code: normalizedCode })
  }

  const copyRecoveryCodes = async () => {
    try {
      await navigator.clipboard.writeText(recoveryCodes.join('\n'))
      toast.success('All recovery codes copied.')
      return true
    } catch {
      toast.error(
        'Could not copy recovery codes. Copy them from the list below.',
      )
      return false
    }
  }
  const cancelDisable = () => {
    setCode('')
    setIsDisabling(false)
  }

  return (
    <section className="two-factor-settings">
      {enabled && !recoveryCodes.length && (
        <div className="two-factor-settings__toggle-row">
          <strong>Require a verification code at sign-in</strong>
          <button
            type="button"
            className="two-factor-settings__switch"
            onClick={() => setIsDisabling(true)}
            disabled={isDisabling || isPending}
            role="switch"
            aria-label="Turn off two-factor authentication"
            aria-checked={enabled}
          >
            <span className="two-factor-settings__switch-thumb" />
          </button>
        </div>
      )}

      {statusQuery.isError && (
        <div className="two-factor-settings__error" role="alert">
          <p>Could not load your security settings.</p>
          <RetryButton
            onClick={() => statusQuery.refetch()}
            loading={statusQuery.isFetching}
          />
        </div>
      )}

      {enabled && !recoveryCodes.length ? (
        isDisabling && (
          <form
            id="two-factor-disable-form"
            className="two-factor-settings__form"
            onSubmit={submitCode}
          >
            <p>
              2FA is protecting your sign-in. Enter a current authenticator code
              or an unused recovery code to turn it off.
            </p>
            <label htmlFor="two-factor-disable-code">Verification code</label>
            <input
              id="two-factor-disable-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              inputMode="text"
              maxLength={16}
              required
              autoFocus
            />
            <div className="two-factor-settings__actions">
              <PanelButton
                variant="cancel"
                label="Cancel"
                onClick={cancelDisable}
                disabled={isPending}
              />
              <PanelButton
                variant="danger"
                type="submit"
                label="Confirm disable"
                disabled={isPending || !canDisableWithCode}
              />
            </div>
          </form>
        )
      ) : recoveryCodes.length > 0 ? (
        <div className="two-factor-settings__recovery" role="status">
          <header className="two-factor-settings__recovery-header">
            <span
              className="two-factor-settings__recovery-icon"
              aria-hidden="true"
            >
              <RiKey2Line />
            </span>
            <strong>Save your recovery codes</strong>
            <CopyButton onClick={copyRecoveryCodes}>Copy all codes</CopyButton>
          </header>
          <p>
            Use one code to sign in if you lose your authenticator app. Save
            them now; this list won’t appear again.
          </p>
          <ul className="two-factor-settings__recovery-list">
            {recoveryCodes.map((recoveryCode) => (
              <li key={recoveryCode}>
                <code>{recoveryCode}</code>
              </li>
            ))}
          </ul>
          <footer className="two-factor-settings__recovery-footer">
            <PanelButton
              label="I saved these codes"
              onClick={() => setRecoveryCodes([])}
            />
          </footer>
        </div>
      ) : setup ? (
        <>
          {setupStep === 1 ? (
            <div className="two-factor-settings__form">
              <p>
                Scan this QR code with your authenticator app. If you cannot
                scan it, enter the setup key manually.
              </p>
              <div className="two-factor-settings__setup-card">
                <div className="two-factor-settings__qr">
                  <QRCodeSVG
                    value={setup.otpauthUri}
                    size={200}
                    level="M"
                    marginSize={2}
                    title="Scan to add two-factor authentication"
                  />
                </div>
                <div className="two-factor-settings__setup-details">
                  <label htmlFor="two-factor-setup-key">Setup key</label>
                  <code
                    id="two-factor-setup-key"
                    className="two-factor-settings__secret"
                  >
                    {setup.secret}
                  </code>
                  <details className="two-factor-settings__manual-setup">
                    <summary>Show manual setup URI</summary>
                    <code>{setup.otpauthUri}</code>
                  </details>
                </div>
              </div>
              <div className="two-factor-settings__actions">
                <PanelButton
                  variant="cancel"
                  label="Cancel"
                  onClick={() => {
                    setSetup(null)
                    setSetupStep(0)
                  }}
                />
                <PanelButton label="Continue" onClick={() => setSetupStep(2)} />
              </div>
            </div>
          ) : (
            <form className="two-factor-settings__form" onSubmit={submitCode}>
              <p>Enter the six-digit code currently shown in your app.</p>
              <label htmlFor="two-factor-setup-code">Authenticator code</label>
              <input
                id="two-factor-setup-code"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={6}
                required
              />
              <div className="two-factor-settings__actions">
                <PanelButton
                  variant="cancel"
                  label="Back"
                  onClick={() => setSetupStep(1)}
                  disabled={isPending}
                />
                <PanelButton
                  type="submit"
                  label="Verify and enable"
                  disabled={isPending || !/^\d{6}$/.test(normalizedCode)}
                />
              </div>
            </form>
          )}
        </>
      ) : (
        <>
          <div className="two-factor-settings__intro">
            <strong>Before you begin</strong>
            <p>
              Install an authenticator app such as Google Authenticator,
              Microsoft Authenticator, or 1Password. You’ll connect it with a
              setup key and verify one code.
            </p>
          </div>
          <PanelButton
            label="Continue setup"
            onClick={() => setupMutation.mutate()}
            loading={setupMutation.isPending}
            disabled={statusQuery.isLoading || statusQuery.isError}
          />
        </>
      )}
    </section>
  )
}
