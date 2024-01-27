document.addEventListener('DOMContentLoaded', function () {
    displayHeading();
    loadTasks();
    document.getElementById('add-button').addEventListener('click', addTask);
});

function displayHeading() {
    const heading = document.createElement('div');
    heading.classList.add('heading');

    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);

    heading.innerHTML = `<h2>${formattedDate}</h2>`;

    document.body.insertBefore(heading, document.body.firstChild);
}

// Rest of your existing code remains unchanged...


function loadTasks() {
    chrome.storage.sync.get({ tasks: [] }, function (result) {
        const tasks = result.tasks;
        const todoList = document.getElementById('todo-list');

        todoList.innerHTML = '';

        tasks.forEach(function (task, index) {
            const taskElement = createTaskElement(task, index + 1);
            todoList.appendChild(taskElement);
        });
    });
}

function addTask() {
    const taskInput = document.getElementById('task-input');
    const taskText = taskInput.value.trim();

    if (taskText !== '') {
        chrome.storage.sync.get({ tasks: [] }, function (result) {
            const tasks = result.tasks;
            tasks.push({ text: taskText, completed: false });

            chrome.storage.sync.set({ tasks: tasks }, function () {
                loadTasks();
                taskInput.value = '';
            });
        });
    }
}

function createTaskElement(task, number) {
    const taskElement = document.createElement('div');
    taskElement.classList.add('task-item');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;

    const numberSpan = document.createElement('span');
    numberSpan.classList.add('number');
    numberSpan.textContent = `${number}.`;

    const textSpan = document.createElement('span');
    textSpan.textContent = task.text;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        deleteTask(task);
    });

    taskElement.appendChild(checkbox);
    taskElement.appendChild(numberSpan);
    taskElement.appendChild(textSpan);
    taskElement.appendChild(deleteButton);

    // Add event listener for checkbox
    checkbox.addEventListener('change', function () {
        completeTask(taskElement, task);
    });

    return taskElement;
}


function completeTask(taskElement, task) {
    chrome.storage.sync.get({ tasks: [] }, function (result) {
        const tasks = result.tasks;
        const index = tasks.findIndex(t => t.text === task.text);  // Find the index of the task

        if (index !== -1) {
            tasks[index].completed = !tasks[index].completed;

            chrome.storage.sync.set({ tasks: tasks }, function () {
                loadTasks();

                if (tasks[index].completed) {
                    // If task is completed, hide the text after 2 seconds
                    const textSpan = taskElement.querySelector('span');
                    textSpan.style.textDecoration = 'line-through';
                    setTimeout(() => {
                        textSpan.style.display = 'none';
                    }, 2000);
                } else {
                    // If task is unchecked, show the text again
                    const textSpan = taskElement.querySelector('span');
                    textSpan.style.textDecoration = '';
                    textSpan.style.display = 'inline';
                }
            });
        }
    });
}

function deleteTask(task) {
    chrome.storage.sync.get({ tasks: [] }, function (result) {
        const tasks = result.tasks;
        const index = tasks.findIndex(t => t.text === task.text);

        if (index !== -1) {
            tasks.splice(index, 1);
            chrome.storage.sync.set({ tasks: tasks }, function () {
                loadTasks();
            });
        }
    });
}
