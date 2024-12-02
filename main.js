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

// Togle the header on/off
let HeaderToggleStatus = true;
function toggleHeader() {
    if (HeaderToggleStatus) {
        document.querySelector('.navbar--logo').style.display = 'none';
        document.querySelector('.navbar--center').style.display = 'none';
        document.querySelector('.navbar--search').style.background = 'none';
        document.getElementById('search_salt_input').style.display = 'none';

        document.getElementById('btn_header_toggle').style.display = 'block';
        document.getElementById('btn_header_toggle').style.position = 'absolute';
        document.getElementById('btn_header_toggle').style.float = 'right';
        document.getElementById('btn_header_toggle').style.right = '10px';
        document.getElementById('btn_header_toggle').style.top = '1em';
        document.getElementById('btn_header_toggle').style.marginTop = '10px';

        HeaderToggleStatus = false;
    } else {
        document.querySelector('.navbar--logo').style.display = 'block',
            document.querySelector('.navbar--center').style.display = 'block',
            document.getElementById('search_salt_input').style.display = 'block',
            document.querySelector('.navbar--search').style.background = 'linear-gradient(to bottom, #37577a, #273646)';
        document.getElementById('btn_header_toggle').style.display = 'block';
        // document.getElementById('btn_header_toggle').style.position = 'absolute';
        document.getElementById('btn_header_toggle').style.float = 'right';
        document.getElementById('btn_header_toggle').style.right = '10px';
        document.getElementById('btn_header_toggle').style.top = '4em';
        document.getElementById('btn_header_toggle').style.marginTop = '10px';

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
function showTaskResults(results) {
    /* Search parent document (from iframe)  for the TaskResults div */
    /*  and fill it with the results, changing the display from hidden to block */
    window.parent.document.getElementsByClassName("TaskResults")[0].style.display = 'flex'
    window.parent.document.getElementsByClassName("TaskResults")[0].innerHTML = JSON.stringify(results, null, 2);
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

        fetch('http://127.0.0.1:8000/masters/run_job', {
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
                showTaskResults(json);
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
        const response = await fetch('http://127.0.0.1:8000/masters/token', {
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

    const tokensModal = document.getElementById('tokensModal')
    if (tokensModal) {
        tokensModal.addEventListener('show.bs.modal', event => {
            // Button that triggered the modal
            const button = event.relatedTarget

            // Extract info from data-bs-* attributes
            const items = button.getAttribute('data-bs-customData')

            // Update the modal's content.
            const modalTitle = tokensModal.querySelector('.modal-title')
            modalTitle.textContent = `Available ${items}`
            
            // Get tokens from session storage
            const tokens = JSON.parse(sessionStorage.getItem('tokens') || '{}');

            const modalBody = tokensModal.querySelector('.modal-body')

            const selectList = document.createElement("select");
            selectList.id = "tokensSelect";
            modalBody.appendChild(selectList);

            for (let key in tokens) {
                let option = document.createElement("option");
                option.value = key;
                option.textContent = `${key}: ${tokens[key]}`;
                selectList.appendChild(option);
            }
        })

        /* Clean up the modal when it is hidden */
        tokensModal.addEventListener('hidden.bs.modal', event => {
            document.getElementById('tokensSelect').remove();
        })
    }
}

function pickToken() {
    /* Get the selected token from the modal and set it in the token field */
    // const server = document.getElementById('tokensSelect').value;
    const token = document.getElementById('tokensSelect').textContent.split(': ')[1]

    document.getElementById('token').value = token;
    
    // Hide the modal
    const tokensModal = document.getElementById('tokensModal');
    const modalInstance = bootstrap.Modal.getInstance(tokensModal);
    modalInstance.hide();
}


async function copyToken() {
    /* Get the selected token from the modal and copy it to the clipboard */
    // const server = document.getElementById('tokensSelect').value;
    const token = document.getElementById('tokensSelect').textContent.split(': ')[1]
    console.log("ADRIAN")
    console.log("ADRIAN: ", token)
    await navigator.clipboard.writeText(token);
    
    // Hide the modal
    const tokensModal = document.getElementById('tokensModal');
    const modalInstance = bootstrap.Modal.getInstance(tokensModal);
    modalInstance.hide();
}

