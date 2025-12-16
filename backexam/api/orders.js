import { prisma } from '../lib/db.js'
import { requireRole } from '../lib/auth.js'

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    cors(res)
    res.status(204).end()
    return
  }
  cors(res)
  try {
    if (req.method === 'POST') {
      const auth = requireRole(req, res, 'cliente')
      if (!auth) return
      const { itemId, quantity, customer } = req.body || {}
      const q = Number(quantity)
      const c = customer || {}
      const i = await prisma.item.findUnique({ where: { id: String(itemId) } })
      if (!i) {
        res.status(404).json({ error: 'Artículo no existe' })
        return
      }
      if (Number.isNaN(q) || q <= 0) {
        res.status(400).json({ error: 'Cantidad inválida' })
        return
      }
      if (i.stock < q) {
        res.status(400).json({ error: 'Stock insuficiente' })
        return
      }
      const name = String(c.name || '').trim()
      const address = String(c.address || '').trim()
      const phone = String(c.phone || '').trim()
      if (!name || !address || !phone) {
        res.status(400).json({ error: 'Datos del cliente inválidos' })
        return
      }
      const total = i.price * q
      const order = await prisma.$transaction(async (tx) => {
        const updatedItem = await tx.item.update({ where: { id: i.id }, data: { stock: i.stock - q } })
        const created = await tx.order.create({ data: { itemId: updatedItem.id, quantity: q, customerName: name, customerAddress: address, customerPhone: phone, total, userId: auth.id } })
        return created
      })
      res.status(201).json(order)
      return
    }
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