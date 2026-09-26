import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/cliente'

export default function DetalheListaCompras() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [lista, setLista] = useState(null)
  const [produtos, setProdutos] = useState([])
  const [nomeItem, setNomeItem] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [unidade, setUnidade] = useState('un')
  const [erro, setErro] = useState(null)
  const [ocupado, setOcupado] = useState(false)

  const carregar = async () => {
    try {
      const [dadosLista, dadosProdutos] = await Promise.all([
        api.obterListaCompras(id),
        api.listarProdutos(),
      ])
      setLista(dadosLista)
      setProdutos(dadosProdutos)
    } catch (e) {
      setErro(e.message)
    }
  }

  useEffect(() => {
    carregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const resolverProdutoId = async (nome) => {
    const existente = produtos.find(
      (p) => p.nome.trim().toLowerCase() === nome.trim().toLowerCase()
    )
    if (existente) return existente.id
    const criado = await api.criarProduto({ nome: nome.trim(), unidade_padrao: unidade })
    setProdutos((anteriores) => [...anteriores, criado])
    return criado.id
  }

  const aoAdicionarItem = async (evento) => {
    evento.preventDefault()
    if (!nomeItem.trim()) return
    setOcupado(true)
    setErro(null)
    try {
      const produtoId = await resolverProdutoId(nomeItem)
      await api.adicionarItem(id, {
        produto_id: produtoId,
        quantidade_desejada: Number(quantidade),
        unidade,
      })
      setNomeItem('')
      setQuantidade(1)
      await carregar()
    } catch (e) {
      setErro(e.message)
    } finally {
      setOcupado(false)
    }
  }

  const alternarItem = async (item) => {
    try {
      await api.atualizarItem(id, item.id, { marcado: !item.marcado_em })
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  const removerItem = async (item) => {
    try {
      await api.removerItem(id, item.id)
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  const nomeProduto = (produtoId) =>
    produtos.find((p) => p.id === produtoId)?.nome || 'Item'

  const marcarConcluida = async () => {
    try {
      await api.atualizarListaCompras(id, { status: 'concluida' })
      await carregar()
    } catch (e) {
      setErro(e.message)
    }
  }

  if (!lista)
    return (
      <div className="pagina">
        {erro ? <p className="texto-erro">{erro}</p> : 'Carregando...'}
      </div>
    )

  return (
    <div className="pagina">
      <button className="botao-link" onClick={() => navegar('/listas')}>
        ← Voltar
      </button>
      <h2>{lista.nome}</h2>

      {lista.status === 'aberta' && (
        <button className="botao-secundario" onClick={marcarConcluida}>
          Marcar lista como concluída
        </button>
      )}

      <form className="formulario-linha formulario-item" onSubmit={aoAdicionarItem}>
        <input
          list="sugestoes-produtos"
          placeholder="Nome do item (ex.: Farinha de trigo)"
          value={nomeItem}
          onChange={(e) => setNomeItem(e.target.value)}
        />
        <datalist id="sugestoes-produtos">
          {produtos.map((p) => (
            <option key={p.id} value={p.nome} />
          ))}
        </datalist>
        <input
          type="number"
          min="0"
          step="0.5"
          value={quantidade}
          onChange={(e) => setQuantidade(e.target.value)}
          className="campo-quantidade"
        />
        <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
          <option value="un">un</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="ml">ml</option>
          <option value="pacote">pacote</option>
          <option value="caixa">caixa</option>
        </select>
        <button type="submit" className="botao-primario" disabled={ocupado}>
          Adicionar
        </button>
      </form>

      {erro && <p className="texto-erro">{erro}</p>}

      <ul className="lista-verificacao">
        {lista.itens.map((item) => (
          <li key={item.id} className={item.marcado_em ? 'marcado' : ''}>
            <label className="rotulo-verificacao">
              <input
                type="checkbox"
                checked={Boolean(item.marcado_em)}
                onChange={() => alternarItem(item)}
              />
              <span>
                {nomeProduto(item.produto_id)} — {item.quantidade_desejada} {item.unidade}
              </span>
            </label>
            <div className="acoes-verificacao">
              <button
                className="botao-link"
                onClick={() =>
                  navegar(
                    `/escanear?listaId=${id}&itemId=${item.id}&produtoId=${item.produto_id}`
                  )
                }
              >
                📷 Escanear
              </button>
              <button className="botao-link perigo" onClick={() => removerItem(item)}>
                Remover
              </button>
            </div>
          </li>
        ))}
        {lista.itens.length === 0 && (
          <p className="discreto">Nenhum item ainda. Adicione o primeiro acima.</p>
        )}
      </ul>
    </div>
  )
}
