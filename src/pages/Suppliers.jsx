import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [name, setName] = useState('')
  const [type, setType] = useState('varejo')
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setSuppliers(await api.listSuppliers())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    try {
      await api.createSupplier({ name: name.trim(), type })
      setName('')
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteSupplier(id)
      load()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="page">
      <h2>Fornecedores</h2>

      <form className="inline-form" onSubmit={handleCreate}>
        <input
          placeholder="Nome do mercado/fornecedor"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="varejo">Varejo</option>
          <option value="atacado">Atacado</option>
        </select>
        <button type="submit" className="primary-button">
          Adicionar
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <ul className="card-list">
        {suppliers.map((s) => (
          <li key={s.id} className="card supplier-card">
            <div>
              <strong>{s.name}</strong>
              <div className="muted small">
                {s.type === 'atacado' ? 'Atacado' : 'Varejo'}
              </div>
            </div>
            <button className="link-button danger" onClick={() => handleDelete(s.id)}>
              Remover
            </button>
          </li>
        ))}
        {suppliers.length === 0 && (
          <p className="muted">Nenhum fornecedor cadastrado ainda.</p>
        )}
      </ul>
    </div>
  )
}
