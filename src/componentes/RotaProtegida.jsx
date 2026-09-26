import { Navigate } from 'react-router-dom'
import { useAutenticacao } from '../contexto/ContextoAutenticacao'

export default function RotaProtegida({ children }) {
  const { estaAutenticado } = useAutenticacao()
  if (!estaAutenticado) return <Navigate to="/entrar" replace />
  return children
}
