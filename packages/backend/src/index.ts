import 'dotenv/config'
import { serve } from '@hono/node-server'
import { app } from './app'
import { startScheduler } from './scheduler'

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.log(`Levl.up backend running on http://localhost:${port}`)
  startScheduler()
})
