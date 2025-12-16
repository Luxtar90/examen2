import { prisma } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); res.status(204).end(); return }
  cors(res)
  if (req.method !== 'POST') { res.status(405).json({ error: 'Método no permitido' }); return }
  const auth = requireRole(req, res, 'admin')
  if (!auth) return
  try {
    const { email, id, role } = req.body || {}
    const r = String(role || '').toLowerCase()
    if (!['admin','cliente'].includes(r)) { res.status(400).json({ error: 'Rol inválido' }); return }
    const where = id ? { id: String(id) } : { email: String(email || '').toLowerCase() }
    const user = await prisma.user.findUnique({ where })
    if (!user) { res.status(404).json({ error: 'Usuario no encontrado' }); return }
    const updatedUser = await prisma.user.update({ where: { id: user.id }, data: { role: r } })
    res.status(200).json({ user: { id: updatedUser.id, email: updatedUser.email, role: updatedUser.role, name: updatedUser.name } })
  } catch (e) {
    res.status(500).json({ error: 'Error de servidor' })
  }
}