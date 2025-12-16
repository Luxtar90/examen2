import { prisma } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.status(204).end()
    return
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    if (req.method === 'GET') {
      const auth = requireRole(req, res, 'admin')
      if (!auth) return
      const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } })
      res.status(200).json(orders)
      return
    }
    res.status(405).json({ error: 'Método no permitido' })
  } catch (e) {
    res.status(500).json({ error: 'Error de servidor' })
  }
}