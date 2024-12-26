let _eventSource;

function stopEventWatcher(message) {
    if (_eventSource) {
        _eventSource.close();
        console.log('Event source closed.');
        const eventsDiv = window.parent.document.getElementById('events');
        const eventDiv = document.createElement('div');
        if (message) {
            eventDiv.innerText = message;
        } else {
            eventDiv.innerText = 'Event source closed.';
        }
        eventsDiv.appendChild(eventDiv);

    } else {
        console.log('No event source to close.');
    }
}

function clearEvents() {
    const eventsDiv = window.parent.document.getElementById('events');
    eventsDiv.innerHTML = '';
    eventsDiv.classList.add('hideME');
}

function eventWatcher(token, master, jid, minion) {
    /* Watch for events from the Salt Master 
    For each received and filtered in event it creates
    a new div element as child of the events div which is initially
    hidden */

    const masterName = masterMap(master)
    console.log(`>>>> Master Name: ${masterName}`);
    
    if (typeof token === 'string' && token.trim() === '') {
        console.log('Token is an empty string.');
    }

    if (typeof jid === 'string' && jid.trim().length === 20) {
        console.log('JID is a valid timestamp.');
    } else if (typeof jid === 'string' && jid.trim().length >= 8 && jid.trim().length < 20) {
        console.log('JID is a valid complete job id.');
        jid += '*';
    } else {
        jid = '*';
    }

    if (typeof minion === 'string' && minion.trim() === '') {
        minion =  '*';
    }

    const XAuthToken = token;

    console.log(`>>>> XAuthToken ${XAuthToken}`);
    console.log(`>>>> Master ${masterName}`);
    console.log(`>>>> JID ${jid}`);
    console.log(`>>>> Minion ${minion}`);
    
    const url = `https://${masterName}/events?salt_token=${XAuthToken}`;
    console.log(`>>>> Event Watcher for ${url}`);
    _eventSource = new EventSource(`${url}`);
    
    const maxEvents = 5;
    let receivedEvents = 0;
    const maxCloseEvents = 100;
    const eventsContainer = window.parent.document.getElementById('div_task_outcome');

    console.log('>>>> eventsContainer width', eventsContainer.offsetWidth);
    
    const tag_pattern = `salt/job/${jid}/ret/${minion}`;
    console.log(`>>>> tag_pattern ${tag_pattern}`);
    var isJobReturn = fnmatch(tag_pattern);
    
    const eventsDiv = window.parent.document.getElementById('events');
    eventsDiv.classList.remove('hideME');

    _eventSource.onmessage = function (event) {
        const eventData = JSON.parse(event.data);
        const eventDiv = document.createElement('div');
        eventDiv.style.width = `${eventsContainer.offsetWidth - 40}px`;
        
        receivedEvents += 1;
        console.log('>>>> Events received:' + receivedEvents);

        if (isJobReturn(eventData.tag)) {
            console.log(`>>>> Job return event ${eventData.tag}, process it !!!`);
            console.log(`>>>> ${JSON.stringify(eventData.data)}`);

            eventDiv.innerText = `
                TAG: ${eventData.tag}
                MINION:  ${eventData.data.id}
                JID: ${eventData.data.jid}
                DATA: ${JSON.stringify(eventData.data)}
            `;

            toast(`New event received: ${eventData.tag}`, "bottom", "right");
            eventsDiv.appendChild(eventDiv);
            if (eventsContainer.children.length > maxEvents) {
                eventsContainer.removeChild(eventsContainer.firstChild);
            }
        }

        if ( receivedEvents > maxCloseEvents) {
            console.log('>>>> Forced closing event source, max events reached');
            stopEventWatcher('Event source closed, max events reached');
        }
    };


    _eventSource.onerror = function () {
        console.error('Error occurred while connecting to the event source.');
        _eventSource.close();
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
