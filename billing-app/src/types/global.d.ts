import type { DesktopApi } from '../../shared/ipc'

type ElectronAppApi = {
  getVersion: () => Promise<string>
}

declare global {
  interface Window {
    desktopApi: DesktopApi
    electronApp: ElectronAppApi
  }
}

export {}

