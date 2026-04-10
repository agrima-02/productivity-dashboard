let user = localStorage.getItem("user");

function login(){
  user = username.value;
  localStorage.setItem("user", user);
  init();
}

function init(){
  if(user){
    loginBox.style.display = "none";
    welcome.innerText = "Hello " + user;
  }
}
init();

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let boards = JSON.parse(localStorage.getItem("boards")) || ["Default"];
let editId = null, undo = null;

function addBoard(){
  let name = prompt("Board name");
  if(name){
    boards.push(name);
    localStorage.setItem("boards", JSON.stringify(boards));
    loadBoards();
  }
}

function loadBoards(){
  boardSelect.innerHTML = "";
  boards.forEach(b => {
    boardSelect.innerHTML += `<option>${b}</option>`;
  });
}
loadBoards();

function openForm(){ form.style.display = "block"; }
function closeForm(){ form.style.display = "none"; }

function saveTask(){
  let t = {
    id: editId || Date.now(),
    title: title.value,
    priority: priority.value,
    dueDate: dueDate.value,
    status: "todo",
    board: boardSelect.value,
    tags: tags.value ? tags.value.split(",") : [],
    important: false
  };

  if(editId){
    let i = tasks.findIndex(x => x.id === editId);
    t.status = tasks[i].status;
    t.important = tasks[i].important;
    tasks[i] = t;
    editId = null;
  } else {
    tasks.push(t);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
  closeForm();
}

function renderTasks(){
  document.querySelectorAll(".column div").forEach(c => c.innerHTML = "");

  let searchVal = search.value.toLowerCase();
  let filter = filterPriority.value;
  let board = boardSelect.value;

  let done = 0, over = 0;

  tasks.forEach(t => {

    if(t.board !== board) return;

    if(!t.title.toLowerCase().includes(searchVal)) return;

    if(filter !== "all" && t.priority !== filter) return;

    let div = document.createElement("div");
    div.className = "task " + t.priority;

    if(t.important) div.classList.add("important");

    if(new Date(t.dueDate) < new Date() && t.status !== "done"){
      div.style.border = "2px solid red";
      over++;
    }

    if(t.status === "done") done++;

    div.innerHTML = `
      ${t.title}<br>
      ${t.tags.join(", ")}<br>
      <button onclick="toggleImportant(${t.id})">⭐</button>
      <button onclick="editTask(${t.id})">Edit</button>
      <button onclick="delTask(${t.id})">Delete</button>
    `;

    div.draggable = true;
    div.id = t.id;
    div.ondragstart = drag;

    document.querySelector(`#${t.status} div`).appendChild(div);
  });

  insights.innerText = `Done: ${done} | Overdue: ${over} | Total: ${tasks.length}`;

  drawChart(done, tasks.length);
}

function editTask(id){
  let t = tasks.find(x => x.id === id);
  editId = id;

  title.value = t.title;
  priority.value = t.priority;
  dueDate.value = t.dueDate;
  tags.value = t.tags.join(",");

  openForm();
}

function delTask(id){
  undo = tasks.find(x => x.id === id);
  tasks = tasks.filter(x => x.id !== id);
  renderTasks();

  if(confirm("Undo delete?")){
    tasks.push(undo);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function toggleImportant(id){
  let t = tasks.find(x => x.id === id);
  t.important = !t.important;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function allowDrop(e){ e.preventDefault(); }

function drag(e){
  e.dataTransfer.setData("text", e.target.id);
}

function drop(e){
  e.preventDefault();

  let id = e.dataTransfer.getData("text");
  let t = tasks.find(x => x.id == id);

  t.status = e.currentTarget.id;

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function drawChart(done, total){
  let ctx = chart.getContext("2d");
  ctx.clearRect(0, 0, 400, 200);

  let percent = done / (total || 1);

  ctx.fillRect(50, 100, 300 * percent, 30);
  ctx.fillRect(50 + 300 * percent, 100, 300 * (1 - percent), 30);
}

search.addEventListener("input", renderTasks);
filterPriority.addEventListener("change", renderTasks);

renderTasks();
