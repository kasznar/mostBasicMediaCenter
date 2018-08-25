const {app, BrowserWindow} = require('electron');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({width: 640, height: 480, minWidth:500, minHeight:200});

  mainWindow.loadFile('index.html');
  mainWindow.setMenu(null);
  //mainWindow.webContents.openDevTools();
  //mainWindow.maximize();
  mainWindow.setFullScreen(true);

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
