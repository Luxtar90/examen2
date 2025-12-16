const defaultBase = import.meta.env.PROD ? 'https://backexam.vercel.app/api' : 'http://localhost:3000/api'
const base = import.meta.env.VITE_API_BASE_URL || defaultBase
let authToken = null
export function setAuthToken(t) { authToken = t }
function authHeaders() { return authToken ? { Authorization: 'Bearer ' + authToken } : {} }

export async function getItems() {
  const r = await fetch(base + '/items')
  if (!r.ok) throw new Error('Error al cargar artículos')
  return r.json()
}

export async function createItem(payload) {
  const r = await fetch(base + '/items', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) })
  if (!r.ok) throw new Error('Error al crear artículo')
  return r.json()
}

export async function createOrder(payload) {
  const r = await fetch(base + '/orders', { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) })
  if (!r.ok) throw new Error('Error al crear pedido')
  return r.json()
}

export async function getOrders() {
  const r = await fetch(base + '/vendor/orders', { headers: { ...authHeaders() } })
  if (!r.ok) throw new Error('Error al cargar pedidos')
  return r.json()
}

export async function getMyOrders() {
  const r = await fetch(base + '/my/orders', { headers: { ...authHeaders() } })
  if (!r.ok) throw new Error('Error al cargar mis pedidos')
  return r.json()
}

export async function login(payload) {
  const r = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!r.ok) {
    let msg = 'Error de autenticación'
    try { const e = await r.json(); msg = e.error || msg } catch {}
    throw new Error(msg)
  }
  return r.json()
}

export async function register(payload) {
  const r = await fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
  if (!r.ok) {
    let msg = 'Error de registro'
    try { const e = await r.json(); msg = e.error || msg } catch {}
    throw new Error(msg)
  }
  return r.json()
}