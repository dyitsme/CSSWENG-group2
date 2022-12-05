let selected = undefined;
var btnCount = 0;
var allBtn = 0;

let fileContainer = []

$(document).ready(function () {
    var elements = document.getElementsByClassName('folder_name_div');
    $('#trap').remove();
    for (var i = 0; i < elements.length; i++) {
        elements[i].addEventListener('click', folderClick);
    }
    var elements1 = document.getElementsByClassName('folder_move_div');
    for (var i = 0; i < elements1.length; i++) {
        elements1[i].addEventListener('click', folderClickMove);
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
    const { files } = input;

    for (var i = 0; i < input.files.length; i++) {
        document.getElementById('itemset').innerHTML += '<div id="' + input.files[i].name + '"> <p>' + input.files[i].name + '</p> <img src="pictures/remove.png" alt="" onclick="removeSelectedFileName(' + "'" + input.files[i].name + "'" + ')"> </div>';
    }

    fileContainer.push(files)
    dataTransfer = new DataTransfer();
    for (let i = 0; i < fileContainer.length; i++) {
        const file = fileContainer[i][0]
        dataTransfer.items.add(file)
    }
    input.files = dataTransfer.files
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

function downloadSingle(id) {
    location.href = "/downloadSingleFile?filename=" + id;
}

function downloadMany() {
    let selected = [];
    const checkboxes = document.querySelectorAll('input[class="files_checkbox"]:checked');

    checkboxes.forEach(checkbox => { selected.push(checkbox.value); });

    if (selected.length == 1) { location.href = "/downloadSingleFile?filename=" + selected[0]; }
    else if (selected.length > 1) { location.href = '/downloadMultipleFile?filenames=' + selected.join(',') }
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
function moveMany(){
    let arrSelected = [];
    let arrNotselect = [];
    const checkboxes = document.querySelectorAll('input[class="files_checkbox"]:checked');
    checkboxes.forEach((checkbox)=>{
        arrSelected.push(checkbox.value);
    });
    const allboxes = document.querySelectorAll('input[class="files_checkbox"]');
    allboxes.forEach((allbox)=>{
        arrNotselect.push(allbox.value);
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

function file_folder_search() {
    setTimeout(file_folder_searched(), 100000);
}

function moveSingle(identifier){
    
    document.getElementById("blocker").style.display = "block";
    document.getElementById("move_modal").style.visibility = "visible";
    $.get("/getMove", {arrFilter: identifier}, (result)=>{

    });
    location.href="/filterSelected";
}
function cancelMov(){
    document.getElementById("blocker").style.display = "none";
    document.getElementById("move_modal").style.visibility = "hidden";
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