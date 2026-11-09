// Состояние обновления приложения в интерфейсе. Источник — main (src/main/updater.ts),
// он присылает каждое изменение событием updates:state.

import { create } from 'zustand'
import type { UpdateState } from '@shared/updates'
import { api } from './store'

export const useUpdates = create<{ state: UpdateState }>(() => ({ state: { phase: 'idle', current: __APP_VERSION__ } }))

let subscribed = false

export function subscribeUpdates(): void {
  if (subscribed) return
  subscribed = true
  api.updates.onState((state) => useUpdates.setState({ state }))
  void api.updates.get().then((state) => useUpdates.setState({ state }))
}
