import { useEffect, useState } from 'react'
import { api } from '../api/cliente'

export default function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([])
  const [nome, setNome] = useState('')
  const [tipo, setTipo] = useState('varejo')
  const [erro, setErro] = useState(null)

  const carregar = async () => {
    try {
      setFornecedores(await api.listarFornecedores())
    } catch (e) {
      setErro(e.message)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const aoCriar = async (evento) => {
    evento.preventDefault()
    if (!nome.trim()) return
    try {
      await api.criarFornecedor({ nome: nome.trim(), tipo })
      setNome('')
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  const aoRemover = async (id) => {
    try {
      await api.removerFornecedor(id)
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="pagina">
      <h2>Fornecedores</h2>

      <form className="formulario-linha" onSubmit={aoCriar}>
        <input
          placeholder="Nome do mercado/fornecedor"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="varejo">Varejo</option>
          <option value="atacado">Atacado</option>
        </select>
        <button type="submit" className="botao-primario">
          Adicionar
        </button>
      </form>

      {erro && <p className="texto-erro">{erro}</p>}

      <ul className="lista-cartoes">
        {fornecedores.map((f) => (
          <li key={f.id} className="cartao cartao-fornecedor">
            <div>
              <strong>{f.nome}</strong>
              <div className="discreto pequeno">
                {f.tipo === 'atacado' ? 'Atacado' : 'Varejo'}
              </div>
            </div>
            <button className="botao-link perigo" onClick={() => aoRemover(f.id)}>
              Remover
            </button>
          </li>
        ))}
        {fornecedores.length === 0 && (
          <p className="discreto">Nenhum fornecedor cadastrado ainda.</p>
        )}
      </ul>
    </div>
  )
}
