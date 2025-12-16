import { prisma } from '../lib/db.js'
import { requireRole } from '../lib/auth.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.status(204).end()
    return
  }
  res.setHeader('Access-Control-Allow-Origin', '*')
  try {
    if (req.method === 'GET') {
      const items = await prisma.item.findMany({ orderBy: { createdAt: 'desc' } })
      res.status(200).json(items)
      return
    }
    if (req.method === 'POST') {
      const auth = requireRole(req, res, 'admin')
      if (!auth) return
      const { name, price, stock } = req.body || {}
      const n = String(name || '').trim()
      const p = Number(price)
      const s = Number(stock)
      if (!n || Number.isNaN(p) || Number.isNaN(s) || s < 0 || p < 0) {
        res.status(400).json({ error: 'Datos inválidos' })
        return
      }
      const item = await prisma.item.create({ data: { name: n, price: p, stock: s } })
      res.status(201).json(item)
      return
    }
    res.status(405).json({ error: 'Método no permitido' })
  } catch (e) {
    res.status(500).json({ error: 'Error de servidor' })
  }
}