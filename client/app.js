const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');
//const { net } = require('electron');

const io = require('socket.io-client');

const socket = io('http://localhost:3000');
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/dist/client/index.html`),
            protocol: 'file:',
            slashes: true,
        }),
    );

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    /*
    const value = localStorage.getItem('token');
    console.log(value);

    const request = net.request({
        method: 'POST',
        protocol: 'http:',
        hostname: 'localhost',
        port: 3000,
        path: '/api/fs/players/wsh1234/logout',
        headers: {
        'Content-Type': 'application/json'
        }
      });
      request.write('');
      request.end();
      console.log('logout part');
      */

    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

socket.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});
