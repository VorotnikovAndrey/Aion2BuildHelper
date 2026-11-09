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
  settings: { get: call('settings:get'), update: call('settings:update'), updateUi: call('settings:updateUi') } as AppApi['settings'],
  guides: {
    list: call('guides:list'),
    save: call('guides:save'),
    remove: call('guides:remove'),
    importFile: call('guides:import'),
    exportFile: call('guides:export')
  } as AppApi['guides'],
  history: { list: call('history:list') } as AppApi['history'],
  gamedata: {
    check: call('gamedata:check'),
    onProgress(cb) {
      const listener = (_e: unknown, p: { done: number; total: number; label: string }) => cb(p)
      ipcRenderer.on('gamedata:progress', listener)
      return () => ipcRenderer.removeListener('gamedata:progress', listener)
    }
  } as AppApi['gamedata'],
  app: {
    version: call('app:version'),
    openExternal: call('app:openExternal'),
    openDataFolder: call('app:openDataFolder'),
    captureImage: call('app:captureImage'),
    onZoomChanged(cb) {
      const listener = (_e: unknown, z: number) => cb(z)
      ipcRenderer.on('ui:zoom-changed', listener)
      return () => ipcRenderer.removeListener('ui:zoom-changed', listener)
    }
  } as AppApi['app']
}

contextBridge.exposeInMainWorld('api', api)
