const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TOKEN_KEY = 'confeitaria_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token)
  } else {
    localStorage.removeItem(TOKEN_KEY)
  }
}

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body && !isForm) headers['Content-Type'] = 'application/json'

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
  })

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // corpo vazio ou não-JSON
  }

  if (!response.ok) {
    const message = data?.detail
      ? Array.isArray(data.detail)
        ? data.detail.map((d) => d.msg).join(', ')
        : data.detail
      : `Erro ${response.status}`
    throw new ApiError(message, response.status)
  }

  return data
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: { username, password } }),

  listSuppliers: () => request('/suppliers'),
  createSupplier: (payload) => request('/suppliers', { method: 'POST', body: payload }),
  updateSupplier: (id, payload) =>
    request(`/suppliers/${id}`, { method: 'PUT', body: payload }),
  deleteSupplier: (id) => request(`/suppliers/${id}`, { method: 'DELETE' }),

  listProducts: (q) => request(`/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  createProduct: (payload) => request('/products', { method: 'POST', body: payload }),

  listShoppingLists: () => request('/shopping-lists'),
  createShoppingList: (name) =>
    request('/shopping-lists', { method: 'POST', body: { name } }),
  getShoppingList: (id) => request(`/shopping-lists/${id}`),
  updateShoppingList: (id, payload) =>
    request(`/shopping-lists/${id}`, { method: 'PUT', body: payload }),
  deleteShoppingList: (id) => request(`/shopping-lists/${id}`, { method: 'DELETE' }),
  addItem: (listId, payload) =>
    request(`/shopping-lists/${listId}/items`, { method: 'POST', body: payload }),
  updateItem: (listId, itemId, payload) =>
    request(`/shopping-lists/${listId}/items/${itemId}`, {
      method: 'PATCH',
      body: payload,
    }),
  deleteItem: (listId, itemId) =>
    request(`/shopping-lists/${listId}/items/${itemId}`, { method: 'DELETE' }),

  scanLabel: (file) => {
    const form = new FormData()
    form.append('file', file)
    return request('/ocr/scan', { method: 'POST', body: form, isForm: true })
  },

  listPriceRecords: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    return request(`/price-records${query ? `?${query}` : ''}`)
  },
  createPriceRecord: (payload) =>
    request('/price-records', { method: 'POST', body: payload }),
  updatePriceRecord: (id, payload) =>
    request(`/price-records/${id}`, { method: 'PUT', body: payload }),
  deletePriceRecord: (id) => request(`/price-records/${id}`, { method: 'DELETE' }),

  priceComparison: (productId) =>
    request(`/dashboard/price-comparison?product_id=${productId}`),
  priceHistory: (productId, supplierId) =>
    request(
      `/dashboard/price-history?product_id=${productId}${
        supplierId ? `&supplier_id=${supplierId}` : ''
      }`
    ),
  insights: () => request('/dashboard/insights'),
}

export { ApiError }
