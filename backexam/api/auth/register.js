import { prisma } from '../../lib/db.js'
import { createToken, hashPassword } from '../../lib/auth.js'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); res.status(204).end(); return }
  cors(res)
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return }
  try {
    const { email, password, name, role, adminSecret } = req.body || {}
    const e = String(email || '').trim().toLowerCase()
    const p = String(password || '').trim()
    const n = String(name || '').trim()
    const r = String(role || 'cliente').toLowerCase()
    const hdrSecret = req.headers['x-admin-secret'] || req.headers['X-Admin-Secret']
    const providedSecret = String(adminSecret || hdrSecret || '').trim()
    const requiredSecret = process.env.ADMIN_INVITE_SECRET || 'dev-admin-secret'
    if (!e || !p) { res.status(400).json({ error: 'Email y contraseña requeridos' }); return }
    const exists = await prisma.user.findUnique({ where: { email: e } })
    if (exists) { res.status(409).json({ error: 'Usuario ya existe' }); return }
    if (r === 'admin' && providedSecret !== requiredSecret) { res.status(403).json({ error: 'Clave admin inválida' }); return }
    const userRole = r === 'admin' ? 'admin' : 'cliente'
    const user = await prisma.user.create({ data: { email: e, name: n || e, role: userRole, password: hashPassword(p) } })
    const token = createToken({ email: user.email, role: user.role, name: user.name, id: user.id })
    res.status(201).json({ token, user: { email: user.email, role: user.role, name: user.name, id: user.id } })
  } catch (e) {
    res.status(500).json({ error: 'Error de servidor' })
  }
}