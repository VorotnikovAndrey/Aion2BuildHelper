// Мост между интерфейсом и main-процессом. Интерфейс видит только window.api.

import { contextBridge, ipcRenderer } from 'electron'
import type { AppApi, SourceState } from '@shared/api'

const call =
  (channel: string) =>
  (...args: unknown[]) =>
    ipcRenderer.invoke(channel, ...args)

const api: AppApi = {
  source: {
    get: call('source:get'),
    reload: call('source:reload'),
    pick: call('source:pick'),
    reset: call('source:reset'),
    onChange(cb) {
      const listener = (_e: unknown, s: SourceState) => cb(s)
      ipcRenderer.on('source:changed', listener)
      return () => ipcRenderer.removeListener('source:changed', listener)
    }
  } as AppApi['source'],
  settings: { get: call('settings:get'), update: call('settings:update') } as AppApi['settings'],
  guides: {
    list: call('guides:list'),
    save: call('guides:save'),
    remove: call('guides:remove'),
    importFile: call('guides:import'),
    exportFile: call('guides:export')
  } as AppApi['guides'],
  history: { list: call('history:list') } as AppApi['history'],
  app: {
    version: call('app:version'),
    openExternal: call('app:openExternal'),
    openDataFolder: call('app:openDataFolder')
  } as AppApi['app']
}

contextBridge.exposeInMainWorld('api', api)
