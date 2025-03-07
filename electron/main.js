const { app, BrowserWindow } = require("electron");
const path = require("path");

const { spawnAudiocoreWindow, spawnMeydaWindow } = require("./audio/launcher");

const HTML_FILE = path.join(__dirname, "..", "views", "main", "index.html");

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 400,
    x: 1400,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(HTML_FILE);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // spawnAudiocoreWindow();
  spawnMeydaWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
