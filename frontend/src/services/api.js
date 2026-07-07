const API_BASE_URL = 'http://192.168.1.40:5241/api/products'

export const getProducts = async (search = '') => {
  const url = search ? `${API_BASE_URL}?search=${encodeURIComponent(search)}` : API_BASE_URL
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`)
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
