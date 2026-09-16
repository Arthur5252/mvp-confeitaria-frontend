import { createContext, useContext, useMemo, useState } from 'react'
import { api, getToken, setToken } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken())

  const login = async (username, password) => {
    const data = await api.login(username, password)
    setToken(data.access_token)
    setTokenState(data.access_token)
  }

  const logout = () => {
    setToken(null)
    setTokenState(null)
  }

  const value = useMemo(
    () => ({ isAuthenticated: Boolean(token), login, logout }),
    [token]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
