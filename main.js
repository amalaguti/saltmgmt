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
        xhttp.onreadystatechange = function() {
          if (this.readyState == 4) {
            if (this.status == 200) {elmnt.innerHTML = this.responseText;}
            if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
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
            taskInfo.style.display = 'block';
            console.log('Unhided  ' + target_id);
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
        
        const fields = ['client', 'fun', 'arg', 'kwarg'];
        fields.forEach(field => {
            var elem_field = document.getElementById('iframe_tasks').contentWindow.document.getElementById('RunTaskForm')[field];
            readOnly_field(elem_field);
        });
    }

}

function readOnly_field(elem_field) {
    /* Set field to readonly and dark the background */
    elem_field.readOnly = true;
    elem_field.style.background='darkslategray';
    elem_field.style.color='lightgray';
}


/* Function to clear the task results */
function clear_TaskResults() {
    /* Search for the iframe and the TaskResults div */
    var iframe = document.getElementById("iframe_tasks");
    if (iframe == null) {
        return;
    }

    var elmnt = iframe.contentWindow.document.getElementById("TaskResults");
    elmnt.innerHTML = '';
    elmnt.style.display = "none";
}


/* Function to show the results of a task */
function showTaskResults(results) {
    const taskResultsDiv = document.querySelector('#TaskResults');
    taskResultsDiv.style.display = 'block';
    taskResultsDiv.innerHTML = JSON.stringify(results, null, 2);
}


function submitRunTaskForm() {
    /* Run Task Form */
    document.getElementById('RunTaskForm').addEventListener('submit', function(event) {
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

    });
}
