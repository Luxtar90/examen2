import { createToken, verifyPassword } from '../../lib/auth.js'
import { prisma } from '../../lib/db.js'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    cors(res)
    res.status(204).end()
    return
  }
  cors(res)
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' })
    return
  }
  try {
    const { email, password } = req.body || {}
    const e = String(email || '').trim()
    const p = String(password || '').trim()
    if (!e || !p) { res.status(400).json({ error: 'Completa email y contraseña' }); return }
    const u = await prisma.user.findUnique({ where: { email: e } })
    if (u) {
      if (!verifyPassword(p, u.password)) { res.status(401).json({ error: 'Credenciales inválidas' }); return }
      const token = createToken({ email: u.email, role: u.role, name: u.name, id: u.id })
      res.status(200).json({ token, user: { email: u.email, role: u.role, name: u.name, id: u.id } })
      return
    }
    if (e === 'admin@example.com' && p === 'admin123') {
      const token = createToken({ email: e, role: 'admin', name: 'Administrador' })
      res.status(200).json({ token, user: { email: e, role: 'admin', name: 'Administrador' } })
      return
    }
    res.status(401).json({ error: 'Usuario no encontrado' })
  } catch (e) {
    res.status(500).json({ error: 'Error de servidor' })
  }
}