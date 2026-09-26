import { createContext, useContext, useMemo, useState } from 'react'
import { api, obterToken, definirToken } from '../api/cliente'

const ContextoAutenticacao = createContext(null)

export function ProvedorAutenticacao({ children }) {
  const [token, setToken] = useState(() => obterToken())

  const entrar = async (usuario, senha) => {
    const dados = await api.entrar(usuario, senha)
    definirToken(dados.token_acesso)
    setToken(dados.token_acesso)
  }

  const sair = () => {
    definirToken(null)
    setToken(null)
  }

  const valor = useMemo(
    () => ({ estaAutenticado: Boolean(token), entrar, sair }),
    [token]
  )

  return (
    <ContextoAutenticacao.Provider value={valor}>{children}</ContextoAutenticacao.Provider>
  )
}

export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao)
  if (!contexto) throw new Error('useAutenticacao deve ser usado dentro de ProvedorAutenticacao')
  return contexto
}
