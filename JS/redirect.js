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