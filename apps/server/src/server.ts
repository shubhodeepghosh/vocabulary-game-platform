import { app } from './app.js'
import { env } from './config/env.js'
import { ensureRedis, pool } from './db/client.js'

async function main() {
  await pool.query('SELECT 1')
  await ensureRedis()

  app.listen(env.SERVER_PORT, () => {
    console.log(`API listening on http://localhost:${env.SERVER_PORT}`)
  })
}

main().catch(async (error) => {
  console.error('Unable to start server', error)
  await pool.end()
  process.exit(1)
})
