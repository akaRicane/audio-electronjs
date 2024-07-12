const { BrowserWindow } = require("electron");
const path = require("path");

function spawnAudiocoreWindow() {
  const audiocoreWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    x: 1400,
    y: 100,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  audiocoreWindow.loadFile("electron/audio/wai/index.html");
  audiocoreWindow.webContents.openDevTools();
}

function spawnMeydaWindow() {
  const audiocoreWindow = new BrowserWindow({
    width: 1000,
    height: 900,
    x: 1400,
    y: 100,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "./meyda/preload.js")
    },
  });

  audiocoreWindow.loadFile("electron/audio/meyda/index.html");
  audiocoreWindow.webContents.openDevTools();
}

module.exports = { spawnAudiocoreWindow, spawnMeydaWindow };
