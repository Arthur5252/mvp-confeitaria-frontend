import { Outlet } from 'react-router-dom'
import NavegacaoInferior from './NavegacaoInferior'
import { useAutenticacao } from '../contexto/ContextoAutenticacao'

export default function Estrutura() {
  const { sair } = useAutenticacao()

  return (
    <div className="estrutura-app">
      <header className="cabecalho-app">
        <span className="titulo-app">🧁 Confeitaria</span>
        <button className="botao-link" onClick={sair}>
          Sair
        </button>
      </header>
      <main className="conteudo-app">
        <Outlet />
      </main>
      <NavegacaoInferior />
    </div>
  )
}
