/**
 * Register global slash command /poll-bg3
 * Usage:
 *   bun scripts/register.ts
 * Env (via .dev.vars or shell):
 *   DISCORD_TOKEN - Bot token
 *   DISCORD_APPLICATION_ID - Application ID
 */

declare const process: {
  env: Record<string, string | undefined>
  exit(code: number): never
}

const token = process.env.DISCORD_TOKEN
const appId = process.env.DISCORD_APPLICATION_ID

if (!token) {
  console.error('Missing DISCORD_TOKEN env')
  process.exit(1)
}
if (!appId) {
  console.error('Missing DISCORD_APPLICATION_ID env')
  process.exit(1)
}

const command = {
  name: 'poll-bg3',
  description: 'Create Baldurs Gate 3 next sesh poll for the next 7 days',
  type: 1,
  integration_types: [0], // GUILD_INSTALL
  contexts: [0], // GUILD - prevent the command appearing in DMs
}

const url = `https://discord.com/api/v10/applications/${appId}/commands`

console.log(`Registering global command /${command.name} to ${url} ...`)

const res = await fetch(url, {
  // POST is an upsert by command name, unlike PUT which replaces every global command.
  method: 'POST',
  headers: {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(command),
})

const body = await res.text()

if (!res.ok) {
  console.error(`Failed: ${res.status} ${res.statusText}`)
  console.error(body)
  process.exit(1)
}

console.log(`Success: ${res.status}`)
console.log(body)
console.log('The command is updated globally. Discord will repair clients that have an older command definition.')
console.log('Set Interactions Endpoint URL in Developer Portal to https://<worker>.workers.dev/interactions')

export {}
