import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function ShoppingLists() {
  const [lists, setLists] = useState([])
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await api.listShoppingLists()
      setLists(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    try {
      await api.createShoppingList(name.trim())
      setName('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>Listas de compras</h2>

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          placeholder="Nova lista (ex.: Compras da semana)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="primary-button">
          Criar
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}
      {loading && <p className="muted">Carregando...</p>}

      <ul className="card-list">
        {lists.map((list) => {
          const total = list.items.length
          const done = list.items.filter((i) => i.checked_at).length
          return (
            <li key={list.id}>
              <Link to={`/lists/${list.id}`} className="card list-card">
                <div>
                  <strong>{list.name}</strong>
                  <div className="muted small">{formatDate(list.created_at)}</div>
                </div>
                <div className="list-progress">
                  <span
                    className={`badge ${
                      list.status === 'concluida' ? 'badge-success' : 'badge-open'
                    }`}
                  >
                    {list.status === 'concluida' ? 'Concluída' : 'Aberta'}
                  </span>
                  <span className="muted small">
                    {done}/{total} itens
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
        {!loading && lists.length === 0 && (
          <p className="muted">Nenhuma lista ainda. Crie a primeira acima.</p>
        )}
      </ul>
    </div>
  )
}
