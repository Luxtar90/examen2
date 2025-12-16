import crypto from 'node:crypto'

const SECRET = process.env.AUTH_SECRET || 'dev-secret'

function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function sign(data) {
  const h = crypto.createHmac('sha256', SECRET).update(data).digest()
  return b64url(h)
}

export function createToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24
  const payload = { ...user, iat, exp }
  const h = b64url(JSON.stringify(header))
  const p = b64url(JSON.stringify(payload))
  const s = sign(h + '.' + p)
  return `${h}.${p}.${s}`
}

export function verifyToken(token) {
  try {
    const [h, p, s] = String(token || '').split('.')
    if (!h || !p || !s) return null
    const expected = sign(h + '.' + p)
    if (s !== expected) return null
    const payload = JSON.parse(Buffer.from(p.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString())
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function getAuth(req) {
  const h = req.headers['authorization'] || req.headers['Authorization']
  if (!h || !String(h).startsWith('Bearer ')) return null
  const token = h.slice(7)
  return verifyToken(token)
}

export function requireRole(req, res, role) {
  const auth = getAuth(req)
  if (!auth) {
    res.status(401).json({ error: 'No autenticado' })
    return null
  }
  if (role && auth.role !== role) {
    res.status(403).json({ error: 'No autorizado' })
    return null
  }
  return auth
}

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = String(stored || '').split(':')
    if (!salt || !hash) return false
    const calc = crypto.pbkdf2Sync(password, salt, 10000, 32, 'sha256').toString('hex')
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(calc, 'hex'))
  } catch {
    return false
  }
}