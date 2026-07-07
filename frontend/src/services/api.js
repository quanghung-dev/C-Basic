const API_BASE_URL = 'http://192.168.1.40:5241/api/products'

export const getProducts = async (search = '', category = '', page = 1, pageSize = 8, minPrice = '', maxPrice = '', minStock = '', maxStock = '') => {
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (category) params.append('category', category)
  params.append('page', page)
  params.append('pageSize', pageSize)
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') params.append('minPrice', minPrice)
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') params.append('maxPrice', maxPrice)
  if (minStock !== undefined && minStock !== null && minStock !== '') params.append('minStock', minStock)
  if (maxStock !== undefined && maxStock !== null && maxStock !== '') params.append('maxStock', maxStock)
  
  const queryString = params.toString()
  const url = `${API_BASE_URL}?${queryString}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export const getCategories = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`)
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

export const getProductById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`)
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to fetch product: ${response.status}`)
  }
  return response.json()
}

export const createProduct = async (product) => {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to create product: ${response.status}`)
  }
  return response.json()
}

export const updateProduct = async (id, product) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to update product: ${response.status}`)
  }
  return response.json()
}

export const deleteProduct = async (id) => {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `Failed to delete product: ${response.status}`)
  }
  return response.json()
}
