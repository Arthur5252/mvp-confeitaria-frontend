import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/cliente'

function formatarData(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function ListasCompras() {
  const [listas, setListas] = useState([])
  const [nome, setNome] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const carregar = async () => {
    setCarregando(true)
    try {
      const dados = await api.listarListasCompras()
      setListas(dados)
    } catch (e) {
      setErro(e.message)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  const aoCriar = async (evento) => {
    evento.preventDefault()
    if (!nome.trim()) return
    try {
      await api.criarListaCompras(nome.trim())
      setNome('')
      carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  return (
    <div className="pagina">
      <h2>Listas de compras</h2>

      <form className="formulario-linha" onSubmit={aoCriar}>
        <input
          placeholder="Nova lista (ex.: Compras da semana)"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button type="submit" className="botao-primario">
          Criar
        </button>
      </form>

      {erro && <p className="texto-erro">{erro}</p>}
      {carregando && <p className="discreto">Carregando...</p>}

      <ul className="lista-cartoes">
        {listas.map((lista) => {
          const total = lista.itens.length
          const concluidos = lista.itens.filter((i) => i.marcado_em).length
          return (
            <li key={lista.id}>
              <Link to={`/listas/${lista.id}`} className="cartao cartao-lista">
                <div>
                  <strong>{lista.nome}</strong>
                  <div className="discreto pequeno">{formatarData(lista.criado_em)}</div>
                </div>
                <div className="progresso-lista">
                  <span
                    className={`selo ${
                      lista.status === 'concluida' ? 'selo-sucesso' : 'selo-aberta'
                    }`}
                  >
                    {lista.status === 'concluida' ? 'Concluída' : 'Aberta'}
                  </span>
                  <span className="discreto pequeno">
                    {concluidos}/{total} itens
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
        {!carregando && listas.length === 0 && (
          <p className="discreto">Nenhuma lista ainda. Crie a primeira acima.</p>
        )}
      </ul>
    </div>
  )
}
