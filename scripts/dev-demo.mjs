import { spawn } from 'node:child_process'

const child = spawn(
  'corepack pnpm --filter @keen/web dev',
  {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NEXT_PUBLIC_DEMO_MODE: '1',
    },
  }
)

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
