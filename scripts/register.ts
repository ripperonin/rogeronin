/**
 * Register global slash command /poll-bg3
 * Usage:
 *   bun scripts/register.ts
 * Env (via .dev.vars or shell):
 *   DISCORD_TOKEN - Bot token
 *   DISCORD_APPLICATION_ID - Application ID
 */

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
  // No options - fixed poll
}

const url = `https://discord.com/api/v10/applications/${appId}/commands`

console.log(`Registering global command /${command.name} to ${url} ...`)

const res = await fetch(url, {
  method: 'PUT',
  headers: {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([command]),
})

const body = await res.text()

if (!res.ok) {
  console.error(`Failed: ${res.status} ${res.statusText}`)
  console.error(body)
  process.exit(1)
}

console.log(`Success: ${res.status}`)
console.log(body)
console.log('Global command will propagate within ~1 hour.')
console.log('Set Interactions Endpoint URL in Developer Portal to https://<worker>.workers.dev/interactions')
