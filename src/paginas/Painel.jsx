import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { api } from '../api/cliente'

function formatarDataCurta(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function Painel() {
  const [produtos, setProdutos] = useState([])
  const [produtoId, setProdutoId] = useState('')
  const [comparacao, setComparacao] = useState([])
  const [historico, setHistorico] = useState([])
  const [destaques, setDestaques] = useState([])
  const [erro, setErro] = useState(null)

  useEffect(() => {
    // Não pré-seleciona um produto automaticamente: com muitos produtos
    // cadastrados (cada etiqueta escaneada pode virar um produto novo), o
    // "primeiro da lista" raramente é o que a pessoa quer comparar, e
    // escolher por ela silenciosamente só confundia.
    api.listarProdutos().then(setProdutos).catch((e) => setErro(e.message))
    api.destaques().then(setDestaques).catch(() => {})
  }, [])

  useEffect(() => {
    if (!produtoId) return
    api
      .comparacaoPrecos(produtoId)
      .then(setComparacao)
      .catch((e) => setErro(e.message))
    api
      .historicoPrecos(produtoId)
      .then((dados) =>
        setHistorico(dados.map((d) => ({ ...d, rotulo: formatarDataCurta(d.capturado_em) })))
      )
      .catch((e) => setErro(e.message))
  }, [produtoId])

  return (
    <div className="pagina">
      <h2>Painel</h2>

      {destaques.length > 0 && (
        <div className="linha-destaques">
          {destaques.map((d, indice) => (
            <div key={indice} className="cartao cartao-destaque">
              <strong>{d.titulo}</strong>
              <p className="discreto pequeno">{d.descricao}</p>
            </div>
          ))}
        </div>
      )}

      <label>Produto</label>
      <select value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
        <option value="">Selecione um produto...</option>
        {produtos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nome}
          </option>
        ))}
      </select>

      {erro && <p className="texto-erro">{erro}</p>}
      {produtos.length === 0 && (
        <p className="discreto">
          Nenhum produto ainda — escaneie etiquetas para começar a popular o painel.
        </p>
      )}
      {produtos.length > 0 && !produtoId && (
        <p className="discreto">Escolha um produto acima para ver os gráficos.</p>
      )}

      {produtoId && (
        <>
          <h3>Comparação entre fornecedores</h3>
          {comparacao.length === 0 ? (
            <p className="discreto pequeno">Sem registros de preço para este produto.</p>
          ) : (
            <div className="envolvedor-grafico">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={comparacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fornecedor_nome" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(valor) => `R$ ${Number(valor).toFixed(2)}`} />
                  <Bar dataKey="preco" fill="#7c3f58" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <h3>Variação de preço no tempo</h3>
          {historico.length === 0 ? (
            <p className="discreto pequeno">Sem histórico suficiente ainda.</p>
          ) : (
            <div className="envolvedor-grafico">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={historico}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rotulo" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(valor) => `R$ ${Number(valor).toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="preco"
                    stroke="#7c3f58"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}
