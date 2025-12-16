export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const html = `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Swagger UI</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
      <script>
        window.ui = SwaggerUIBundle({ url: '/api/openapi.json', dom_id: '#swagger-ui' })
      </script>
    </body>
  </html>`
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.status(200).send(html)
}