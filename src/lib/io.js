import * as transcribers from 'ldtr/lib/transcribers.js'
import { serialize } from 'ldtr/lib/trig/serializer.js'

export async function load (url, type = 'application/trig') {
  const resp = await fetch(url)
  const data = await resp.text()
  let transcribe = transcribers.transcribers[type]
  return transcribe({ data, type, base: url })
}

export function toTrig(data) {
  let chunks = []
  serialize(data, {write (chunk) {chunks.push(chunk)}})
  return chunks.join('')
}
