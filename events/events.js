let eventSource;

function stopEventWatcher() {
    if (eventSource) {
        eventSource.close();
        console.log('Event source closed.');
    } else {
        console.log('No event source to close.');
    }
}

function eventWatcher() {
    const XAuthToken = '365bd7c75e055f0ce50a37ad0c4fd2db945cd4e3';
    const master = 'localhost';
    const port = '8003';
    const jid = '*';
    const minion = '*';
    const url = `https://${master}:${port}/events?salt_token=${XAuthToken}`;
    console.log(`>>>> Event Watcher for ${url}`);
    eventSource = new EventSource(`${url}`);
    console.log('ADRIAN: eventSource', eventSource);

    
    const maxEvents = 10;
    const eventsContainer = document.getElementById('events');

    const tag_pattern = `salt/job/${jid}/ret/${minion}`;
    console.log(`>>>> tag_pattern ${tag_pattern}`);
    var isJobReturn = fnmatch(tag_pattern);

    eventSource.onmessage = function (event) {
        const eventData = JSON.parse(event.data);
        <!-- console.log(`>>>> new event tag ${eventData.tag}`); -->

        if (isJobReturn(eventData.tag)) {
            console.log(`>>>> Job return event ${eventData.tag}, process it !!!`);
            console.log(`>>>> ${JSON.stringify(eventData.data)}`);
            const eventDiv = document.createElement('div');
            const eventText = `Tag: ${eventData.tag}\nID: ${eventData.data.id}\nJID: ${eventData.data.jid}`;
            eventDiv.innerText = `
                TAG: ${eventData.tag}
                MINION:  ${eventData.data.id}
                JID: ${eventData.data.jid}
                DATA: ${JSON.stringify(eventData.data)}
            `;

            eventsContainer.appendChild(eventDiv);
            if (eventsContainer.children.length > maxEvents) {
                eventsContainer.removeChild(eventsContainer.firstChild);
            }
        }
    };


    eventSource.onerror = function () {
        console.error('Error occurred while connecting to the event source.');
        eventSource.close();
    };

}


// A simple function to allow Salt-style globbing on event tags.
function fnmatch(pattern) {
    if (pattern.indexOf('*') === -1) {
        return filename => pattern === filename;
    } else {
        // Taken from Lodash (MIT).
        // Use _.escapeRegExp directly if available.
        var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
        var escaped = pattern.replace(reRegExpChar, '\\$&');
        var matcher = new RegExp('^' + escaped.replace(/\\\*/g, '.*') + '$');
        return filename => matcher.test(filename);
    }
}
