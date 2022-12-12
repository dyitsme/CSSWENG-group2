let selected = undefined;
var btnCount = 0;
var allBtn = 0;

let fileContainer = []

$(document).ready(function () {
    var elements = document.getElementsByClassName('folderNameDiv');
    $('#trap').remove();
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', folderClick);
    }

    var elements1 = document.getElementsByClassName('folderMoveDiv');
    for (var i = 0; i < elements1.length; i++) {
        elements1[i].addEventListener('click', folderClickMove);
    }

    var elements1 = document.getElementsByClassName('fileSize');
    for (var i = 0; i < elements1.length; i++) {
        elements1[i].innerHTML = formatSize(elements1[i].innerHTML);
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
    document.getElementById("popUp").style.display = "block";
}

function closeForm() {
    document.getElementById("popUp").style.display = "none";
}

function fileForm(identifier) {
    selected = identifier;
    $.get('/select', { selected: selected }, (result) => {

    })
    document.getElementById("filePop").style.display = "block";
}

function folderForm(identifier) {
    selected = identifier;
    $.get('/select', { selected: selected }, (result) => {

    })
    document.getElementById("folderPop").style.display = "block";
}

function fileClose() {
    document.getElementById("filePop").style.display = "none";
}

function folderClose() {
    document.getElementById("folderPop").style.display = "none";
}

function fileForm(identifier) {
    selected = identifier;
    $.get('/selectfile', { selected: selected }, (result) => { })
    document.getElementById("filePop").style.display = "block";
}

function folderForm(identifier) {
    selected = identifier;
    $.get('/select', { selected: selected }, (result) => { })
    document.getElementById("folderPop").style.display = "block";
}

function fileClose() {
    document.getElementById("filePop").style.display = "none";
}

function folderClose() {
    document.getElementById("folderPop").style.display = "none";
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

var opened ='';

function contextMenu(event, identifier) {
    if((opened != identifier) && (opened != "")){
        document.getElementById(opened).style.visibility = "hidden";
        document.getElementById(identifier).style.visibility = "visible";
        opened = identifier;
        document.getElementById(identifier).style.top = event.clientY;
        document.getElementById(identifier).style.left = event.clientX;
        console.log(event.clientY)
        console.log(event.clientX)
    }
    else{
        document.getElementById(identifier).style.visibility = "visible";
        opened = identifier;
        document.getElementById(identifier).style.top = event.clientY;
        document.getElementById(identifier).style.left = event.clientX;
        console.log(event.clientY)
        console.log(event.clientX)
    }
}

window.addEventListener('click', (e) => {
    if(opened != ""){
        document.getElementById(opened).style.visibility = "hidden";
    }
})

function deleteFolder(identifier) {
    location.href = "/delete-folder?name=" + identifier;
}

function deleteFile(identifier) {
    location.href = "/delete-file?name=" + identifier;
}

function renameFolder() {
    newFolder = document.getElementById("newName1").value;
    $.get('/rename-folder', { newName: newFolder, current: selected }, function (result) { })
}

function renameFile() {
    newFile = document.getElementById("newName2").value;
    $.get('/rename-folder', { newName: newFile, current: selected }, function (result) { })
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

function getFilenames() {
    dataTransfer = new DataTransfer();
    input = document.getElementById('uploadFile');
    const { files } = input;

    for (var i = 0; i < files.length; i++) {
        fileContainer.push(files[i])
        document.getElementById('itemSet').innerHTML += '<div id="' + files[i].name + '"> <p>' + files[i].name + '</p> <img src="pictures/remove.png" alt="" onclick="removeSelectedFilename(' + "'" + files[i].name + "'" + ')"> </div>';
    }

    for (i = 0; i < fileContainer.length; i++) {
        dataTransfer.items.add(fileContainer[i])
    }

    input.files = dataTransfer.files
}

function removeSelectedFilename(filename) {
    dataTransfer = new DataTransfer();
    input = document.getElementById('uploadFile');

    let newArray = []
    for (i = 0; i < fileContainer.length; i++) {
        if (fileContainer[i].name != filename) {
            newArray.push(fileContainer[i])
            dataTransfer.items.add(fileContainer[i])
        }
    }

    fileContainer = newArray
    input.files = dataTransfer.files
    document.getElementById(filename).remove()
}

function openSelectable() {
    document.getElementById('saDiv').style.display = 'flex';

    let checkboxes = document.getElementsByClassName('filesCheckbox');
   
    for (i = 0; i < checkboxes.length; i++) {
        checkboxes[i].style.display = "flex";
    }
    checkboxes = document.getElementsByClassName('foldersCheckbox');
    for (i = 0; i < checkboxes.length; i++) {
        checkboxes[i].style.display = "flex";
    }
}

function downloadSingle(id) {
    location.href = "/downloadSingleFile?filename=" + id;
}

async function downloadMany() {
    let selected = [];
    let selected1 = [];
    const checkboxes = document.querySelectorAll('input[class="filesCheckbox"]:checked');
    const foldersCheck = document.querySelectorAll('input[class="foldersCheckbox"]:checked');
    checkboxes.forEach(checkbox => { selected.push(checkbox.value); });
    foldersCheck.forEach(folderBox => { selected1.push(folderBox.value); });
    console.log(selected1);
    if(selected1.length && selected1){
        alert("Folders cannot be downloaded");
    }
    else if (selected.length == 1) {
        location.href = "/downloadSingleFile?filename=" + selected[0]; 
    }
    else if (selected.length > 1) { 
        location.href = '/downloadMultipleFile?filenames=' + selected.join(',') 
    }
}

function backFolder(){
    location.href ="/back";
}

function toggleSelect(){   
    if(btnCount % 2 != 0){
        $(".filesCheckbox").css('display', 'none');
        $(".foldersCheckbox").css('display', 'none');
        $("#saDiv").css('display', 'none');
        document.getElementById("multContext").style.visibility = "hidden";
        btnCount += 1;
    }
    else{
        $(".filesCheckbox").css('display', 'inline-block');
        $(".foldersCheckbox").css('display', 'inline-block');
        $("#saDiv").css('display', 'flex');
        document.getElementById("multContext").style.visibility = "visible";
        btnCount += 1;
    }
}

function toggleSelectAll(){
    if(allBtn % 2 != 0){
        $(".filesCheckbox").prop('checked', false);
         $(".foldersCheckbox").prop('checked', false);
        allBtn += 1;
    }
    else{
        $(".filesCheckbox").prop('checked', true);
         $(".foldersCheckbox").prop('checked', true);
        allBtn += 1;
    }
}

function deleteMany(){
    let arrSelected = [];
    let checkboxes = document.querySelectorAll('input[class="filesCheckbox"]:checked');
    let folderBoxes = document.querySelectorAll('input[class="foldersCheckbox"]:checked');
    checkboxes.forEach((checkbox)=>{
        arrSelected.push(checkbox.value);
    });
    folderBoxes.forEach((checkbox)=>{
        arrSelected.push(checkbox.value);
    });
    console.log(arrSelected);
    if(arrSelected && arrSelected.length){
        $.get("/deleteMany", {arrDelete : arrSelected}, (result)=>{
        });
        location.href="/deleteManyResult";
    }
}

function moveMany(){
    let arrSelected = [];
    let arrNotselect = [];
    let checkboxes = document.querySelectorAll('input[class="filesCheckbox"]:checked');
    checkboxes.forEach((checkbox)=>{
        arrSelected.push(checkbox.value);
    });

    checkboxes = document.querySelectorAll('input[class="foldersCheckbox"]:checked');
    checkboxes.forEach((checkbox)=>{
        arrSelected.push(checkbox.value);
    });

    let allBoxes = document.querySelectorAll('input[class="filesCheckbox"]');
    
    allBoxes.forEach((allBox)=>{
        arrNotselect.push(allBox.value);
    });

    allBoxes = document.querySelectorAll('input[class="foldersCheckbox"]');

    allBoxes.forEach((allBox)=>{
        arrNotselect.push(allBox.value);
    });
    for(var j = 0; j < arrSelected.length; j++){
        for (var i = arrNotselect.length - 1; i >= 0; i--) {
            if (arrNotselect[i] === arrSelected[j]) {
                arrNotselect.splice(i, 1);
            }
        }
    }
    if(arrSelected.length>0){
        $.get("/getMultMove", {arrFilter: arrSelected, arrNotFilter: arrNotselect}, (result)=>{

        });
        location.href="/filterMany";
    } 
}

function fileFolderSearch() {
    setTimeout(file_folder_searched(), 100000);
}

function moveSingle(identifier){
    document.getElementById("blocker").style.display = "flex";
    document.getElementById("moveModal").style.visibility = "visible";
    $.get("/getMove", {arrFilter: identifier}, (result)=>{

    });
    location.href="/filterSelected";
}

function cancelMov(){
    document.getElementById("blocker").style.display = "none";
    document.getElementById("moveModal").style.visibility = "hidden";
}

function folderClickMove(){
    var folderName = this.getAttribute("id");
    var length = folderName.length;
    folderName = folderName.slice(0, folderName.length - 4);
    console.log(folderName);
 
        $.get('/movfolder', { folder: folderName }, function (result) {
            if (result) {
                location.href = "/movloadfolder";
            }
        });   
}

function moveHere(){
    location.href="/moveAction";  
}

function formatSize(bytes, decimals = 2) {
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function disableSpecialChar(e) {
      if(!((e.keyCode >= 65) && (e.keyCode <= 90) || (e.keyCode >= 97) && (e.keyCode <= 122) || (e.keyCode >= 48) && (e.keyCode <= 57))){
         e.returnValue = false;
         return;
      }
      e.returnValue = true;
}
