import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool } from './client.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function main() {
  const schema = await readFile(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  console.log('Database schema applied successfully')
  await pool.end()
}

main().catch(async (error) => {
  console.error('Failed to run migrations', error)
  await pool.end()
  process.exit(1)
})
