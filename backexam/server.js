import http from 'node:http'
import { parse as parseUrl } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

function loadEnv(paths = []) {
  for (const p of paths) {
    try {
      const fp = path.resolve(process.cwd(), p)
      if (!fs.existsSync(fp)) continue
      const txt = fs.readFileSync(fp, 'utf8')
      for (const line of txt.split(/\r?\n/)) {
        const m = /^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(line)
        if (!m) continue
        const k = m[1]
        let v = m[2]
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
        if (!(k in process.env)) process.env[k] = v
      }
    } catch {}
  }
}
loadEnv(['.env', '.env.local'])

import openapiHandler from './api/openapi.json.js'
import docsHandler from './api/docs.js'
import itemsHandler from './api/items.js'
import ordersHandler from './api/orders.js'
import myOrdersHandler from './api/my/orders.js'
import vendorOrdersHandler from './api/vendor/orders.js'
import loginHandler from './api/auth/login.js'
import registerHandler from './api/auth/register.js'
import promoteHandler from './api/admin/promote.js'

async function parseBody(req) {
  return new Promise((resolve) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString()
      if (!raw) { resolve(undefined); return }
      try { resolve(JSON.parse(raw)) } catch { resolve(undefined) }
    })
    req.on('error', () => resolve(undefined))
  })
}

function wrapRes(res) {
  res.status = (code) => { res.statusCode = code; return res }
  res.json = (obj) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(obj)) }
  res.send = (data) => { res.end(typeof data === 'string' ? data : String(data)) }
  return res
}

function makeReq(req, body) {
  const { pathname, query } = parseUrl(req.url, true)
  return { method: req.method, headers: req.headers, url: req.url, path: pathname || '/', query: query || {}, body }
}

const server = http.createServer(async (req, res) => {
  const body = await parseBody(req)
  const r = makeReq(req, body)
  const wres = wrapRes(res)
  try {
    switch (r.path) {
      case '/api/openapi.json': return openapiHandler(r, wres)
      case '/api/docs': return docsHandler(r, wres)
      case '/api/items': return itemsHandler(r, wres)
      case '/api/orders': return ordersHandler(r, wres)
      case '/api/my/orders': return myOrdersHandler(r, wres)
      case '/api/vendor/orders': return vendorOrdersHandler(r, wres)
      case '/api/auth/login': return loginHandler(r, wres)
      case '/api/auth/register': return registerHandler(r, wres)
      case '/api/admin/promote': return promoteHandler(r, wres)
      default:
        wres.status(404).json({ error: 'Ruta no encontrada' })
    }
  } catch (e) {
    wres.status(500).json({ error: 'Error de servidor' })
  }
})

const port = Number(process.env.PORT || 3000)
server.listen(port, () => {
  console.log(`Backend escuchando en http://localhost:${port}`)
})
