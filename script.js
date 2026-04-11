let users={agrima:"agrima02",meenu:"meenu07"};
let currentUser=localStorage.getItem("currentUser")||sessionStorage.getItem("currentUser");

let tasks=[],waterData={},stepsData={};
let editId = null;

function login(){
    let u=loginUser.value,p=loginPass.value,remember=rememberMe.checked;

    if(users[u]===p){
        currentUser=u;
        remember?localStorage.setItem("currentUser",u):sessionStorage.setItem("currentUser",u);
        loginError.innerText="";
        showDashboard();
        loadUserData();
    }else loginError.innerText="Invalid username or password";
}

function logout(){
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    location.reload();
}

function showDashboard(){
    loginPage.style.display="none";
    dashboard.style.display="block";
}

function loadUserData(){
    tasks=JSON.parse(localStorage.getItem(currentUser+"_tasks"))||[];
    waterData=JSON.parse(localStorage.getItem(currentUser+"_water"))||{};
    stepsData=JSON.parse(localStorage.getItem(currentUser+"_steps"))||{};
    displayTasks();updateWater();updateSteps();updateGoals();
}

function saveTasks(){
    localStorage.setItem(currentUser+"_tasks",JSON.stringify(tasks));
}

function today(){
    let d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function addTask(){
    let text = taskInput.value.trim();
    let pr = priority.value;
    let date = dueDate.value;

    if(!text || !date) return alert("Enter task and date");

    if(editId){
        let t = tasks.find(x=>x.id===editId);
        t.name = text;
        t.priority = pr;
        t.date = date;
        editId = null;
    } else {
        tasks.push({
            id: Date.now(),
            name: text,
            priority: pr,
            date,
            status:"todo",
            pinned:false
        });
    }

    saveTasks();
    taskInput.value="";
    displayTasks();
}

function displayPinned(){
    let container = document.getElementById("pinnedTasks");
    let section = document.getElementById("pinnedSection");

    container.innerHTML = "";

    let pinned = tasks.filter(t=>t.pinned);

    if(pinned.length===0){
        section.style.display="none";
        return;
    }

    section.style.display="block";

    pinned.forEach(t=>{
        let div=document.createElement("div");
        div.className="task";

        div.innerHTML = `
        <b>${t.name}</b><br>
        Priority: ${t.priority}<br>
        Due: ${t.date}<br>
        <button class="unpinBtn" onclick="togglePin(${t.id})">Unpin</button>
        `;

        container.appendChild(div);
    });
}

function displayTasks(){
    document.querySelectorAll(".taskList").forEach(l=>l.innerHTML="");

    let s=searchInput.value.toLowerCase(),f=filterPriority.value,so=sortDate.value;

    let list=tasks.filter(t=>t.name.toLowerCase().includes(s)&&(f==="All"||t.priority===f));

    list.sort((a,b)=>b.pinned-a.pinned);
    if(so==="asc")list.sort((a,b)=>new Date(a.date)-new Date(b.date));
    if(so==="desc")list.sort((a,b)=>new Date(b.date)-new Date(a.date));

    let done=0;

    list.forEach(t=>{
        let div=document.createElement("div");
        div.className="task";
        div.draggable=true;
        div.id=t.id;
        div.ondragstart=drag;

        let diff=(new Date(t.date)-new Date())/(1000*60*60*24);

        if(diff<0&&t.status!=="done")div.style.border="2px solid red";
        else if(diff<=5&&t.status!=="done")div.style.border="2px solid orange";

        if(t.status==="done")done++;

        div.innerHTML=`<b>${t.name}</b> ${t.pinned?"⭐":""}<br>
        Priority: ${t.priority}<br>
        Due: ${t.date}<br>
        ${t.status==="done"?"✔ Completed<br>":""}
        <button class="pinBtn" onclick="togglePin(${t.id})">Pin</button>
        <button class="editBtn" onclick="editTask(${t.id})">Edit</button>
        <button class="deleteButton" onclick="deleteTask(${t.id})">Delete</button>`;

        div.style.opacity=0;
        setTimeout(()=>div.style.opacity=1,50);

        document.querySelector(`#${t.status} .taskList`).appendChild(div);
    });

    updateStats(done);
    displayPinned();
}

function togglePin(id){
    let t=tasks.find(x=>x.id===id);
    t.pinned=!t.pinned;
    saveTasks();displayTasks();
}

function editTask(id){
    let t = tasks.find(x=>x.id===id);

    taskInput.value = t.name;
    priority.value = t.priority;
    dueDate.value = t.date;

    editId = id;
}

function deleteTask(id){
    tasks=tasks.filter(t=>t.id!==id);
    saveTasks();displayTasks();
}

function allowDrop(e){e.preventDefault();}
function drag(e){e.dataTransfer.setData("text",e.target.id);}

function drop(e){
    e.preventDefault();
    let id=e.dataTransfer.getData("text");
    tasks.find(t=>t.id==id).status=e.currentTarget.id;
    saveTasks();displayTasks();
}

function updateGoals(){
    let d=today();
    waterGoalStatus.innerText=(waterData[d]||0)+"/8";
    stepsGoalStatus.innerText=(stepsData[d]||0)+"/10000";
}

function updateStats(done){
    let total=tasks.length,p=total?done/total*100:0;
    statsText.innerText=`Total: ${total} | Completed: ${done}`;
    progressBar.style.width=p+"%";
    progressBar.innerText=Math.round(p)+"%";
}

function addWater(){
    let d=today();
    waterData[d]=(waterData[d]||0)+1;
    localStorage.setItem(currentUser+"_water",JSON.stringify(waterData));
    updateWater();updateGoals();
}

function removeWater(){
    let d=today();
    if(waterData[d]>0)waterData[d]--;
    localStorage.setItem(currentUser+"_water",JSON.stringify(waterData));
    updateWater();updateGoals();
}

function updateWater(){
    let d=today();
    waterCount.innerText=(waterData[d]||0)+" glasses";
    waterHistory.innerHTML="";
    Object.keys(waterData).slice(-5).reverse().forEach(date=>{
        waterHistory.innerHTML+=`${date}: ${waterData[date]} <button onclick="deleteWater('${date}')">❌</button><br>`;
    });
}

function deleteWater(date){
    delete waterData[date];
    localStorage.setItem(currentUser+"_water",JSON.stringify(waterData));
    updateWater();
}

function addSteps(){
    let d=today(),v=stepsInput.value;
    if(!v)return;
    stepsData[d]=parseInt(v);
    localStorage.setItem(currentUser+"_steps",JSON.stringify(stepsData));
    updateSteps();updateGoals();
}

function updateSteps(){
    let d=today();
    todaySteps.innerText=(stepsData[d]||0)+" steps";
    stepsHistory.innerHTML="";
    Object.keys(stepsData).slice(-5).reverse().forEach(date=>{
        stepsHistory.innerHTML+=`${date}: ${stepsData[date]} <button onclick="deleteSteps('${date}')">❌</button><br>`;
    });
}

function deleteSteps(date){
    delete stepsData[date];
    localStorage.setItem(currentUser+"_steps",JSON.stringify(stepsData));
    updateSteps();
}

function toggleTheme(){
    document.body.classList.toggle("dark");
    localStorage.setItem("theme",document.body.classList.contains("dark")?"dark":"light");
}

function setTheme(theme){
    document.body.classList.remove("theme2","theme3","theme4");
    theme?localStorage.setItem("theme",theme):localStorage.removeItem("theme");
    if(theme)document.body.classList.add(theme);
}

let savedTheme=localStorage.getItem("theme");
if(savedTheme)document.body.classList.add(savedTheme);

if(currentUser){
    showDashboard();
    loadUserData();
}

loginUser.oninput=()=>loginError.innerText="";
loginPass.oninput=()=>loginError.innerText="";

function togglePassword(){
    loginPass.type=loginPass.type==="password"?"text":"password";
}
