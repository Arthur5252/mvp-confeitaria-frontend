import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api/cliente'

export default function EscanearEtiqueta() {
  const [parametros] = useSearchParams()
  const listaId = parametros.get('listaId')
  const itemId = parametros.get('itemId')
  const produtoPreSelecionadoId = parametros.get('produtoId')
  const navegar = useNavigate()

  const entradaArquivoRef = useRef(null)
  const [previa, setPrevia] = useState(null)
  const [escaneando, setEscaneando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [fornecedores, setFornecedores] = useState([])
  const [fornecedorId, setFornecedorId] = useState('')
  const [nome, setNome] = useState('')
  const [preco, setPreco] = useState('')
  const [quantidadeMinima, setQuantidadeMinima] = useState(1)
  const [unidade, setUnidade] = useState('un')
  const [erro, setErro] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  useEffect(() => {
    api
      .listarFornecedores()
      .then((dados) => {
        setFornecedores(dados)
        if (dados.length > 0) setFornecedorId(String(dados[0].id))
      })
      .catch((e) => setErro(e.message))
  }, [])

  const aoMudarArquivo = async (evento) => {
    const arquivo = evento.target.files?.[0]
    if (!arquivo) return
    setPrevia(URL.createObjectURL(arquivo))
    setResultado(null)
    setSalvo(false)
    setEscaneando(true)
    setErro(null)
    try {
      const dados = await api.escanearEtiqueta(arquivo)
      setResultado(dados)
      setNome(dados.nome_sugerido || '')
      setPreco(dados.preco_sugerido != null ? String(dados.preco_sugerido) : '')
      setQuantidadeMinima(dados.quantidade_minima_sugerida || 1)
      setUnidade(dados.unidade_sugerida || 'un')
    } catch (e) {
      setErro(e.message)
    } finally {
      setEscaneando(false)
    }
  }

  const aoSalvar = async (evento) => {
    evento.preventDefault()
    if (!fornecedorId || !preco || !nome.trim()) {
      setErro('Preencha nome, preço e fornecedor.')
      return
    }
    setSalvando(true)
    setErro(null)
    try {
      let produtoId = produtoPreSelecionadoId ? Number(produtoPreSelecionadoId) : null
      if (!produtoId) {
        const existentes = await api.listarProdutos(nome.trim())
        const correspondente = existentes.find(
          (p) => p.nome.trim().toLowerCase() === nome.trim().toLowerCase()
        )
        produtoId = correspondente
          ? correspondente.id
          : (await api.criarProduto({ nome: nome.trim(), unidade_padrao: unidade })).id
      }

      const registro = await api.criarRegistroPreco({
        produto_id: produtoId,
        fornecedor_id: Number(fornecedorId),
        preco: Number(preco),
        quantidade_minima: Number(quantidadeMinima) || 1,
        unidade,
        origem: 'ocr',
        texto_ocr_bruto: resultado?.texto_bruto,
      })

      if (listaId && itemId) {
        await api.atualizarItem(listaId, itemId, {
          marcado: true,
          registro_preco_vinculado_id: registro.id,
        })
      }

      setSalvo(true)
    } catch (e) {
      setErro(e.message)
    } finally {
      setSalvando(false)
    }
  }

  const reiniciar = () => {
    setPrevia(null)
    setResultado(null)
    setSalvo(false)
    if (entradaArquivoRef.current) entradaArquivoRef.current.value = ''
  }

  return (
    <div className="pagina">
      <h2>Escanear etiqueta</h2>
      {listaId && <p className="discreto pequeno">Vinculado a um item da lista.</p>}

      {!previa && (
        <div className="captura-escaneamento">
          <button
            className="botao-primario grande"
            onClick={() => entradaArquivoRef.current?.click()}
          >
            📷 Tirar foto da etiqueta
          </button>
          <input
            ref={entradaArquivoRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={aoMudarArquivo}
          />
        </div>
      )}

      {previa && (
        <div className="previa-escaneamento">
          <img src={previa} alt="Foto da etiqueta" />
        </div>
      )}

      {escaneando && <p className="discreto">Lendo a etiqueta...</p>}
      {erro && <p className="texto-erro">{erro}</p>}

      {resultado && !salvo && (
        <form className="cartao formulario-escaneamento" onSubmit={aoSalvar}>
          {resultado.observacao_confianca && (
            <p className="texto-aviso">⚠️ {resultado.observacao_confianca}</p>
          )}

          <label>Nome do produto</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />

          <label>Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            required
          />

          <div className="linha-formulario">
            <div>
              <label>Qtd. mínima (atacado)</label>
              <input
                type="number"
                min="1"
                value={quantidadeMinima}
                onChange={(e) => setQuantidadeMinima(e.target.value)}
              />
            </div>
            <div>
              <label>Unidade</label>
              <select value={unidade} onChange={(e) => setUnidade(e.target.value)}>
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
          <select value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)}>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
          {fornecedores.length === 0 && (
            <p className="discreto pequeno">
              Cadastre um fornecedor primeiro na aba Fornecedores.
            </p>
          )}

          <details>
            <summary className="discreto pequeno">Texto bruto reconhecido</summary>
            <pre className="texto-bruto">{resultado.texto_bruto}</pre>
          </details>

          <button type="submit" className="botao-primario" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Confirmar e salvar'}
          </button>
        </form>
      )}

      {salvo && (
        <div className="cartao cartao-sucesso">
          <p>✅ Preço salvo com sucesso!</p>
          <div className="linha-botoes">
            <button className="botao-secundario" onClick={reiniciar}>
              Escanear outro item
            </button>
            {listaId && (
              <button
                className="botao-primario"
                onClick={() => navegar(`/listas/${listaId}`)}
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
