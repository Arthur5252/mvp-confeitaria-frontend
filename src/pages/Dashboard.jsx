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
import { api } from '../api/client'

function formatDateShort(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [productId, setProductId] = useState('')
  const [comparison, setComparison] = useState([])
  const [history, setHistory] = useState([])
  const [insights, setInsights] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    api
      .listProducts()
      .then((data) => {
        setProducts(data)
        if (data.length > 0) setProductId(String(data[0].id))
      })
      .catch((err) => setError(err.message))
    api.insights().then(setInsights).catch(() => {})
  }, [])

  useEffect(() => {
    if (!productId) return
    api
      .priceComparison(productId)
      .then(setComparison)
      .catch((err) => setError(err.message))
    api
      .priceHistory(productId)
      .then((data) =>
        setHistory(data.map((d) => ({ ...d, label: formatDateShort(d.captured_at) })))
      )
      .catch((err) => setError(err.message))
  }, [productId])

  return (
    <div className="page">
      <h2>Dashboard</h2>

      {insights.length > 0 && (
        <div className="insights-row">
          {insights.map((i, idx) => (
            <div key={idx} className="card insight-card">
              <strong>{i.title}</strong>
              <p className="muted small">{i.description}</p>
            </div>
          ))}
        </div>
      )}

      <label>Produto</label>
      <select value={productId} onChange={(e) => setProductId(e.target.value)}>
        {products.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {error && <p className="error-text">{error}</p>}
      {products.length === 0 && (
        <p className="muted">
          Nenhum produto ainda — escaneie etiquetas para começar a popular o dashboard.
        </p>
      )}

      {productId && (
        <>
          <h3>Comparação entre fornecedores</h3>
          {comparison.length === 0 ? (
            <p className="muted small">Sem registros de preço para este produto.</p>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={comparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="supplier_name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Bar dataKey="price" fill="#7c3f58" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <h3>Variação de preço no tempo</h3>
          {history.length === 0 ? (
            <p className="muted small">Sem histórico suficiente ainda.</p>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                  <Line
                    type="monotone"
                    dataKey="price"
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
