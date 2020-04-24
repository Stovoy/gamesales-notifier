const shell = require('electron').shell;
const snoowrap = require('snoowrap');
const fs = require('fs');
const moment = require('moment-timezone');

const secrets = JSON.parse(fs.readFileSync('./secrets', 'utf8'));
const reddit = new snoowrap({
    userAgent: 'gamesales-notifier',
    clientId: secrets.clientId,
    clientSecret: secrets.clientSecret,
    refreshToken: secrets.refreshToken,
});

let seenIds = {};
const searchTerms = ['ring fit adventure', 'rfa', 'ring fit', 'ringfit', 'ringfitadventure', 'fitadventure', 'ring'];

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
                let found = false;
                for (let searchTerm of searchTerms) {
                    if (text.includes(searchTerm)) {
                        found = true;
                        break;
                    }
                }
                if (found) {
                    callback(submission);
                }
            }
        });
    }, 1000);
}
window.moment = moment;
window.shell = shell;
window.mainWindow = require('electron-main-window').getMainWindow();
