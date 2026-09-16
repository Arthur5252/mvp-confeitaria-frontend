import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api/client'

export default function ShoppingListDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [products, setProducts] = useState([])
  const [itemName, setItemName] = useState('')
  const [qty, setQty] = useState(1)
  const [unit, setUnit] = useState('un')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const [listData, productData] = await Promise.all([
        api.getShoppingList(id),
        api.listProducts(),
      ])
      setList(listData)
      setProducts(productData)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const resolveProductId = async (name) => {
    const existing = products.find(
      (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
    )
    if (existing) return existing.id
    const created = await api.createProduct({ name: name.trim(), canonical_unit: unit })
    setProducts((prev) => [...prev, created])
    return created.id
  }

  const handleAddItem = async (event) => {
    event.preventDefault()
    if (!itemName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const productId = await resolveProductId(itemName)
      await api.addItem(id, { product_id: productId, desired_qty: Number(qty), unit })
      setItemName('')
      setQty(1)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleItem = async (item) => {
    try {
      await api.updateItem(id, item.id, { checked: !item.checked_at })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const removeItem = async (item) => {
    try {
      await api.deleteItem(id, item.id)
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  const productName = (productId) =>
    products.find((p) => p.id === productId)?.name || 'Item'

  const markCompleted = async () => {
    try {
      await api.updateShoppingList(id, { status: 'concluida' })
      await load()
    } catch (err) {
      setError(err.message)
    }
  }

  if (!list) return <div className="page">{error ? <p className="error-text">{error}</p> : 'Carregando...'}</div>

  return (
    <div className="page">
      <button className="link-button" onClick={() => navigate('/lists')}>
        ← Voltar
      </button>
      <h2>{list.name}</h2>

      {list.status === 'aberta' && (
        <button className="secondary-button" onClick={markCompleted}>
          Marcar lista como concluída
        </button>
      )}

      <form className="inline-form item-form" onSubmit={handleAddItem}>
        <input
          list="product-suggestions"
          placeholder="Nome do item (ex.: Farinha de trigo)"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <datalist id="product-suggestions">
          {products.map((p) => (
            <option key={p.id} value={p.name} />
          ))}
        </datalist>
        <input
          type="number"
          min="0"
          step="0.5"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="qty-input"
        />
        <select value={unit} onChange={(e) => setUnit(e.target.value)}>
          <option value="un">un</option>
          <option value="kg">kg</option>
          <option value="g">g</option>
          <option value="L">L</option>
          <option value="ml">ml</option>
          <option value="pacote">pacote</option>
          <option value="caixa">caixa</option>
        </select>
        <button type="submit" className="primary-button" disabled={busy}>
          Adicionar
        </button>
      </form>

      {error && <p className="error-text">{error}</p>}

      <ul className="checklist">
        {list.items.map((item) => (
          <li key={item.id} className={item.checked_at ? 'checked' : ''}>
            <label className="checklist-label">
              <input
                type="checkbox"
                checked={Boolean(item.checked_at)}
                onChange={() => toggleItem(item)}
              />
              <span>
                {productName(item.product_id)} — {item.desired_qty} {item.unit}
              </span>
            </label>
            <div className="checklist-actions">
              <button
                className="link-button"
                onClick={() =>
                  navigate(`/scan?listId=${id}&itemId=${item.id}&productId=${item.product_id}`)
                }
              >
                📷 Escanear
              </button>
              <button className="link-button danger" onClick={() => removeItem(item)}>
                Remover
              </button>
            </div>
          </li>
        ))}
        {list.items.length === 0 && (
          <p className="muted">Nenhum item ainda. Adicione o primeiro acima.</p>
        )}
      </ul>
    </div>
  )
}
