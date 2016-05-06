const path = require('path')
const electron = require('electron')

const BrowserWindow = electron.BrowserWindow
const app = electron.app

let mainWindow = null

app.on('ready', () => {
  mainWindow = new BrowserWindow({width: 1024, height: 768})

  mainWindow.loadURL('file://' + path.join(__dirname, '../../html/index.html'))

  mainWindow.on('closed', () => {
    mainWindow = null
  })
})
