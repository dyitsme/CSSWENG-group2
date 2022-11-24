let selected = undefined;
var btnCount = 0;
var allBtn = 0;
$(document).ready(function () {
    var elements = document.getElementsByClassName('folder_name_div');
    $('#trap').remove();
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', folderClick);
    }
})

function redirectRegister() {
    location.href = "http://localhost:3000/register";
}

function logoutUser() {
    location.href = "http://localhost:3000/"
}

function changePassword() {
    location.href = "/changepassword"
}

function openForm() {
    document.getElementById("popup").style.display = "block";
}

function closeForm() {
    document.getElementById("popup").style.display = "none";
}
function fileForm(identifier) {
    selected = identifier;
    $.get('/select', { selected: selected }, (result) => {

    })
    document.getElementById("filepop").style.display = "block";
}
function folderForm(identifier) {
    selected = identifier;
    $.get('/select', { selected: selected }, (result) => {

    })
    document.getElementById("folderpop").style.display = "block";
}
function fileClose() {
    document.getElementById("filepop").style.display = "none";
}
function folderClose() {
    document.getElementById("folderpop").style.display = "none";
}

function fileForm(identifier) {
    selected = identifier;
    $.get('/selectfile', { selected: selected }, (result) => { })
    document.getElementById("filepop").style.display = "block";
}

function folderForm(identifier) {
    selected = identifier;
    $.get('/select', { selected: selected }, (result) => { })
    document.getElementById("folderpop").style.display = "block";
}

function fileClose() {
    document.getElementById("filepop").style.display = "none";
}

function folderClose() {
    document.getElementById("folderpop").style.display = "none";
}

function folderClick() {
    var folderName = this.getAttribute("id");
    console.log(folderName);
    $.get('/folder', { folder: folderName }, function (result) {
        if (result) {
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

function renameFolder() {
    newfolder = document.getElementById("newname1").value;
    $.get('/rename-folder', { newname: newfolder, current: selected }, function (result) { })
}

function renameFile() {
    newfile = document.getElementById("newname2").value;
    $.get('/rename-folder', { newname: newfile, current: selected }, function (result) { })
}

function openFileModal() {
    document.getElementById('fileModal').style.visibility = 'visible';
    document.getElementById('fileModal').style.opacity = 1;
}

function closeFileModal() {
    document.getElementById('fileModal').style.opacity = 0;
    document.getElementById('fileModal').style.visibility = 'hidden';
}

function closeNotificationModal(type) {
    if (type == 'success') {
        document.getElementById('successModal').style.opacity = 0;
        document.getElementById('successModal').style.visibility = 'hidden';
    } else if (type == 'error') {
        document.getElementById('errorModal').style.opacity = 0;
        document.getElementById('errorModal').style.visibility = 'hidden';
    } else {
        document.getElementById('uploadingModal').style.opacity = 0;
        document.getElementById('uploadingModal').style.visibility = 'hidden';
    }
}

function getFileNames() {
    input = document.getElementById('uploadFile');

    for (var i = 0; i < input.files.length; i++) {
        document.getElementById('itemset').innerHTML += '<div id="' + input.files[i].name + '"> <p>' + input.files[i].name + '</p> <img src="pictures/remove.png" alt="" onclick="removeSelectedFileName(' + "'" + input.files[i].name + "'" + ')"> </div>';
    }
}

function removeSelectedFileName(filename) {
    dataTransfer = new DataTransfer();
    input = document.getElementById('uploadFile');
    const { files } = input;

    for(let i = 0; i < files.length; i++){
        const file = files[i]
        if (filename !== file.name){
            dataTransfer.items.add(file)
        }
    }

    input.files = dataTransfer.files

    document.getElementById(filename).remove()
}

function openSelectable() {
    document.getElementById('sa_div').style.display = 'flex';

    checkboxes = document.getElementsByClassName('files_checkbox')
    for (i = 0; i < checkboxes.length; i++) {
        checkboxes[i].style.display = "flex"
    }
}

function getSelected(){
    checkboxes = document.getElementsByClassName('files_checkbox')

    selected = []
    for(i = 0; i < checkboxes.length; i++){
        selected.push(checkboxes[i].item.name)
    }

    console.log(selected);
}
function backFolder(){
    location.href ="/back";
}
function toggleSelect(){
    
    if(btnCount % 2 != 0){
        $(".files_checkbox").css('display', 'none');
        $("#sa_div").css('display', 'none');
        document.getElementById("multContext").style.visibility = "hidden";
        btnCount += 1;
    }
    else{
        $(".files_checkbox").css('display', 'inline-block');
        $("#sa_div").css('display', 'flex');
        document.getElementById("multContext").style.visibility = "visible";
        btnCount += 1;
    }
   
}
function toggleSelectAll(){
    if(allBtn % 2 != 0){
        $(".files_checkbox").prop('checked', false);
        allBtn += 1;
    }
    else{
        $(".files_checkbox").prop('checked', true);
        allBtn += 1;
    }
}
// function checkSelectAll(){
//     arrSelected=[];
//     var filesCount = $(".files_checkbox").length;
//     const checkboxes = document.querySelectorAll('input[class="files_checkbox"]:checked');
//     checkboxes.forEach((checkbox)=>{
//         arrSelected.push(checkbox.value);
//     });
//     if(filesCount != arrSelected.length){
//         $("#selectall_checkbox").prop('checked', false);
//     }
// }

function deleteMany(){
    let arrSelected = [];
    const checkboxes = document.querySelectorAll('input[class="files_checkbox"]:checked');
    checkboxes.forEach((checkbox)=>{
        arrSelected.push(checkbox.value);
    });
    if(arrSelected && arrSelected.length){
        $.get("/deleteMany", {arrDelete : arrSelected}, (result)=>{
        });
        location.href="/deleteManyResult";
    }
    
}