const shell = require('electron').shell;
const snoowrap = require('snoowrap');
const fs = require('fs');
const moment = require('moment-timezone');
const {ipcRenderer} = require('electron');

const secrets = JSON.parse(fs.readFileSync('./secrets', 'utf8'));
const reddit = new snoowrap({
    userAgent: 'gamesales-notifier',
    clientId: secrets.reddit.clientId,
    clientSecret: secrets.reddit.clientSecret,
    refreshToken: secrets.reddit.refreshToken,
});
let seenIds = {};
const searchTerms = ['ring fit adventure', 'rfa', 'ring fit', 'ringfit', 'ringfitadventure', 'fitadventure', 'ring'];
const searchRegexes = [];
for (let searchTerm of searchTerms) {
    searchRegexes.push(RegExp(`\\b${searchTerm}\\b`, 'g'));
}

window.startPolling = (callback) => {
    setInterval(() => {
        reddit.getSubreddit('GameSale').getNew().then(submissions => {
            for (let i = submissions.length - 1; i >= 0; i--) {
                const submission = submissions[i];
                if (submission.id in seenIds) {
                    continue;
                }
                seenIds[submission.id] = submission;
                const text = (submission.title + " " + submission.selftext).toLowerCase();
                for (let searchRegex of searchRegexes) {
                    if (searchRegex.test(text)) {
                        callback(submission);
                        break;
                    }
                }
            }
        });
    }, 1000);
}
window.moment = moment;
window.shell = shell;
window.mainWindow = require('electron-main-window').getMainWindow();
window.ipcRenderer = ipcRenderer;
