import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration(filePath) {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8')
    console.log(`[v0] Running migration: ${path.basename(filePath)}`)
    
    const { error } = await supabase.rpc('exec_sql', {
      sql_query: sql
    }).catch(async () => {
      // If exec_sql doesn't exist, try direct SQL execution
      const statements = sql.split(';').filter(s => s.trim())
      for (const statement of statements) {
        if (statement.trim()) {
          const { error } = await supabase.from('_migrations').select('*').limit(0)
          // This is a workaround - we'll need to use the SQL editor in Supabase directly
        }
      }
      return { error: 'Need to run SQL directly in Supabase dashboard' }
    })

    if (error) {
      console.log(`[v0] Note: ${error}`)
      console.log(`[v0] Please run the SQL from ${path.basename(filePath)} in your Supabase SQL editor`)
    } else {
      console.log(`[v0] Migration completed: ${path.basename(filePath)}`)
    }
  } catch (error) {
    console.error(`[v0] Error reading migration file: ${error.message}`)
  }
}

async function runAllMigrations() {
  const scriptDir = path.dirname(new URL(import.meta.url).pathname)
  const migrations = [
    '001_create_profiles.sql',
    '002_create_game_tables.sql',
    '003_seed_words.sql'
  ]

  for (const migration of migrations) {
    const filePath = path.join(scriptDir, migration)
    if (fs.existsSync(filePath)) {
      await runMigration(filePath)
    }
  }
}

runAllMigrations().catch(console.error)
