import { contextBridge, ipcRenderer } from "electron";
const desktopApi = {
  printBill: (options) => ipcRenderer.invoke("print-bill", options)
};
contextBridge.exposeInMainWorld("desktopApi", desktopApi);
contextBridge.exposeInMainWorld("electronApp", {
  getVersion: () => ipcRenderer.invoke("app:get-version")
});
