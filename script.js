const taskListCont = JSON.parse(localStorage.getItem('tasks')) || {};

class App {
  static main() {
    const notStartedTaskList = new TaskList('Started');
    const inProgressTaskList = new TaskList('Progress');
    const completedTaskList = new TaskList('Completed');
  }
}
class TaskList {
  tasks = [];
  constructor(type) {
    this.type = type;

    this.addButtonConnect();
    this.connectDrop();
    this.addingArrtoTaskListcont();
    this.gettingDataFromLocalStorage();
  }
  gettingDataFromLocalStorage() {
    if (!JSON.parse(localStorage.getItem('tasks'))) {
      return;
    }
    this.tasks.forEach((taskItem) => {
      const template = document.getElementById('template');

      const task = document.importNode(template.content, true);

      const taskEl = task.querySelector('.task--cont');

      taskEl.id = taskItem.taskId;
      taskEl.querySelector('input').value =
        taskItem.value.length === 0 ? 'New task' : taskItem.value;
      const taskListEl = document.querySelector(`.${this.type}`);
      taskListEl.appendChild(taskEl);
    });
    this.tasks.forEach((task, index) => {
      this.tasks[index] = new Task(task.taskId, task.type, task.value);
    });
  }
  addingArrtoTaskListcont() {
    if (!taskListCont[this.type]) {
      taskListCont[this.type] = this.tasks;
    } else {
      this.tasks = taskListCont[this.type];
    }
  }
  addButtonConnect() {
    const addButton = document.querySelector(
      `.${this.type}`
    ).nextElementSibling;
    addButton.addEventListener('click', this.addButtonHandler.bind(this));
  }
  addButtonHandler() {
    const addButton = document.querySelector(
      `.${this.type}`
    ).nextElementSibling;
    const template = document.getElementById('template');

    const task = document.importNode(template.content, true);

    const taskEl = task.querySelector('.task--cont');
    const id = Math.floor(Math.random() * 10000);
    taskEl.id = `${id}`;
    const taskListEl = document.querySelector(`.${this.type}`);
    taskListEl.appendChild(taskEl);

    this.addingNewTask(id);
  }
  addingNewTask(id) {
    this.tasks.push(new Task(id, this.type));
    localStorage.setItem('tasks', JSON.stringify(taskListCont));
  }

  connectDrop() {
    const taskListEl = document.querySelector(`.${this.type}`);
    taskListEl.parentElement.addEventListener('dragenter', (e) => {
      e.preventDefault();
    });
    taskListEl.parentElement.addEventListener('dragover', (e) => {
      e.preventDefault();

      if (e.target.closest('.task--cont')) {
        e.target.closest('.task--cont').classList.add('droppable');
      } else if (e.target.classList.contains('add--button')) {
        e.target.classList.add('droppable');
      }
    });
    taskListEl.parentElement.addEventListener('dragleave', (e) => {
      if (e.target.closest('.task--cont')) {
        e.target.closest('.task--cont').classList.remove('droppable');
      } else if (e.target.classList.contains('add--button')) {
        e.target.classList.remove('droppable');
      }
    });

    taskListEl.parentElement.addEventListener('drop', (e) => {
      const id = +e.dataTransfer.getData('text/plain').split(' ')[0];
      const type1 = e.dataTransfer.getData('text/plain').split(' ')[1];
      if (this.tasks.find((el) => +el.taskId === id)) {
        return;
      }

      let inde;

      taskListCont[type1].forEach((item, index) => {
        if (+item.taskId === id) {
          inde = index;
        }
      });

      const taskmoved = taskListCont[type1].splice(+inde, 1);

      taskmoved[0].type = this.type;
      this.tasks.push(...taskmoved);

      const task = document.getElementById(id);
      if (e.target.closest('.task--cont')) {
        e.target.closest('.task--cont').before(task);
        localStorage.setItem('tasks', JSON.stringify(taskListCont));
        return;
      } else if (e.target.classList.contains('tasks')) {
        const childrenArr = [...e.target.children];
        if (childrenArr.length === 0) {
          taskListEl.appendChild(task);
          localStorage.setItem('tasks', JSON.stringify(taskListCont));
        }
        for (const child of childrenArr) {
          if (child.getBoundingClientRect().top > e.y) {
            child.before(task);

            localStorage.setItem('tasks', JSON.stringify(taskListCont));
            return;
          }
        }
      } else {
        taskListEl.appendChild(task);
      }

      localStorage.setItem('tasks', JSON.stringify(taskListCont));
    });
  }
}
class Task {
  constructor(taskId, type, value) {
    this.type = type;
    this.taskId = taskId;
    this.value = value || 'New task';
    this.connectEditButton();
    this.connectDeleteButton();
    this.connectDrag();
  }
  connectEditButton() {
    const editButton = document
      .getElementById(this.taskId)
      .querySelector('.edit--button');

    const input = editButton.parentElement.previousElementSibling;
    input.addEventListener('input', (e) => {
      this.value = e.target.value;
      localStorage.setItem('tasks', JSON.stringify(taskListCont));
    });
    editButton.addEventListener('click', (e) => {
      input.removeAttribute('readonly');
      input.select();

      input.addEventListener('focusout', () => {
        input.setAttribute('readonly', '');
      });
    });
  }
  connectDrag() {
    const task = document.getElementById(this.taskId);
    task.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', `${this.taskId} ${this.type}`);

      e.dataTransfer.effectAllowed = 'move';
      task.style.opacity = 0.5;
    });
    task.addEventListener('dragend', (e) => {
      task.style.opacity = 1;
      taskListCont[this.type].forEach((ele) => {
        const id = +ele.taskId;
        const taskel = document.getElementById(id);
        taskel.classList.remove('droppable');
      });
      const buttEl = document
        .querySelector(`.${this.type}`)
        .nextElementSibling.classList.remove('droppable');
    });
  }

  connectDeleteButton() {
    const deleteButton = document
      .getElementById(this.taskId)
      .querySelector('.delete--button');

    deleteButton.addEventListener('click', (e) => {
      e.currentTarget.parentElement.parentElement.remove();
      let inde;
      taskListCont[this.type].forEach((item, index) => {
        if (+item.taskId === +this.taskId) {
          inde = index;
        }
      });
      taskListCont[this.type].splice(inde, 1);
      localStorage.setItem('tasks', JSON.stringify(taskListCont));
    });
  }
}
App.main();
