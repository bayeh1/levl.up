import { readFile, writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import type { AppPushSubscription } from '@levl-up/shared'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const DEFAULT_FILE = resolve(__dirname, '../data/subscriptions.json')

export async function getSubscriptions(file = DEFAULT_FILE): Promise<AppPushSubscription[]> {
  if (!existsSync(file)) return []
  const raw = await readFile(file, 'utf-8')
  return JSON.parse(raw) as AppPushSubscription[]
}

export async function saveSubscription(sub: AppPushSubscription, file = DEFAULT_FILE): Promise<void> {
  const subs = await getSubscriptions(file)
  const idx = subs.findIndex((s) => s.endpoint === sub.endpoint)
  if (idx >= 0) {
    subs[idx] = sub
  } else {
    subs.push(sub)
  }
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(subs, null, 2))
}

export async function removeSubscription(endpoint: string, file = DEFAULT_FILE): Promise<void> {
  const subs = await getSubscriptions(file)
  const filtered = subs.filter((s) => s.endpoint !== endpoint)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, JSON.stringify(filtered, null, 2))
}
