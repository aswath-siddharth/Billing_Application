import { app, BrowserWindow, ipcMain, shell } from "electron";
import { join } from "node:path";
import { URL } from "node:url";
const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 720,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "../preload/preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadURL(
      new URL(
        "index.html",
        `file://${join(__dirname, "../renderer")}/`
      ).toString()
    );
  }
  return mainWindow;
};
app.whenReady().then(() => {
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
ipcMain.handle("app:get-version", () => app.getVersion());
ipcMain.handle("print-bill", async (event, options = {}) => {
  const webContents = event.sender;
  await new Promise((resolve, reject) => {
    webContents.print(
      {
        printBackground: true,
        silent: false,
        ...options
      },
      (success) => {
        if (success) {
          resolve();
        } else {
          reject(new Error("Print job cancelled"));
        }
      }
    );
  });
});
