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
const searchTerms = ['ring fit adventure', 'rfa', 'ring fit', 'ringfit', 'ringfitadventure', 'fitadventure', 'ring'];
const searchRegexes = [];
for (let searchTerm of searchTerms) {
    searchRegexes.push(RegExp(`\\b${searchTerm}\\b`, 'g'));
}

if (!fs.existsSync('./seen.json')) {
    fs.writeFileSync('./seen.json', '[]');
}
const seenPosts = new Set();
const seenRelevantPosts = new Set(JSON.parse(fs.readFileSync('./seen.json', 'utf8')));
window.startPolling = (callback) => {
    setInterval(() => {
        reddit.getSubreddit('GameSale').getNew().then(submissions => {
            let foundNew = false;
            for (let i = submissions.length - 1; i >= 0; i--) {
                const submission = submissions[i];
                if (seenRelevantPosts.has(submission.id) || seenPosts.has(submission.id)) {
                    continue;
                }
                seenPosts.add(submission.id);
                const text = (submission.title + " " + submission.selftext).toLowerCase();
                for (let searchRegex of searchRegexes) {
                    if (searchRegex.test(text)) {
                        foundNew = true;
                        seenRelevantPosts.add(submission.id);
                        callback(submission);
                        break;
                    }
                }
            }
            if (foundNew) {
                fs.writeFileSync('./seen.json', JSON.stringify(Array.from(seenRelevantPosts)));
            }
        });
    }, 1000);
}
window.moment = moment;
window.shell = shell;
window.mainWindow = require('electron-main-window').getMainWindow();
window.ipcRenderer = ipcRenderer;
