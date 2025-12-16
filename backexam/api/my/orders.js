import { prisma } from '../../lib/db.js'
import { requireRole } from '../../lib/auth.js'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); res.status(204).end(); return }
  cors(res)
  if (req.method !== 'GET') { res.status(405).json({ error: 'Método no permitido' }); return }
  const auth = requireRole(req, res)
  if (!auth) return
  const uid = auth.id
  if (!uid) { res.status(400).json({ error: 'Usuario inválido' }); return }
  try {
    const data = await prisma.order.findMany({ where: { userId: uid }, orderBy: { createdAt: 'desc' }, include: { item: true } })
    res.status(200).json(data.map(o => ({ id: o.id, itemId: o.itemId, item: { id: o.item.id, name: o.item.name }, quantity: o.quantity, total: o.total, customerName: o.customerName, customerAddress: o.customerAddress, customerPhone: o.customerPhone, createdAt: o.createdAt })))
  } catch (e) { res.status(500).json({ error: 'Error de servidor' }) }
}