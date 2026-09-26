import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutenticacao } from '../contexto/ContextoAutenticacao'

export default function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState(null)
  const [carregando, setCarregando] = useState(false)
  const { entrar } = useAutenticacao()
  const navegar = useNavigate()

  const aoEnviar = async (evento) => {
    evento.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      await entrar(usuario, senha)
      navegar('/listas', { replace: true })
    } catch (e) {
      setErro(e.message || 'Falha no login')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="pagina-centralizada">
      <form className="cartao cartao-login" onSubmit={aoEnviar}>
        <h1>🧁 Confeitaria</h1>
        <p className="discreto">Gestão de compras e comparação de preços</p>

        <label htmlFor="usuario">Usuário</label>
        <input
          id="usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="senha">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          autoComplete="current-password"
          required
        />

        {erro && <p className="texto-erro">{erro}</p>}

        <button type="submit" className="botao-primario" disabled={carregando}>
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
