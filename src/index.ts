import { Hono } from 'hono'
import nacl from 'tweetnacl'
import { buildPollPayload } from './poll'

type Bindings = {
  DISCORD_PUBLIC_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

function hexToUint8Array(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0) return null
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16)
    if (Number.isNaN(byte)) return null
    arr[i / 2] = byte
  }
  return arr
}

function verifyDiscordRequest(
  publicKeyHex: string,
  signatureHex: string,
  timestamp: string,
  body: string,
): boolean {
  try {
    const publicKey = hexToUint8Array(publicKeyHex)
    const signature = hexToUint8Array(signatureHex)
    if (!publicKey || !signature) return false
    const message = new TextEncoder().encode(timestamp + body)
    return nacl.sign.detached.verify(message, signature, publicKey)
  } catch {
    return false
  }
}

async function handleInteraction(c: any) {
  const signature = c.req.header('x-signature-ed25519')
  const timestamp = c.req.header('x-signature-timestamp')
  const rawBody = await c.req.text()

  if (!signature || !timestamp) {
    return c.text('Missing signature', 401)
  }

  const publicKey = c.env.DISCORD_PUBLIC_KEY
  if (!publicKey) {
    console.error('DISCORD_PUBLIC_KEY not set')
    return c.text('Server misconfigured', 500)
  }

  const isValid = verifyDiscordRequest(publicKey, signature, timestamp, rawBody)
  if (!isValid) {
    return c.text('Invalid signature', 401)
  }

  let interaction: any
  try {
    interaction = JSON.parse(rawBody)
  } catch {
    return c.text('Invalid JSON', 400)
  }

  // PING (type 1) -> PONG
  if (interaction.type === 1) {
    return c.json({ type: 1 })
  }

  // APPLICATION_COMMAND (type 2)
  if (interaction.type === 2) {
    const commandName = interaction.data?.name

    if (commandName === 'poll-bg3') {
      const poll = buildPollPayload()

      return c.json({
        type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
        data: {
          poll,
        },
      })
    }

    return c.json(
      {
        type: 4,
        data: {
          content: `Unknown command: ${commandName}`,
          flags: 64, // ephemeral
        },
      },
      200,
    )
  }

  return c.text('Unknown interaction type', 400)
}

app.get('/', (c) => {
  return c.text('rogeronin-bot is running. POST /interactions for Discord.')
})

app.post('/', (c) => handleInteraction(c))
app.post('/interactions', (c) => handleInteraction(c))

export default app
