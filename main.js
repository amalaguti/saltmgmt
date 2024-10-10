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
    if (taskInfo.style.display === 'none' || taskInfo.style.display === '') {
        taskInfo.style.display = 'block';
    } else {
        taskInfo.style.display = 'none';
    }
    
}
