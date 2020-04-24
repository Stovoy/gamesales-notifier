function flash() {
    window.mainWindow.hide();
    window.mainWindow.show();

    const flashBackground = (highlight, remaining) => {
        if (highlight) {
            document.body.style.backgroundColor = 'darkred';
        } else {
            document.body.style.backgroundColor = '';
        }

        remaining -= 1;
        if (remaining >= 0) {
            setTimeout(() => {
                if (remaining === 0) {
                    flashBackground(false, 0);
                } else {
                    flashBackground(!highlight, remaining);
                }
            }, 500);
        }
    };

    flashBackground(true, 10);
}

window.addEventListener('DOMContentLoaded', () => {
    startPolling((submission) => {
        const creationTime = moment.unix(submission.created_utc).tz('America/Los_Angeles').format('MM/DD/YYYY h:mm a');

        const list = document.getElementById('links');
        const item = document.createElement('li');
        const link = document.createElement('a');
        const text = `${creationTime} - ${submission.title}`;
        link.appendChild(document.createTextNode(text));
        link.href = submission.url;
        item.appendChild(link);
        list.prepend(item);

        window.ipcRenderer.send('sendSms', `${creationTime} - ${submission.title}: ${submission.url}`);

        flash();
    });

    $(document).on('click', 'a[href^="http"]', function (event) {
        event.preventDefault();
        shell.openExternal(this.href);
    });
});

