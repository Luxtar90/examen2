import { writable } from 'svelte/store'
import { login, register, setAuthToken } from '../api.js'

function getInitial() {
  try {
    const s = localStorage.getItem('session')
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export const session = writable(getInitial())

session.subscribe(v => {
  try {
    if (v) localStorage.setItem('session', JSON.stringify(v))
    else localStorage.removeItem('session')
  } catch {}
})

export async function doLogin({ email, password, role, name }) {
  try {
    const r = await login({ email, password, role, name })
    setAuthToken(r.token)
    session.set({ token: r.token, ...r.user })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function doRegister({ email, password, name, role, adminSecret }) {
  try {
    const r = await register({ email, password, name, role, adminSecret })
    setAuthToken(r.token)
    session.set({ token: r.token, ...r.user })
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

session.subscribe(v => {
  if (v && v.token) setAuthToken(v.token)
})

export function doLogout() { session.set(null) }