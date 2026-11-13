import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim()
export default function GoogleSignIn({ disabled, onError, onSuccess }) {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <div
        className={`auth-card__google-control${disabled ? ' auth-card__google-control--disabled' : ''}`}
        inert={disabled}
      >
        <GoogleLogin
          size="large"
          text="signin"
          theme="outline"
          width="100%"
          onError={onError}
          onSuccess={onSuccess}
        />
      </div>
    </GoogleOAuthProvider>
  )
}
