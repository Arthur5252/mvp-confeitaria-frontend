import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/client'

export default function ScanLabel() {
  const [searchParams] = useSearchParams()
  const listId = searchParams.get('listId')
  const itemId = searchParams.get('itemId')
  const preselectedProductId = searchParams.get('productId')
  const navigate = useNavigate()

  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState(null)
  const [suppliers, setSuppliers] = useState([])
  const [supplierId, setSupplierId] = useState('')
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [minQuantity, setMinQuantity] = useState(1)
  const [unit, setUnit] = useState('un')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api
      .listSuppliers()
      .then((data) => {
        setSuppliers(data)
        if (data.length > 0) setSupplierId(String(data[0].id))
      })
      .catch((err) => setError(err.message))
  }, [])

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setSaved(false)
    setScanning(true)
    setError(null)
    try {
      const data = await api.scanLabel(file)
      setResult(data)
      setName(data.guessed_name || '')
      setPrice(data.guessed_price != null ? String(data.guessed_price) : '')
      setMinQuantity(data.guessed_min_quantity || 1)
      setUnit(data.guessed_unit || 'un')
    } catch (err) {
      setError(err.message)
    } finally {
      setScanning(false)
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()
    if (!supplierId || !price || !name.trim()) {
      setError('Preencha nome, preço e fornecedor.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      let productId = preselectedProductId ? Number(preselectedProductId) : null
      if (!productId) {
        const existing = await api.listProducts(name.trim())
        const match = existing.find(
          (p) => p.name.trim().toLowerCase() === name.trim().toLowerCase()
        )
        productId = match
          ? match.id
          : (await api.createProduct({ name: name.trim(), canonical_unit: unit })).id
      }

      const record = await api.createPriceRecord({
        product_id: productId,
        supplier_id: Number(supplierId),
        price: Number(price),
        min_quantity: Number(minQuantity) || 1,
        unit,
        source: 'ocr',
        raw_ocr_text: result?.raw_text,
      })

      if (listId && itemId) {
        await api.updateItem(listId, itemId, {
          checked: true,
          matched_price_record_id: record.id,
        })
      }

      setSaved(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const reset = () => {
    setPreview(null)
    setResult(null)
    setSaved(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="page">
      <h2>Escanear etiqueta</h2>
      {listId && <p className="muted small">Vinculado a um item da lista.</p>}

      {!preview && (
        <div className="scan-capture">
          <button
            className="primary-button big"
            onClick={() => fileInputRef.current?.click()}
          >
            📷 Tirar foto da etiqueta
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </div>
      )}

      {preview && (
        <div className="scan-preview">
          <img src={preview} alt="Foto da etiqueta" />
        </div>
      )}

      {scanning && <p className="muted">Lendo a etiqueta...</p>}
      {error && <p className="error-text">{error}</p>}

      {result && !saved && (
        <form className="card scan-form" onSubmit={handleSave}>
          {result.confidence_note && (
            <p className="warning-text">⚠️ {result.confidence_note}</p>
          )}

          <label>Nome do produto</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <div className="form-row">
            <div>
              <label>Qtd. mínima (atacado)</label>
              <input
                type="number"
                min="1"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
              />
            </div>
            <div>
              <label>Unidade</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="un">un</option>
                <option value="kg">kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="ml">ml</option>
                <option value="pacote">pacote</option>
                <option value="caixa">caixa</option>
              </select>
            </div>
          </div>

          <label>Fornecedor</label>
          <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {suppliers.length === 0 && (
            <p className="muted small">
              Cadastre um fornecedor primeiro na aba Fornecedores.
            </p>
          )}

          <details>
            <summary className="muted small">Texto bruto reconhecido</summary>
            <pre className="raw-text">{result.raw_text}</pre>
          </details>

          <button type="submit" className="primary-button" disabled={saving}>
            {saving ? 'Salvando...' : 'Confirmar e salvar'}
          </button>
        </form>
      )}

      {saved && (
        <div className="card success-card">
          <p>✅ Preço salvo com sucesso!</p>
          <div className="button-row">
            <button className="secondary-button" onClick={reset}>
              Escanear outro item
            </button>
            {listId && (
              <button
                className="primary-button"
                onClick={() => navigate(`/lists/${listId}`)}
              >
                Voltar para a lista
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
