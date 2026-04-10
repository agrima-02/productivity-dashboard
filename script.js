let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask(){
    let text = document.getElementById("taskInput").value;
    let priority = document.getElementById("priority").value;
    let date = document.getElementById("dueDate").value;
    
    if(text===""){
        alert("Enter a task");
        return;
    }

    let task={
        id:Date.now(),
        name:text,
        priority:priority,
        date:date,
        status:"todo"
    };
    
    tasks.push(task);
    saveTasks();
    displayTasks();
    document.getElementById("taskInput").value="";
}

function displayTasks(){

    document.querySelectorAll(".taskList").forEach(list=>{
        list.innerHTML="";
    });
    
    let search=document.getElementById("searchInput").value.toLowerCase();
    let filter=document.getElementById("filterPriority").value;
    
    tasks.forEach(task=>{
    
        if(task.name.toLowerCase().includes(search)){
        
            if(filter==="All" || task.priority===filter){
            
                let div=document.createElement("div");
                div.className="task";
                div.draggable=true;
                div.id=task.id;
                
                div.ondragstart=drag;
                
                div.innerHTML=
                "<b>"+task.name+"</b><br>"+
                "Priority: "+task.priority+"<br>"+
                "Due: "+task.date+"<br>"+
                "<button class='deleteButton' onclick='deleteTask("+task.id+")'>Delete</button>";
                
                document.querySelector("#"+task.status+" .taskList").appendChild(div);
            
            }
        
        }
    
    });

}

function deleteTask(id){

    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    displayTasks();
}

function allowDrop(ev){
    ev.preventDefault();
}

function drag(ev){
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev){
    ev.preventDefault();
    
    let id=ev.dataTransfer.getData("text");
    
    let column=ev.currentTarget.id;
    
    let task=tasks.find(t=>t.id==id);
    
    task.status=column;
    
    saveTasks();
    displayTasks();
}

document.getElementById("searchInput").addEventListener("input",displayTasks);
document.getElementById("filterPriority").addEventListener("change",displayTasks);

displayTasks();
