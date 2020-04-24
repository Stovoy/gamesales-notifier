const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const twilio = require('twilio');
const fs = require('fs');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools();
}

app.allowRendererProcessReuse = true;

app.setAppUserModelId(process.execPath);

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const secrets = JSON.parse(fs.readFileSync('./secrets', 'utf8'));
const twilioClient = new twilio(secrets.twilio.accountSid, secrets.twilio.authToken);
ipcMain.on('sendSms', (e, text) => {
    twilioClient.messages.create({
        body: text,
        to: secrets.twilio.toPhoneNumber,
        from: secrets.twilio.fromPhoneNumber
    }).then((message) => {
        console.log(`Sent text to ${secrets.twilio.toPhoneNumber}: ${message.sid}`);
    }).catch((e) => {
        console.error(e);
    });
});
