export type PrintOptions = {
  silent?: boolean
  printBackground?: boolean
  deviceName?: string
}

export type DesktopApi = {
  printBill: (options?: PrintOptions) => Promise<void>
}

