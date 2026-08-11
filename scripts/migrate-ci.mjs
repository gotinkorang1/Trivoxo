import { spawn } from 'node:child_process'
import { resolve } from 'node:path'

// Payload prompts when a database once used development push mode. CI has no
// interactive terminal, so feed that one acknowledgement through stdin. The
// migration runner still executes each checked-in migration transactionally
// and returns a non-zero exit code on any failure.
const payloadCli = resolve(process.cwd(), 'node_modules', 'payload', 'bin.js')
const migration = spawn(process.execPath, [payloadCli, 'migrate'], {
  env: {
    ...process.env,
    CI: 'true',
    NODE_OPTIONS: [process.env.NODE_OPTIONS, '--no-deprecation'].filter(Boolean).join(' '),
  },
  stdio: ['pipe', 'inherit', 'inherit'],
})

migration.stdin.end('y\n')

migration.on('error', (error) => {
  console.error('Could not start the Payload migration runner.', error)
  process.exitCode = 1
})

migration.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Payload migration runner stopped with signal ${signal}.`)
    process.exitCode = 1
    return
  }
  process.exitCode = code ?? 1
})
