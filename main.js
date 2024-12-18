const FA_BASEURL = 'http://127.0.0.1:8000'
const ENDPOINT_MASTERS = 'masters'

function setTheme(theme) {
    console.log('Setting theme to ' + theme);
    const htmlElement = document.documentElement;
    htmlElement.setAttribute('data-bs-theme', theme);
}


function includeHTML() {
    var z, i, elmnt, file, xhttp;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("w3-include-html");
        if (file) {
            /* Make an HTTP request using the attribute value as the file name: */
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.removeAttribute("w3-include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}


function getNavbarLogoComputedDisplay() {
    return window.getComputedStyle(document.querySelector('.navbar--logo')).display;
}
let navbarLogoComputedDisplay = null;
function loadNavbar() {
    navbarLogoComputedDisplay = getNavbarLogoComputedDisplay();
}

// Togle the header on/off
let HeaderToggleStatus = true;
function toggleHeader() {
    if (HeaderToggleStatus) {
        navbarLogoComputedDisplay = getNavbarLogoComputedDisplay();
        document.querySelector('.navbar--logo').style.display = 'none';
        document.querySelector('.navbar--center').style.display = 'none';
        document.querySelector('.navbar--search').style.background = 'none';
        document.getElementById('search_salt_input').style.display = 'none';
        HeaderToggleStatus = false;
    } else {
        // Show the navbar--logo based on previous to toggle status and if viewport width is larger than 991px
        let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        console.log('Viewport width:', vw);
        if (vw > 991) {
            document.querySelector('.navbar--logo').style.display = navbarLogoComputedDisplay
        }
        document.querySelector('.navbar--center').style.display = 'block',
            document.getElementById('search_salt_input').style.display = 'block',
            document.querySelector('.navbar--search').style.background = 'linear-gradient(to bottom, #37577a, #273646)';
        HeaderToggleStatus = true;
    }
}


function toggleTaskInfo() {

    /* Hide all task info divs, then show the one that was clicked */
    const target_id = event.target.id
    const allTaskInfos = document.querySelectorAll('.tasks_info [class^="hide_"]');
    console.log('Running toggleTaskInfo for ' + target_id);

    /* Hide all task info divs */
    allTaskInfos.forEach(taskInfo => {
        taskInfo.style.display = 'none';
    });

    /* Show the one that was clicked */
    const taskInfo = document.querySelector('.tasks_info .hide_' + target_id);
    if (taskInfo != null) {
        if (taskInfo.style.display === 'none' || taskInfo.style.display === '') {
            // Show the task info iframe
            taskInfo.style.display = 'flex';
            console.log('Unhided  ' + target_id);

            // Set the iframe height to the content height
            const sheight = taskInfo.contentWindow.document.body;
            console.log('Set iframe height to ' + sheight.scrollHeight + 'px');
            taskInfo.style.height = sheight.scrollHeight + 'px';


        } else {
            taskInfo.style.display = 'none';
        }
    }

    /* Set the form field and values for the selected target_id form */
    setRunTaskForm(target_id);


    /* Hide the results div */
    clear_TaskResults();
}


function setRunTaskForm(target_id) {
    /* Set the form field and values for task_check_minion_status */
    if (target_id == 'task_check_minion_status') {
        console.log('>>>> Change form fields and values for task_check_minion_status');

        document.getElementById('iframe_tasks').contentWindow.document.getElementById('RunTaskForm').fun.value = 'test.ping';

        /* hide fun, arg, kwarg fields and labels */
        const fields = ['fun', 'arg', 'kwarg'];
        fields.forEach(field => {
            console.log('>>>> Change field ' + field);
            var elem_field = document.getElementById('iframe_tasks').contentWindow.document.getElementById('RunTaskForm')[field];
            readOnly_field(elem_field);
            elem_field.style.display = 'none';
            var elem_label = document.getElementById('iframe_tasks').contentWindow.document.getElementById('label_' + field);
            document.getElementById('iframe_tasks').contentWindow.document.getElementById('label_' + field).hidden = true;
        });
    }

}

function readOnly_field(elem_field) {
    /* Set field to readonly and dark the background */
    elem_field.readOnly = true;
    elem_field.style.background = 'darkslategray';
    elem_field.style.color = 'lightgray';
}


/* Function to clear the task results */
function clear_TaskResults() {
    console.log('Clearing TaskResults');
    if (window.parent.document.getElementsByClassName("TaskResults").length === 0) {
        return;
    }

    window.parent.document.getElementsByClassName("TaskResults")[0].innerHTML = '';
    window.parent.document.getElementsByClassName("TaskResults")[0].style.display = "none";
}


/* Function to show the results of a task */
function showTaskResults(results, get_async_jid=false) {
    /* Search parent document (from iframe)  for the TaskResults div */
    /*  and fill it with the results, changing the display from hidden to block */
    
    if (get_async_jid) {
        console.log('>>>> get_async_jid is true');
        const async_jid = results.return[0].jid;
        toast('Job ID for async job: ' + async_jid);

        // Save the async_jid to session storage
        saveAsyncJIDs_toSessStor(async_jid);
    } else {
        toast('Job results received');
    }
    window.parent.document.getElementsByClassName("TaskResults")[0].style.display = 'flex'
    window.parent.document.getElementsByClassName("TaskResults")[0].innerHTML = JSON.stringify(results, null, 2);
}

function saveAsyncJIDs_toSessStor(async_jid) {
    const asyncJids = JSON.parse(sessionStorage.getItem('asyncJIDs') || '[]');
    asyncJids.push(async_jid);
    sessionStorage.setItem('async_jid', JSON.stringify(asyncJids));
    toast('Async Job ID saved to session storage');
}

function submitRunTaskForm() {
    /* Run Task Form */
    document.getElementById('RunTaskForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const data = {
            client: document.getElementById('client').value,
            eauth: document.getElementById('eauth').value,
            fun: document.getElementById('fun').value,
            tgt: document.getElementById('tgt').value,
            arg: JSON.parse(document.getElementById('arg').value || '[]'),
            kwarg: JSON.parse(document.getElementById('kwarg').value || '{}')
        };

        console.log('Sending POST: ', data);

        // Set the step 1 color to green
        turnOn_steps(0, 0);

        fetch(`${FA_BASEURL}/${ENDPOINT_MASTERS}/run_job`, {
            method: 'POST',
            mode: "cors",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.json())
            .then(json => {
                console.log(json);
                toast('Job sent');

                let get_async_jid = false
                if (data.client === 'local_async') {
                    console.log('Local async job');
                    get_async_jid = true
                }
                // Show the results
                showTaskResults(json, get_async_jid);
            })
            .catch(err => console.log('Request failed', err));


        // Set the step 2 color to green
        turnOn_steps(1, 500);
        turnOn_steps(2, 800);
        turnOn_steps(3, 1000);

        turnOff_steps(5000);
    });

}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function turnOn_steps(step_idx, sleep_ms) {
    await sleep(sleep_ms);
    console.log('>>>> Waited for ' + sleep_ms + ' miliseconds');

    // Set the flow step color to green
    const step = document.getElementsByClassName('task_run_event-step')[step_idx];
    step.style.backgroundColor = 'green';
    step.style.transform = 'scale(1.2)';
}

async function turnOff_steps(sleep_ms) {
    await sleep(sleep_ms);
    console.log('>>>> Waited for ' + sleep_ms + ' miliseconds');
    console.log('>>>> Turn off steps');

    // Set the flow step color to green
    const step = document.getElementsByClassName('task_run_event-step');
    Array.from(step).forEach(s => {
        s.style.backgroundColor = 'blue';
        s.style.transform = '';
    });

}


function getParentDocument() {
    /* Function to get visibility and access to the parent document from an iframe */
    // NOT IN USE
    if (window.parent && window.parent !== window) {
        console.log(window.parent.document);
        const elements = window.parent.document.getElementsByTagName('*');
        for (let i = 0; i < elements.length; i++) {
            console.log(elements[i]);
        }

    } else {
        console.log('No parent document found or same as current document.');
        return null;
    }
}


/* get token */
async function getToken(master, username, password) {
    const data = {
        eauth: "pam",
        password: password,
        url: "https://localhost:8003",
        username: username
    };
    console.log('Fetching token with:', data);
    clearTaskOutcomeResults();

    const div_task_outcome_results = window.parent.document.getElementById('TaskResults');
    div_task_outcome_results.style.display = 'block';

    try {
        const response = await fetch(`${FA_BASEURL}/${ENDPOINT_MASTERS}/token`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const token = await response.json();
        div_task_outcome_results.innerHTML = token;

        /* Save token to session storage */
        let tokens = JSON.parse(sessionStorage.getItem('tokens')) || {};
        tokens[master] = token;
        sessionStorage.setItem('tokens', JSON.stringify(tokens));
        console.log('Token fetched successfully and saved to session storage:' + token);

        toast(`New token retrieved`);
        return token;
    } catch (error) {
        console.error('Failed to fetch token:', error);
        div_task_outcome_results.innerHTML = 'Failed to fetch token: ' + error;
    }
}


function clearTaskOutcomeResults() {
    const div_task_outcome_results = window.parent.document.getElementById('TaskResults');
    div_task_outcome_results.innerHTML = '';
}


function getMasterToken_fromSessStor() {
    const master = document.getElementById('master').value;
    const tokens = JSON.parse(sessionStorage.getItem('tokens') || '{}');
    const token = tokens[master] || '';
    console.log('Token fetched from session storage:', token);
    document.getElementById('token').value = token;
    return token;
}


function tokensModalData() {
    /* Get tokens from session storage and populate the modal */

    // Create a select list element to hold the tokens
    const tokensModal = document.getElementById('tokensModal')
    const selectList = document.createElement("select");
    selectList.id = "tokensSelect";

    if (tokensModal) {
        tokensModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            console.log('Button that triggered the modal:', button)

            // Extract info from data-bs-* attributes
            const itemsName = button.getAttribute('data-bs-customData')

            // Update the modal's content.
            const modalTitle = tokensModal.querySelector('.modal-title')
            modalTitle.textContent = `Available ${itemsName}`

            // Get tokens from session storage
            const tokens = JSON.parse(sessionStorage.getItem('tokens') || '{}');
            console.log('tokens:', tokens);

            if (Object.keys(tokens).length > 0) {

                const modalBody = tokensModal.querySelector('.modal-body')
                modalBody.appendChild(selectList);

                for (let key in tokens) {
                    let option = document.createElement("option");
                    option.value = key;
                    option.textContent = `${key}: ${tokens[key]}`;
                    selectList.appendChild(option);
                }
            }
        })

        /* Clean up the modal when it is hidden removing the select list element */
        tokensModal.addEventListener('hidden.bs.modal', event => {
            selectList.remove();
        })
    }
}

function pickToken() {
    /* Get the selected token from the modal and set it in the token field */
    const token = document.getElementById('tokensSelect').textContent.split(': ')[1]

    document.getElementById('token').value = token;

    // Hide the modal
    const modal = document.getElementById('tokensModal');
    hideModal(modal);
}

async function copyToken() {
    /* Get the selected token from the modal and copy it to the clipboard */
    const token = document.getElementById('tokensSelect').textContent.split(': ')[1]

    clipboardCopy(token);
    // Hide the modal
    const tokensModal = document.getElementById('tokensModal');
    hideModal(tokensModal);

}


function ServersStatusModalData(elemModal, serverType) {
    /* Get masters and minions from session storage and populate the modal */

    // Create a select list element to hold the elements
    const selectList_id = 'modalSelect' // Used later to populate the select list
    const selectList = document.createElement("select");
    selectList.id = selectList_id;

    const modal = document.getElementById(elemModal)
    if (modal) {
        modal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget
            console.log('Button that triggered the modal:', button)

            // Extract info from data-bs-* attributes
            const itemsName = button.getAttribute('data-bs-customData')

            // Update the modal's content.
            const modalTitle = modal.querySelector('.modal-title')
            modalTitle.textContent = `Available ${itemsName}`

            // Get data from session storage
            // Only keys for masters
            const servers = Object.keys(JSON.parse(sessionStorage.getItem(serverType) || '{}'));

            // Fill up select list with known servers
            const modalBody = modal.querySelector('.modal-body')
            modalBody.appendChild(selectList);
            for (let key in servers) {
                let option = document.createElement("option");
                option.value = key;
                option.textContent = `${key}: ${servers[key]}`;
                selectList.appendChild(option);
            }
        })

        /* Clean up the modal when it is hidden removing the select list element */
        modal.addEventListener('hidden.bs.modal', event => {
            selectList.remove();
        })
    }
}

function setURL_fromServerType(serverType) {
    if (serverType.toLowerCase() == 'masters') {
        console.log('Querying masters');
        url = `${FA_BASEURL}/${ENDPOINT_MASTERS}`;
        sessStgItem = 'masters';
    } else if (serverType.toLowerCase() == 'minions') {
        console.log('Querying minions');
        url = `${FA_BASEURL}/${ENDPOINT_MASTERS}/minions`;
        sessStgItem = 'minions'
    } else {
        console.error('Invalid server type specified');
    }

    return url;
}


/* Function to query for Masters or Minions status in HTML */
async function queryServersStatus_HTML(serverType = '') {
    // Get the token from the form

    console.log('Query Server status for:', serverType);
    clearTaskOutcomeResults();

    const div_task_outcome_results = window.parent.document.getElementById('TaskResults');
    div_task_outcome_results.style.display = 'block';

    url = setURL_fromServerType(serverType)

    queryServersStatusFetch(url)
        .then(response => {
            div_task_outcome_results.innerHTML = JSON.stringify(response);
            sessionStorage.setItem(serverType, JSON.stringify(response));
        })
        .catch((error) => {
            console.error('Fetch Error:', error)
            div_task_outcome_results.innerHTML = 'Failed to fetch data: ' + error;
        })

}


async function queryServersStatus(serverType = null) {
    /* Query for Masters or Minions status */
    if (!serverType) {
        console.error('No server type specified');
        return;
    }

    url = setURL_fromServerType(serverType)

    // Fetch the data and save it to session storage
    queryServersStatusFetch(url).then(response => {
        sessionStorage.setItem(serverType, JSON.stringify(response));
    });

}

async function queryServersStatusFetch(url) {
    const response = await fetch(url);
    console.log(response)

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`

        );
    }
    const resp = await response.json();
    console.log('QueryServersStatusFetch:', resp);
    return resp;
}


function pickFromModal_Servers(elemModal, sessStgItemName) {
    /* Get the selected item from the modal and set it in the master field */

    const itemSelected = document.getElementById('modalSelect').textContent.split(': ')[1]

    sessionStorage.setItem(sessStgItemName, itemSelected);
    clipboardCopy(itemSelected)

    // Hide the modal
    const modal = document.getElementById(elemModal);
    hideModal(modal);
}


function hideModal(elemModal) {
    const modalInstance = bootstrap.Modal.getInstance(elemModal);
    modalInstance.hide();
}

function clipboardCopy(msg) {
    navigator.clipboard.writeText(msg);
    toast('Copied to clipboard');

}

function toast(msg, gravity = "top", position = "right") {
    Toastify({
        text: msg,
        duration: 3000,
        style: {
            background: "rgb(57, 41, 41)",
            borderradius: "20px",
            textWrapStyle: "pretty",
            maxWidth: "40ch"
            
        },
        gravity: gravity,
        position: position
    }).showToast();
}

