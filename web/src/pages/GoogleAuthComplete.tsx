import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as authApi from '../api/authApi'
import { setToken } from '../api/client'
import { useAuth } from '../context/AuthContext'

export function GoogleAuthComplete() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { completeLogin } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(!token)
  const ran = useRef(false)

  useEffect(() => {
    if (ran.current || !token) return
    ran.current = true

    setToken(token)
    authApi
      .me()
      .then((res) => {
        completeLogin(token, res.user)
        navigate('/dashboard', { replace: true })
      })
      .catch(() => setError(true))
  }, [token, completeLogin, navigate])

  if (error) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="mb-4 text-2xl">Sign-in failed</h1>
        <p className="text-brand-muted">Something went wrong signing you in with Google. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-6 py-24 text-center">
      <p className="text-brand-muted">Signing you in…</p>
    </div>
  )
}
