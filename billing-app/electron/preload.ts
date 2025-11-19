import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopApi, PrintOptions } from '../shared/ipc'

const desktopApi: DesktopApi = {
  printBill: (options?: PrintOptions) => ipcRenderer.invoke('print-bill', options)
}

contextBridge.exposeInMainWorld('desktopApi', desktopApi)

contextBridge.exposeInMainWorld('electronApp', {
  getVersion: () => ipcRenderer.invoke('app:get-version')
})

