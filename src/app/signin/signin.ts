import { api } from '@/lib/api'
import { LoginRequest, LoginResponse } from '@/types/auth'

export const login = async (payload: LoginRequest): Promise<LoginResponse> => {
  const res = await api.post<LoginResponse>('<nextApi>/auth/login', payload)
  return res.data
}