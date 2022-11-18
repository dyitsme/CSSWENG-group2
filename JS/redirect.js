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


function folderClick(){
    var folderName = this.getAttribute("id");
    console.log(folderName);
    $.get('/folder', {folder: folderName}, function(result){
        if(result){
            location.href = "/loadfolder";
        }
    });

}