'use client'

import { useState } from 'react'
import { LoginRequest } from '@/types/auth'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login } from './signin'

export default function SignInPage() {
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      await login(form)
      window.location.href = '/'
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-sm space-y-4">
        <h1>Sign In</h1>
        <Input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <Input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />
        {error && <p className="text-destructed text-sm">{error}</p>}
        <Button onClick={handleSubmit} disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </div>
    </div>
  )
}
