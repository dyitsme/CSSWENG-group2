let selected = undefined;
$(document).ready(function(){
    var elements = document.getElementsByClassName('folder');
    for (var i = 0; i < elements.length; i++){
        elements[i].addEventListener('click', folderClick);
    }
})

function redirectRegister(){
    location.href= "http://localhost:3000/register";
}
function logoutUser(){
    location.href="http://localhost:3000/"
}
function changePassword(){
    location.href="/changepassword"
}
function openForm(){
    document.getElementById("popup").style.display = "block";
}
function closeForm(){
    document.getElementById("popup").style.display = "none";
}
function fileForm(identifier){
    selected = identifier;
    $.get('/select',{selected:selected}, (result)=>{
     
    })
    document.getElementById("filepop").style.display = "block";
}
function folderForm(identifier){
    selected = identifier;
    $.get('/select',{selected:selected}, (result)=>{
       
    })
    document.getElementById("folderpop").style.display = "block";
}
function fileClose(){
    document.getElementById("filepop").style.display = "none";
}
function folderClose(){
    document.getElementById("folderpop").style.display = "none";
}

function folderClick(){
    var folderName = this.getAttribute("id");
    console.log(folderName);
    $.get('/folder', {folder: folderName}, function(result){
        if(result){
            location.href = "/loadfolder";
        }
    });
}

function contextMenu(identifier) {
    if ((document.getElementById(identifier).style.visibility === "visible")) {
        document.getElementById(identifier).style.visibility = "hidden";
    } else {
        document.getElementById(identifier).style.visibility = "visible";
    }
}

function deleteFolder(identifier) {
    location.href = "/delete-folder?name=" + identifier;
}

function deleteFile(identifier) {
    location.href = "/delete-file?name=" + identifier;
}

function renameFolder(){
    newfolder = document.getElementById("newname1").value;
    $.get('/rename-folder', {newname:newfolder, current:selected}, function(result){
        
    })
}
function renameFile(){
    newfile = document.getElementById("newname2").value;
    $.get('/rename-folder', {newname:newfile, current:selected}, function(result){
        
    })
}