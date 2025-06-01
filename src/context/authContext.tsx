// context/AuthContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { LoginResponse } from '@/types/auth'

type AuthContextType = {
  user: LoginResponse['user'] | null
  setUser: (user: LoginResponse['user'] | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null)

  // Optional: load user from API or cookie
  useEffect(() => {
    // fetchUser().then(setUser)
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
