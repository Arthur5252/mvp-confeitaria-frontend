const URL_BASE = import.meta.env.VITE_URL_API || 'http://localhost:8000'

const CHAVE_TOKEN = 'confeitaria_token'

export function obterToken() {
  return localStorage.getItem(CHAVE_TOKEN)
}

export function definirToken(token) {
  if (token) {
    localStorage.setItem(CHAVE_TOKEN, token)
  } else {
    localStorage.removeItem(CHAVE_TOKEN)
  }
}

class ErroApi extends Error {
  constructor(mensagem, status) {
    super(mensagem)
    this.status = status
  }
}

async function requisicao(caminho, { metodo = 'GET', corpo, ehFormulario = false } = {}) {
  const cabecalhos = {}
  const token = obterToken()
  if (token) cabecalhos['Authorization'] = `Bearer ${token}`
  if (corpo && !ehFormulario) cabecalhos['Content-Type'] = 'application/json'

  const resposta = await fetch(`${URL_BASE}${caminho}`, {
    method: metodo,
    headers: cabecalhos,
    body: corpo ? (ehFormulario ? corpo : JSON.stringify(corpo)) : undefined,
  })

  if (resposta.status === 204) return null

  let dados = null
  try {
    dados = await resposta.json()
  } catch {
    // corpo vazio ou não-JSON
  }

  if (!resposta.ok) {
    const mensagem = dados?.detail
      ? Array.isArray(dados.detail)
        ? dados.detail.map((d) => d.msg).join(', ')
        : dados.detail
      : `Erro ${resposta.status}`
    throw new ErroApi(mensagem, resposta.status)
  }

  return dados
}

export const api = {
  entrar: (usuario, senha) =>
    requisicao('/autenticacao/entrar', { metodo: 'POST', corpo: { usuario, senha } }),

  listarFornecedores: () => requisicao('/fornecedores'),
  criarFornecedor: (dados) =>
    requisicao('/fornecedores', { metodo: 'POST', corpo: dados }),
  atualizarFornecedor: (id, dados) =>
    requisicao(`/fornecedores/${id}`, { metodo: 'PUT', corpo: dados }),
  removerFornecedor: (id) => requisicao(`/fornecedores/${id}`, { metodo: 'DELETE' }),

  listarProdutos: (busca) =>
    requisicao(`/produtos${busca ? `?busca=${encodeURIComponent(busca)}` : ''}`),
  criarProduto: (dados) => requisicao('/produtos', { metodo: 'POST', corpo: dados }),

  listarListasCompras: () => requisicao('/listas-compras'),
  criarListaCompras: (nome) =>
    requisicao('/listas-compras', { metodo: 'POST', corpo: { nome } }),
  obterListaCompras: (id) => requisicao(`/listas-compras/${id}`),
  atualizarListaCompras: (id, dados) =>
    requisicao(`/listas-compras/${id}`, { metodo: 'PUT', corpo: dados }),
  removerListaCompras: (id) =>
    requisicao(`/listas-compras/${id}`, { metodo: 'DELETE' }),
  adicionarItem: (listaId, dados) =>
    requisicao(`/listas-compras/${listaId}/itens`, { metodo: 'POST', corpo: dados }),
  atualizarItem: (listaId, itemId, dados) =>
    requisicao(`/listas-compras/${listaId}/itens/${itemId}`, {
      metodo: 'PATCH',
      corpo: dados,
    }),
  removerItem: (listaId, itemId) =>
    requisicao(`/listas-compras/${listaId}/itens/${itemId}`, { metodo: 'DELETE' }),

  escanearEtiqueta: (arquivo) => {
    const formulario = new FormData()
    formulario.append('arquivo', arquivo)
    return requisicao('/ocr/escanear', {
      metodo: 'POST',
      corpo: formulario,
      ehFormulario: true,
    })
  },

  listarRegistrosPreco: (parametros = {}) => {
    const consulta = new URLSearchParams(parametros).toString()
    return requisicao(`/registros-preco${consulta ? `?${consulta}` : ''}`)
  },
  criarRegistroPreco: (dados) =>
    requisicao('/registros-preco', { metodo: 'POST', corpo: dados }),
  atualizarRegistroPreco: (id, dados) =>
    requisicao(`/registros-preco/${id}`, { metodo: 'PUT', corpo: dados }),
  removerRegistroPreco: (id) =>
    requisicao(`/registros-preco/${id}`, { metodo: 'DELETE' }),

  comparacaoPrecos: (produtoId) =>
    requisicao(`/painel/comparacao-precos?produto_id=${produtoId}`),
  historicoPrecos: (produtoId, fornecedorId) =>
    requisicao(
      `/painel/historico-precos?produto_id=${produtoId}${
        fornecedorId ? `&fornecedor_id=${fornecedorId}` : ''
      }`
    ),
  destaques: () => requisicao('/painel/destaques'),
}

export { ErroApi }
