import koa from 'koa'
import bodyParser from 'koa-bodyparser'
import Router from 'koa-router'
import http from 'http'
import { spawnSync } from 'child_process'
import path from 'path'
import cors from '@koa/cors'

const app = new koa()
const router = new Router()
const server = http.createServer(app.callback())

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())

router.post('/api', ctx => {
  const jsonDocument = ctx.request.body.code

  /**
   * Validate the JSON document from :data with jsonprima binary.
   */
  let { stdout } = spawnSync(
    path.join(__dirname, 'jsonprima', 'jsonprima'),
    ['-i', jsonDocument],
    { encoding: 'utf-8' },
  )

  /**
   * In case there are errors in JSON document, normalize the result output
   * so we can parse it as JSON.
   */
  if (stdout[0] === '"') {
    stdout = stdout.slice(1, stdout.length - 2).replace(/\\\"/g, '"')
  }

  // Return the results to the caller as application/json
  ctx.body = JSON.parse(stdout)
})

server.listen(process.env.PORT || 3000)
