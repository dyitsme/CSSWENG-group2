const express = require('express');
const zip = require('express-zip')
const app = express();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require("hbs");
const fs = require("fs")
const fileUpload = require('express-fileupload')
const Account = require('./database/models/Account');
const session = require('express-session');
const Files = require('./database/models/Files');
const Folders = require('./database/models/Folders');
fol = "";
folMove= "";
folID = "",
folIDMove = "",
directory = "";
selected="";
nameSelected="",
IDSelected="";
directory1 = "";
IDMultMove=[];
allID=[];
triggerSearch = false;
app.use(session({
    secret: 'secretcode',
    resave: false,
    saveUninitialized: false
}))

app.set('view-engine', 'hbs');
app.set('views', './HTML/views')
app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use(express.static(__dirname));
app.use(fileUpload());
mongoose.connect('mongodb://0.0.0.0/IlaganDB',{useNewURLParser: true, useUnifiedTopology: true});

hbs.registerHelper('eq', (a, b) => a == b)

app.get('/', async(req, res)=>{
    req.session.user = null;
    req.session.name = null;
    //set the credentials of the admin
    adminUser = "admin1";
    adminPass = "abc1234";
    Account.findOne({username: adminUser}, async(err, result)=>{
        if(result){

        }
        else{
            try{
                const hashed = await bcrypt.hash(adminPass, 10);
                Account.create({
                    username: adminUser,
                    pass : hashed,
                    role : "Administrator"
                },(err, account)=>{
        
                })
            }
            catch(exception){
                console.log(exception)
            }
        }
    })
   
    res.render('login.hbs');

})

app.get('/back', (req, res)=>{
    arrDirect = directory.split('/');
    arrDirect.pop();
    directory = arrDirect.join('/');
   console.log(directory);
    Account.findOne({username:req.session.name}, (err, user)=>{
        Folders.findOne({_id: folID }, (err, result)=>{
            if(result){
                console.log(result)
                folID = result.parent;
                if(result.parent != "" && result.parent != undefined){
                    parentFol = result.parent
                    Folders.findOne({_id:parentFol}, async(err, backFolder)=>{
                        if(backFolder){
                            fol = backFolder.name;
                            const folders = await Folders.find({parent:backFolder._id});
                            const files = await Files.find({parent:backFolder._id});
                            if(user.role == "Administrator"){
                                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()"  });
                            }
                            else if(user.role == "Manager"){
                                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()"   })
                            }
                            else{
                                res.render('userHome.hbs', {folders: folders,files: files, path:directory, func:"backFolder()"   });
                            }
                        }
                    })
                }
                else{
                    console.log("userole:"+user.role)
                    if(user.role == "Administrator" || user.role == "Manager"){
                        res.redirect('/admanagerhome');
                    }
                    else{
                        res.redirect('/userhome');
                    }
                }
            }
        })
    })
        
   
})

app.get('/profile', (req,res)=>{
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user){
            if(user.role == "Administrator"){
                res.render('profile.hbs',{link:"/admanagerhome",profileName: req.session.name, role:user.role, C:"regisButton",act:"redirectRegister()", content:"Register an Account"});
            }
            else if(user.role == "Manager"){
               
                    res.render('profile.hbs',{link: "/admanagerhome",profileName: req.session.name, role:user.role, design:"background:transparent; border: none !important;" })
                }
            
            else{
                res.render('profile.hbs',{link:"/userhome",profileName: req.session.name, role:user.role, design:"background:transparent; border: none !important;"});
            }
        }
        else{
            res.redirect('/')
        }
        
    })
})

app.get('/admanagerhome', async(req, res)=>{
    fol="";
    directory="";
    
    Account.findOne({username: req.session.name}, async(err, user)=>{
        const files  = await Files.find({parent:""});
        const folders = await Folders.find({parent:""});
        if(user){
            if(user.role == "Administrator"){
                res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;" });
            }
            else if(user.role == "Manager"){
                
                res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files,styling:"background:transparent; border: none !important;" })
            }
        }
        else{
            res.redirect("/");
        }
    })
})

app.get('/folder', (req,res)=>{
        fol = req.query.folder;
        Folders.findOne({name:req.query.folder}, (err, ans)=>{
            if(ans){
                folID = ans._id;
            }
        })
      
        result = {garbage:"garbage"};
        res.send(result);   
})

app.get('/movfolder', (req,res)=>{
    folMove = req.query.folder;
    Folders.findOne({name:req.query.folder}, (err, ans)=>{
        if(ans){
            folIDMove = ans._id;
        }
    })
  
    result = {garbage:"garbage"};
    res.send(result);

})

app.get('/movloadfolder', async(req, res)=>{
    if(directory1 =="" || directory1 == null){
        directory1 = "/"+folMove;
    }
    else{
        console.log("ADD")
        directory1 = directory1 + "/" + folMove;
    }
   
    arrDirect1 = directory1.split('/');
        console.log("directory:" + directory1);
        console.log("fol:" + folMove);
        
        Account.findOne({username:req.session.name}, async(err, user)=>{
            if(user.role == "Administrator"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID});
                let folders1;
                if(IDSelected != ""){
                    console.log(IDSelected);
                     folders1 = await Folders.find({parent: folIDMove,_id:{$ne:IDSelected}})
                }
                else{
                    if(fol === folMove){
                       console.log("SPECIAL");
                       
                         folders1 = await Folders.find({_id:{$in:allID}});
                    }
                    else{
                         folders1 = await Folders.find({parent:folIDMove});
                    }

                }
            
                console.log("ADMIN");
                if(directory == ""){
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", styling:"background:transparent; border: none !important;",movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex"  });
                }
                else{
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome",ID: "/register", Content:"Register a User", func:"backFolder()" ,movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex"   });
                }
                
            }
            else if(user.role == "Manager"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID});
                let folders1;
                if(IDSelected != ""){
                    console.log(IDSelected);
                     folders1 = await Folders.find({parent: folIDMove,_id:{$ne:IDSelected}})
                }
                else{
                    if(fol === folMove){
                       console.log("SPECIAL");
                       
                         folders1 = await Folders.find({_id:{$in:allID}});
                    }
                    else{
                         folders1 = await Folders.find({parent:folIDMove});
                    }

                }
                console.log("Manager");
                if(directory == ""){
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", styling:"background:transparent; border: none !important;",movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex"  });
                }
                else{
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()" ,movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex"  });
                }            
            }         
        })
})

app.get('/loadfolder', async(req, res)=>{
    if(triggerSearch == true){
        directory = "";
        let nextParent = [];
        let parentList = [];
        //compute breadcrumb
        Folders.findOne({name:fol}, async(err, clickedFol)=>{
            if(clickedFol){            
                
                if(clickedFol.parent != ""){
                    nextParent = clickedFol.parent;
                   console.log(nextParent);
                    while(nextParent != ""){
                        await new Promise(resolve => setTimeout(resolve, 50));
                        Folders.findOne({_id: nextParent}, (err, firstFol)=>{
                            if(firstFol){
                                nextParent = firstFol.parent;
                                parentList.push(firstFol.name);
                            }
                            else{
                                nextParent = "";
                            }
                        })
                    }
                    console.log(parentList);
        
                    for(let g = 0; g < parentList.length; g++){
                        directory = "/" + parentList[g] + directory;
                    }
                    directory = directory + "/"+fol;
                    console.log(directory);
                }
                else{
                    directory = "/"+fol;
                }
            }
        })
        await new Promise(resolve => setTimeout(resolve, 1000));
        triggerSearch = false;
    }
    else if(directory =="" || directory == null){
        directory = "/"+fol;
    }
    else{
        directory = "";
        let nextParent = [];
        let parentList = [];
        //compute breadcrumb
        Folders.findOne({name:fol}, async(err, clickedFol)=>{
            if(clickedFol){
                     
                if(clickedFol.parent != ""){
                    nextParent = clickedFol.parent;
                   
                    while(nextParent != ""){
                        await new Promise(resolve => setTimeout(resolve, 50));
                        Folders.findOne({_id: nextParent}, (err, firstFol)=>{
                            if(firstFol){
                                nextParent = firstFol.parent;
                               
                                parentList.push(firstFol.name);
                            }
                            else{
                                nextParent = "";
                            }
                        })
                    }
        
                    for(let g = 0; g < parentList.length; g++){
                        directory = "/" + parentList[g] + directory;
                    }
                    directory = directory + "/"+fol;
                    console.log(directory);
                }
                else{
                    directory = "/"+fol;
                }
            }     
        })
        await new Promise(resolve => setTimeout(resolve, 1000));
        triggerSearch = false;    
    }
   
    arrDirect = directory.split('/');
        console.log("directory:" + directory);
        console.log("fol:" + fol);
        
        Account.findOne({username:req.session.name}, async(err, user)=>{
            if(user.role == "Administrator"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID})
                console.log("ADMIN");
                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome",ID: "/register", Content:"Register a User", func:"backFolder()"   });
            }
            else if(user.role == "Manager"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID})
                console.log("Manager");
                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()"   });
            }
            else{
                const folders = await Folders.find({parent: folID, access:"Unrestricted"});
                const files = await Files.find({parent: folID, access:"Unrestricted"})
                res.render('userHome.hbs', {folders: folders,files: files, path:directory, func:"backFolder()" ,link: "/userhome",design:"trap"  })
            }
            
        })
    
})

app.get('/userhome', async(req, res)=>{
    fol="";
    directory="";
    folID = "";
    Account.findOne({username:req.session.name}, async(err, user)=>{
        if(user){
            if(user.role == "Employee"){
                const files  = await Files.find({access:"Unrestricted",parent:""});
                const folders = await Folders.find({access:"Unrestricted", parent:""});
                res.render('userHome.hbs', {folders,files,styling:"background:transparent; border: none !important;"});
            }
            else{
                res.redirect('/');
            }          
        }
        else{
            res.redirect('/')
        }
    })
    
})

app.get('/register', (req, res)=>{
    Account.findOne({username:req.session.name}, (err, user)=>{
        if(user){
            if(user.role == "Administrator")
                res.render('register.hbs');
            else if(user.role == "Manager")
                res.redirect('/admanagerhome');
            else{
                res.redirect('/userhome');
            }
        }
        else{
            res.redirect("/");
        }
    })
    
})

app.get('/changepassword', (req, res) => {
   
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user){
            
            if(user.role == "Administrator"){
                res.render('changePassword.hbs',{link: "/admanagerhome", ID: "/register", Content:"Register a User"})
            }
            else if(user.role == "Manager"){
                res.render('changePassword.hbs',{link: "/admanagerhome", design:"trap" })
            }
            else{
                res.render('changePassword.hbs',{link: "/userhome", design:"trap"})
            }
        }
        else{
            res.redirect('/');
        }
    })
})

app.post('/login-post', (req,res)=>{
    Account.findOne({username : req.body.username}, (err, user)=>{
        if(err){
            console.log(err)
        }
        else{
            if(user){
                console.log('USER FOUND');
                bcrypt.compare(req.body.password, user.pass, (err, result)=>{
                    if(result){
                        req.session.user = user._id;
                        req.session.name = user.username;
                    
                        console.log("Hello, " +req.body.username);
                       
                        if(user.role == "Administrator"){
                            res.redirect("/admanagerhome")
                        }
                        else if(user.role == "Manager"){
                            res.redirect("/admanagerhome")
                        }
                        else{
                            res.redirect("/userhome")
                        }
                        
                    }
                    else{
                        res.render("login.hbs",{
                            errorMsg: "Invalid Credentials",
                        })
                    }
                })
            }
            else{
                res.render("login.hbs",{
                    errorMsg: "Invalid Credentials",
                })
            }
        }
    })
        
});
app.post('/register-post', async(req, res)=>{
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
       
        //check if username exists
        Account.findOne({username : req.body.username},(err,result)=>{
            if(!result){
                if ((req.body.username).length > 30){
                    res.render('register.hbs',{error:"Username should not be greater than 30 chars"});
                }
                else{
                    // put create here
                    Account.create({
                        username: req.body.username,
                        pass: hashedPassword,
                        role: req.body.roles,
                    },
                        (error, account)=>{

                    })
                    res.redirect('/admanagerhome')
                }
            }
            else{
                res.render('register.hbs',{
                    error: "Username already exists",
                })
            }
        })
    }
    catch{
        res.redirect('/admanagerhome');
    }
  
});
app.post('/change-password-post', async (req, res) => {
    if (req.body.confirmPassword != req.body.newPassword) { 
        return res.render('changePassword.hbs', { error: "Password Change Error!" }) 
    }
    
    try {
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 10)

        Account.findOne({ username: req.session.name }, (err, user) => {
            if (user) {
                bcrypt.compare(req.body.oldPassword, user.pass, (err, success) => {
                    if (success) {
                        Account.updateOne({ username: user.username }, { pass: hashedPassword }, (err, result) => {
                            if (result) {
                                if(user.role == "Administrator" || user.role == "Manager"){
                                    res.redirect('/admanagerhome')
                                }
        
                                else{
                                    res.redirect('/userhome') 
                                }
                                
                                }
                            else {
                                if(user.role == "Administrator"){
                                    res.render('changePassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "/register", Content:"Register a User" }) 
                                }
                                else if(user.role == "Manager"){
                                    res.render('changePassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"trap" }) 
                                }
                                else{
                                    res.render('changePassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"trap" }) 
                                }
                            }
                        })
                    }
                    else {  

                        if(user.role == "Administrator"){
                        res.render('changePassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "/register", Content:"Register a User" }) 
                        }
                        else if(user.role == "Manager"){
                            res.render('changePassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"trap" }) 
                        }
                        else{
                            res.render('changePassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"trap" }) 
                            } 
                        }
                })
            }
            else { 
                if(user.role == "Administrator"){
                res.render('changePassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "/register", Content:"Register a User"}) 
                }
                else if(user.role == "Manager"){
                    res.render('changePassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"trap" }) 
                }
                else{
                    res.render('changePassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"trap" }) 
                }
            }
        })
    } catch { res.redirect('/userhome') }
});

app.post('/createfolder', async(req, res) =>{
   
    if (directory == "" && fol == ""){
        const folders  = await Folders.find({parent:""});
        const files = await Files.find({parent:""});
        Folders.findOne({name:req.body.folderName}, (err,result)=>{
            if(!result){
                today = new Date();
                dd = String(today.getDate()).padStart(2, '0');
                mm = String(today.getMonth() + 1).padStart(2, '0');
                yyyy = today.getFullYear();
                now = mm + '/' + dd + '/' + yyyy;
                
                Folders.create({
                    name: req.body.folderName,
                    access: req.body.accessLevel,
                    parent: "",
                    date: now,
                    uploader: req.session.name,
                });
                Account.findOne({ username: req.session.name }, (err, user) => {
                    if(user.role == 'Administrator' || user.role == "Manager"){
                        console.log('worked');
                        res.redirect('/admanagerhome');
                    }
                    else{
                        res.redirect('/userhome');
                    }
                });
            }
            else{
                Account.findOne({ username: req.session.name }, (err, user) => {
                    if(user.role == 'Administrator'){
                        
                    
                        res.render('adManagerHome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;" });
                    }
                    else if(user.role == 'Manager'){
                        res.render('adManagerHome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",styling:"background:transparent; border: none !important;"})
                    } 
                });
            }
        })
    }
    else{ 
        arrDirect = directory.split("/");
        console.log(fol);
        console.log("INSIDE");
        Folders.findOne({name: req.body.folderName}, (err, result)=>{
            if(!result){
                console.log("inner");
                today = new Date();
                dd = String(today.getDate()).padStart(2, '0');
                mm = String(today.getMonth() + 1).padStart(2, '0');
                yyyy = today.getFullYear();
                now = mm + '/' + dd + '/' + yyyy;
                Folders.create({
                    name: req.body.folderName,
                    access : req.body.accessLevel,
                    parent: folID,
                    date: now,
                    uploader: req.session.name,
                    
                })
                Account.findOne({ username: req.session.name }, async(err, user) => {
                    const folders  = await Folders.find({parent: folID});
                    const files = await Files.find({parent: folID});
                    if(user.role == 'Administrator'){
                        res.render('adManagerHome.hbs',{folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()"   });
                    }
                    else{
                        res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()"   });
                    }                                    
                });
            }
        
            else{              
                Account.findOne({ username: req.session.name }, async(err, user) => {
                    const folders  = await Folders.find({parent: folID});
                    const files = await Files.find({parent: folID});
                    if(user.role == 'Administrator'){
                        res.render('adManagerHome.hbs',{error:"Folder name already exists", folders: folders, files: files, func:"backFolder()" , ID: "/register", Content:"Register a User" });
                    }
                    else{
                        res.render('adManagerHome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()"   });
                    }          
                });
            }                   
        })    
    }
});

app.post('/uploadfile', async (req, res) => {
    selectedAccess = null

    if (req.body.exclusiveAccess) {
        selectedAccess = "Restricted"
    } else {
        selectedAccess = "Unrestricted"
    }

    if (!req.files) {
        return
    }

    const files = req.files.uploadFile
    arrDirect = directory.split("/");

    today = new Date();
    dd = String(today.getDate()).padStart(2, '0');
    mm = String(today.getMonth() + 1).padStart(2, '0');
    yyyy = today.getFullYear();
    now = mm + '/' + dd + '/' + yyyy;

    if (Array.isArray(files)) {
        Account.findOne({ username: req.session.name }, async (err, user) => {
            for (const file of files) {
                duplicateContainer = await Files.find({ name: { $regex: file.name } })
                duplicateCount = 0

                while (duplicateCount < duplicateContainer.length) {
                    if (duplicateContainer[duplicateCount].name == String("(" + duplicateCount + ") " + file.name) || duplicateContainer[duplicateCount].name == String(file.name)) {

                        duplicateContainer.sort((a, b) => {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            return 0;
                        });

                        last = duplicateContainer.pop();
                        duplicateContainer.unshift(last)

                        duplicateCount += 1
                    } 
                    else { 
                        continue 
                    }
                }

                if (duplicateCount == 0) {
                    file.mv(path.resolve(__dirname, 'uploaded', file.name), async (error) => { });
                    if (directory == "") { 
                        Files.create({ name: file.name, access: selectedAccess, parent: "", date: now, size: file.size, uploader: req.session.name }, (error, post) => { }) 
                    }
                    else { Files.create({ 
                        name: file.name, access: selectedAccess, parent: folID, date: now, size: file.size, uploader: req.session.name }, (error, post) => { }) 
                    }
                } 
                else {
                    file.mv(path.resolve(__dirname, 'uploaded', "(" + duplicateCount + ") " + file.name), async (error) => { });
                    if (directory == "") {
                         Files.create({ name: "(" + duplicateCount + ") " + file.name, access: selectedAccess, parent: "", date: now, size: file.size, uploader: req.session.name }, (error, post) => { }) 
                    }
                    else { 
                        Files.create({ name: "(" + duplicateCount + ") " + file.name, access: selectedAccess, parent: folID, date: now, size: file.size, uploader: req.session.name }, (error, post) => { }) 
                    }
                }
            }
        })
    } else {
        Account.findOne({ username: req.session.name }, async (err, user) => {
            duplicateContainer = await Files.find({ name: { $regex: files.name } })
            duplicateCount = 0

            while (duplicateCount < duplicateContainer.length) {
                if (duplicateContainer[duplicateCount].name == String("(" + duplicateCount + ") " + files.name) || duplicateContainer[duplicateCount].name == String(files.name)) {

                    duplicateContainer.sort((a, b) => {
                        if (a.name < b.name)
                            return -1;
                        if (a.name > b.name) 
                            return 1;

                        return 0;
                    });

                    last = duplicateContainer.pop();
                    duplicateContainer.unshift(last)

                    duplicateCount += 1
                } 
                else { 
                    break 
                }
            }

            if (duplicateCount == 0) {
                files.mv(path.resolve(__dirname, 'uploaded', files.name), async (error) => {
                    if (directory == "") {
                         Files.create({ name: files.name, access: selectedAccess, parent: "", date: now, size: files.size, uploader: req.session.name }, (error, post) => { }) 
                        }
                    else {
                         Files.create({ name: files.name, access: selectedAccess, parent: folID, date: now, size: files.size, uploader: req.session.name }, (error, post) => { }) 
                        }
                });
            } 
            else {
                files.mv(path.resolve(__dirname, 'uploaded', "(" + duplicateCount + ") " + files.name), async (error) => {
                    if (directory == "") {
                         Files.create({ name: "(" + duplicateCount + ") " + files.name, access: selectedAccess, parent: "", date: now, size: files.size, uploader: req.session.name }, (error, post) => { }) 
                        }
                    else {
                         Files.create({ name: "(" + duplicateCount + ") " + files.name, access: selectedAccess, parent: folID, date: now, size: files.size, uploader: req.session.name }, (error, post) => { }) 
                        }
                });
            }
        })
    }
    res.redirect('/uploadresult');
});

app.get('/delete-folder', (req, res) => {
    let listOfNames = [];
    Account.findOne({ username: req.session.name }, async(err, user) => {
        Folders.findOne({name: req.query.name}, async(err, mainFol)=>{
                
            if(mainFol){
                let holder = await Folders.find({parent:mainFol._id});
                let fHolder = await Files.find({parent:mainFol._id})
                             
                for(let val = 0; val < holder.length; val++){
                    listOfNames.push(holder[val]);
                }
                for(let val = 0; val < fHolder.length; val++){
                    listOfNames.push(fHolder[val]);
                }
                for (let index = 0; index < holder.length; index++){
                    let temp = await Folders.find({parent:holder[index]._id});
                    let temp1 = await Files.find({parent:holder[index]._id});
                    if (temp.length != 0){
                        for(let val = 0; val < temp.length; val++){
                            holder.push(temp[val]);
                        }
                        for(let val = 0; val < temp.length; val++){
                            listOfNames.push(temp[val]);
                        }
                    }
                    if(temp1.length != 0){
                        for(let val = 0; val < temp1.length; val++){
                            listOfNames.push(temp1[val]);
                        }                   
                    }
                }
                listOfNames.push(mainFol);
              
                for(let d = 0; d < listOfNames.length; d++){
                  
                    Folders.deleteOne({ _id: listOfNames[d]._id }, (error, ans1) => {
                        if(ans1){
                            console.log(ans1);
                        }
                    })
                    Files.findOne({ _id: listOfNames[d]._id }, (error, result) => {
                        if (result) {
                            fs.unlink(path.join(__dirname, 'uploaded', result.name), (error, result) => { });
                            Files.deleteOne({ _id: listOfNames[d]._id }, (err, ans1) => {
                                if (ans1) {
                                    console.log(ans1);
                                }
                            })
                        }
                    })
                }
            }
        })
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        if(directory == ""){
            if (user.role == 'Administrator' || user.role == "Manager") { 
                res.redirect('/admanagerhome'); 
            }
            else { 
                res.redirect('/userhome'); 
            }     
        }
        else{
            const folders = await Folders.find({parent:folID});
            const files = await Files.find({parent:folID});
            if(user.role == 'Administrator'){
                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()" })
            }
            else{
                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()" })
            }    
        }
    });
});

app.get('/delete-file', (req, res) => {
    Account.findOne({ username: req.session.name }, (err, user) => {
        if(directory == ""){
            Files.deleteOne({ name: req.query.name }, (error) => {
                fs.unlink(path.join(__dirname, 'uploaded', req.query.name), (error, result)=>{});
                if (user.role == 'Administrator' || user.role == "Manager") { 
                    res.redirect('/admanagerhome'); 
                }
                else { 
                    res.redirect('/userhome'); 
                }
            })
        }
        else{
            Files.deleteOne({name: req.query.name, parent:folID}, async(err)=>{
                const folders = await Folders.find({parent:folID});
                const files = await Files.find({parent:folID});
                fs.unlink(path.join(__dirname, 'uploaded', req.query.name), (error, result)=>{});
                if(user.role == 'Administrator'){
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()" })
                }
                else{
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()" })
                }
            })
        }
       
    });
});

app.get('/select', (req, res)=>{
    Folders.findOne({name:req.query.selected}, (err, ans)=>{
        if(ans){
            selected = ans._id;
            nameSelected = ans.name;
        }
    })
    console.log(selected);
})

app.get('/selectfile', (req, res)=>{
    Files.findOne({name: req.query.selected}, (err, ans)=>{
        if(ans){
            selected = ans._id;
            nameSelected = ans.name;
        }
    })
})

app.post('/rename-folder', (req, res)=>{
   
    Account.findOne({ userName: req.session.name }, (err, user) => {
        if (directory == ""){
            Folders.findOne({_id:selected}, (err, folder1)=>{
                if(folder1){
                    Folders.findOne({name:req.body.newName1}, async(err, folder2)=>{
                        if(!folder2){
                            folder1.name =req.body.newName1;
                            folder1.save((err, updated)=>{})
                            if (user.role == 'Administrator' || user.role == "Manager") { 
                              res.redirect('/admanagerhome'); 
                            }
                            else { 
                              res.redirect('/userhome'); 
                            }
                        }
                        else{
                            const folders = await Folders.find({parent:""});
                            const files= await Files.find({parent:""});
                            if(user.role == 'Administrator'){
                                res.render('adManagerHome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;" });
                            }
                            else if(user.role == 'Manager'){
                                res.render('adManagerHome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",styling:"background:transparent; border: none !important;"})
                            }
                        }
                    })
                }
            })
        }
        else{
            Folders.findOne({_id:selected, parent:folID}, (err, folder1)=>{
                if(folder1){
                    console.log("INNERLOOP")
                    Folders.findOne({name:req.body.newName1}, async(err, folder2)=>{
                        if(!folder2){
                            
                            folder1.name =req.body.newName1;
                            folder1.save((err, updated)=>{})
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if(user.role == 'Administrator'){
                                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()"  })
                            }
                            else{
                                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()"  })
                            }
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if(user.role == 'Administrator'){
                        
                    
                                res.render('adManagerHome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()"  });
                            }
                            else if(user.role == 'Manager'){
                                res.render('adManagerHome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",func:"backFolder()" })
                            }
                        }
                    })
                }
            })
        }
       
    })
})

app.post('/rename-file', (req, res)=>{
    Account.findOne({ username: req.session.name }, (err, user) => {
        if(directory == ""){
          
            Files.findOne({_id:selected}, (err, file1)=>{
                
                if(file1){
                    let fsOld;
                    let arrName;
                    let fsNew;
                    fsOld = file1.name;
                    arrName= fsOld.split('.');
                    fsNew = req.body.newName2 + '.' + arrName[1];
                    Files.findOne({name:fsNew}, async(err, file2)=>{
                        if(!file2){
                            file1.name = fsNew;
                            file1.save((err, updated)=>{})
                            fs.rename(path.join(__dirname, 'uploaded', fsOld), path.join(__dirname, 'uploaded', fsNew), function (err){
                                if(err){
                                    console.log(err);
                                }
                            });
                            
                            if (user.role == 'Administrator' || user.role == "Manager") { 
                                res.redirect('/admanagerhome'); 
                            }
                            else { 
                                res.redirect('/userhome'); 
                            }
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if(user.role == 'Administrator'){                 
                                res.render('adManagerHome.hbs',{error:"File name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;"  });
                            }
                            else if(user.role == 'Manager'){
                                res.render('adManagerHome.hbs', {error: "File name already exists", folders:folders, files:files, path:directory, link: "/adManagerHome", design:"trap",styling:"background:transparent; border: none !important;" })
                            }
                        }
                    })
                }
            })
        }
        else{
            Files.findOne({_id:selected}, (err, file1)=>{
                if(file1){
                    let fsOld;
                    let arrName;
                    let fsNew;
                    fsOld = file1.name;
                    arrName= fsOld.split('.');
                    fsNew = req.body.newName2 + '.' + arrName[1];
                    Files.findOne({name:fsNew}, async(err, file2)=>{
                        if(!file2){
                            file1.name = fsNew;
                            file1.save((err, updated)=>{})
                            fs.rename(path.join(__dirname, 'uploaded', fsOld), path.join(__dirname, 'uploaded', fsNew), function (err){
                                if(err){
                                    console.log(err);
                                }
                            });

                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == 'Administrator'){
                                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()"  })
                            }
                            else{
                                res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()"  })
                            }                           
                        }
                        else{     
                                const folders = await Folders.find({parent:folID});
                                const files = await Files.find({parent:folID});
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                if(user.role == 'Administrator'){
                                    res.render('adManagerHome.hbs',{error:"File name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()"  });
                                }
                                else if(user.role == 'Manager'){
                                    res.render('adManagerHome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",func:"backFolder()" })
                                }                      
                        }
                    })
                }
            })
        }      
    })
})

app.get('/search-user', (req, res) => {
    Account.findOne({ username: req.query.textSearch }, (error, targetUser) => {
        if (req.query.textSearch == req.session.name) {
            Account.findOne({ username: req.session.name }, (err, user) => {
                if (user.role == "Administrator") {
                    return res.render('profile.hbs', { link: "/admanagerhome", profileName: req.session.name, role: user.role, C: "regisButton", act: "redirectRegister()", content: "Register an Account", vError: 'visible', oError: '1', type: 'error', mError: "Failed to find user" });
                }
                else if (user.role == "Manager") {
                    return res.render('profile.hbs', { link: "/admanagerhome", profileName: req.session.name, role: user.role, design: "trap", vError: 'visible', oError: '1', type: 'error', mError: "Failed to find user" })
                }
            });
        }
        else if (targetUser && req.query.success == "password") {
            return res.render('editUser.hbs', { username: req.query.textSearch, vSuccess: 'visible', oSuccess: '1', type: 'success', mSuccess: "Password has been changed" })
        }
        else if (targetUser && req.query.success == "role") {
            return res.render('editUser.hbs', { username: req.query.textSearch, vSuccess: 'visible', oSuccess: '1', type: 'success', mSuccess: "Role has been changed" })
        }
        else if (targetUser) {
            return res.render('editUser.hbs', { username: req.query.textSearch })
        }
        else {
            Account.findOne({ username: req.session.name }, (err, user) => {
                if (user.role == "Administrator") {
                    return res.render('profile.hbs', { link: "/admanagerhome", profileName: req.session.name, role: user.role, C: "regisButton", act: "redirectRegister()", content: "Register an Account", vError: 'visible', oError: '1', type: 'error', mError: "Failed to find user" });
                }
                else if (user.role == "Manager") {
                    return res.render('profile.hbs', { link: "/admanagerhome", profileName: req.session.name, role: user.role, design: "trap", vError: 'visible', oError: '1', type: 'error', mError: "Failed to find user" })
                }
            });
        }
    })
});

app.get('/search-file', async (req, res) => {
    Account.findOne({ username: req.session.name }, async(err, user) => {
        if (user.role == "Administrator") {
            const files = await Files.find({ name: { $regex: req.query.textSearch } });
            const folders = await Folders.find({ name: { $regex: req.query.textSearch } });
            triggerSearch = true;
            return res.render('adManagerHome.hbs', { folders, files, link: "/admanagerhome", ID: "/register", Content: "Register a User",styling: "background:transparent; border: none !important;" });
        }
        else if (user.role == "Manager") {
            const files = await Files.find({ name: { $regex: req.query.textSearch } });
            const folders = await Folders.find({ name: { $regex: req.query.textSearch } });
            triggerSearch = true;
            return res.render('adManagerHome.hbs', { link: "/admanagerhome", design: "trap", folders, files,styling: "background:transparent; border: none !important;" })
        }
        else if(user.role == "Employee"){
            const files = await Files.find({ name: { $regex: req.query.textSearch }, access:"Unrestricted" });
            const folders = await Folders.find({ name: { $regex: req.query.textSearch }, access:"Unrestricted" });
            triggerSearch = true;
            return res.render('userHome.hbs',{link:"/userhome", folders, files, styling: "background:transparent; border: none !important;" });
        }
    });
});

app.post('/change-selected-password', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    Account.updateOne({ username: req.query.textSearch }, { pass: hashedPassword }, (error, success) => {
        if (success) {
            res.redirect('/search-user?textSearch=' + req.query.textSearch)
        }
    })
});

app.post('/edit-role', (req, res) => {
    Account.updateOne({ username: req.query.textSearch }, { role: req.body.roles }, (error, success) => {
        if (success) {
            res.redirect('/search-user?textSearch=' + req.query.textSearch)
        }
    })
});

app.get('/delete-user', (req, res) => {
    Account.deleteOne({ username: req.query.textSearch }, (error, success) => {
        if (success) {
            res.redirect('/admanagerhome')
        } else {
            console.log("wala");
        }
    })
});

app.get('/uploadresult', async(req, res)=>{
    await new Promise(resolve => setTimeout(resolve, 1000)); // for some reason it takes time for the file to be displayed
    if (directory == "") {
        const files = await Files.find({ parent: "" });
        const folders = await Folders.find({ parent: "" });
        Account.findOne({ username: req.session.name }, (err, user) => {
            if (err){
                res.render('adManagerHome.hbs', { folders, files, link: "/admanagerhome", ID: "/register", Content:"Register a User", vError: 'visible' , oError: '1', type: 'error'});
            }

            if (user.role == "Administrator") {
                res.render('adManagerHome.hbs', { folders, files, link: "/admanagerhome", ID: "/register", Content:"Register a User", vSuccess: 'visible' , oSuccess: '1', type: 'success',styling: "background:transparent; border: none !important;"});
            }
            if (user.role == "Manager") {
                res.render('adManagerHome.hbs', { folders: folders, files: files , link: "/admanagerhome", design:"trap",styling: "background:transparent; border: none !important;" });
            }
        })
    }
    else {
        Account.findOne({ username: req.session.name }, async(err, user) => {
            const resultingFolder = await Folders.find({ parent: folID })
            const resultingFiles = await Files.find({ parent: folID })
            if (user.role == 'Administrator') {
                console.log("ADMIN");
                res.render('adManagerHome.hbs', { folders: resultingFolder, files: resultingFiles, path: directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()"  });
            }
            else if (user.role == "Manager") {
                res.render('adManagerHome.hbs', { folders: resultingFolder, files: resultingFiles, path: directory, link: "/admanagerhome", design:"trap",func:"backFolder()"  });
            }
        });
    }
})

app.get('/deleteManyResult', async(req,res)=>{
    await new Promise(resolve => setTimeout(resolve, 1500));
    if(directory == ""){
        res.redirect('/admanagerhome');
    }
    else{
        const folders = await Folders.find({parent:folID});
        const files = await Files.find({parent:folID});
        Account.findOne({username:req.session.name}, (err, user)=>{
            if(user){
                if(user.role == 'Administrator'){
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()" })
                }
                else{
                    res.render('adManagerHome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()" })
                }
            }
        })
    }
})

app.get('/deleteMany', async (req, res) => {
    arrSelected = req.query.arrDelete;
    let listOfNames = [];
    for (let i = 0; i < arrSelected.length; i++) {
        console.log(arrSelected[i]);
        Folders.findOne({_id: arrSelected[i]}, async(err, mainFol)=>{
                
            if(mainFol){        
                let holder = await Folders.find({parent:mainFol._id});
                let fHolder = await Files.find({parent:mainFol._id})
                       
                for(let val = 0; val < holder.length; val++){
                    listOfNames.push(holder[val]);
                }
                for(let val = 0; val < fHolder.length; val++){
                    listOfNames.push(fHolder[val]);
                }
                for (let index = 0; index < holder.length; index++){
                    let temp = await Folders.find({parent:holder[index]._id});
                    let temp1 = await Files.find({parent:holder[index]._id});
                    if (temp.length != 0){
                        for(let val = 0; val < temp.length; val++){
                            holder.push(temp[val]);
                        }
                        for(let val = 0; val < temp.length; val++){
                            listOfNames.push(temp[val]);
                        }
                    }
                    if(temp1.length != 0){
                        for(let val = 0; val < temp1.length; val++){
                            listOfNames.push(temp1[val]);
                        }
                        
                    }
                }
                listOfNames.push(mainFol);
                console.log(listOfNames);
                for(let d = 0; d < listOfNames.length; d++){
                  
                    Folders.deleteOne({ _id: listOfNames[d]._id }, (error, ans1) => {
                        if(ans1){
                            console.log(ans1);
                        }
                    })
                    Files.findOne({ _id: listOfNames[d]._id }, (error, result) => {
                        if (result) {
                            fs.unlink(path.join(__dirname, 'uploaded', result.name), (error, result) => { });
                            Files.deleteOne({ _id: listOfNames[d]._id }, (err, ans1) => {
                                if (ans1) {
                                    console.log(ans1);
                                }
                            })
                        }
                    })
                }
            }
        })

        Files.findOne({ _id: arrSelected[i] }, (error, result) => {
            if (result) {
                fs.unlink(path.join(__dirname, 'uploaded', result.name), (error, result) => { });
                Files.deleteOne({ _id: arrSelected[i] }, (err, ans1) => {
                    if (ans1) {
                        console.log(ans1);
                    }
                })
            }
        })
    }
})

app.get('/getMove', (req, res)=>{
    IDSelected = req.query.arrFilter;
    allID = [];
   
})

app.get('/getMultMove', (req, res)=>{
    IDMultMove = req.query.arrFilter;
    allID = req.query.arrNotFilter;
    IDSelected = "";
})

app.get('/filterMany', async(req, res)=>{
    IDSelected = "";
    if(directory == ""){
        const folders1 = await Folders.find({_id:{$in:allID}, parent:""});
        const folders = await Folders.find({parent:""});
        const files = await Files.find({parent:""});
        Account.findOne({username: req.session.name}, (err, user)=>{
            if(user.role == "Administrator"){
                res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1,moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,styling: "background:transparent; border: none !important;"});
            }
            else if(user.role == "Manager"){
                
                res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,styling: "background:transparent; border: none !important;" })
            }
        })
    }
    else{
        console.log("IN")
        const folders1 = await Folders.find({parent:""});
        const folders = await Folders.find({parent:folID});
        const files = await Files.find({parent:folID});
        Account.findOne({username: req.session.name}, (err, user)=>{
            if(user.role == "Administrator"){
                res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1, moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,func:"backFolder()" });
            }
            else if(user.role == "Manager"){
                
                res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,func:"backFolder()"  })
            }
        })
    }
})

app.get('/filterSelected', async(req, res)=>{
        const folders1 = await Folders.find({_id:{$ne:IDSelected}, parent:""});
        if(directory == ""){
            const folders = await Folders.find({parent:""});
            const files = await Files.find({parent:""});
            Account.findOne({username: req.session.name}, (err, user)=>{
                if(user.role == "Administrator"){
                    res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1,moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,styling: "background:transparent; border: none !important;"});
                }
                else if(user.role == "Manager"){
                    
                    res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,styling: "background:transparent; border: none !important;" })
                }
            })
        }
        else{
            const folders = await Folders.find({parent:folID});
            const files = await Files.find({parent:folID});
            Account.findOne({username: req.session.name}, (err, user)=>{
                if(user.role == "Administrator"){
                    res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1, moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,func:"backFolder()" });
                }
                else if(user.role == "Manager"){
                    
                    res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,moveModal:"visibility:visible", blockerModal:"display:flex",path:directory,func:"backFolder()"  })
                }
            })
        }
})

app.get('/moveAction', async(req, res)=>{
    if(IDSelected != ""){
        Account.findOne({username:req.session.name}, (err, user)=>{
            if(folIDMove == ""){
                console.log("START");
                Folders.findOne({_id:IDSelected}, async(err, toMove)=>{
                    if(toMove){
                        toMove.parent = "";
                        toMove.save((err, updated)=>{});
                        directory1 = "";
                        folIDMove = "";
                        folMove = "";
                        if(directory == ""){
                            res.redirect('/admanagerhome');
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == "Administrator"){
                                res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User" ,path:directory,func:"backFolder()"});
                            }
                            else if(user.role == "Manager"){
                                
                                res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()" ,path:directory})
                            }
                        }
                    }
                        
                })
                Files.findOne({_id:IDSelected}, async(err, toMove)=>{
                    if(toMove){
                        toMove.parent = "";
                        toMove.save((err, updated)=>{});
                        directory1 = "";
                        folIDMove = "";
                        folMove = "";
                       if(directory == ""){
                            res.redirect('/admanagerhome');
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == "Administrator"){
                                res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()" ,path:directory});
                            }
                            else if(user.role == "Manager"){
                                
                                res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()" ,path:directory })
                            }
                        }
                    }  
                })
            }
            else{
                Folders.findOne({_id:folIDMove}, (err, newParentFol)=>{
                    Folders.findOne({_id:IDSelected}, async(err, toMove)=>{
                        if(toMove){
                            toMove.parent = newParentFol._id;
                            toMove.save((err, updated)=>{});
                            directory1 = "";
                            folIDMove = "";
                            folMove = "";
                            if(directory == ""){
                                res.redirect('/admanagerhome');
                            }
                            else{
                                const folders = await Folders.find({parent:folID});
                                const files = await Files.find({parent:folID});
                                if(user.role == "Administrator"){
                                    res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()" ,path:directory});
                                }
                                else if(user.role == "Manager"){
                                    
                                    res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()" ,path:directory })
                                }
                            }
                        }                    
                    })
                    Files.findOne({_id:IDSelected}, async(err,toMove)=>{
                        if(toMove){
                            toMove.parent = newParentFol._id;
                            toMove.save((err, updated)=>{});
                            directory1 = "";
                            folIDMove = "";
                            folMove = "";
                            if(directory == ""){
                                res.redirect('/admanagerhome');
                            }
                            else{
                                const folders = await Folders.find({parent:folID});
                                const files = await Files.find({parent:folID});
                                if(user.role == "Administrator"){
                                    res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()" ,path:directory});
                                }
                                else if(user.role == "Manager"){
                                    
                                    res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()" ,path:directory })
                                }
                            }
                        }
                    })
                })
            }      
        })
    }
    else{  
        Account.findOne({username:req.session.name}, async(err, user)=>{
            if(user){
                if(folIDMove == ""){
                    for(let k = 0; k < IDMultMove.length; k++){
                        console.log(IDMultMove[k]);
                        
                        Folders.findById(IDMultMove[k], (err, toMove)=>{
                            if(toMove){
                                toMove.parent = "";
                                toMove.save((err, updated)=>{});
                            }
                            
                        })
                        Files.findById(IDMultMove[k], (err, toMove)=>{
                        
                            if(toMove){
                                toMove.parent = "";
                                toMove.save((err, updated)=>{});
                            }  
                        })
                    }                           
                }
                else{
                    for(let k = 0; k < IDMultMove.length; k++){
                        console.log(IDMultMove[k]);
                        Folders.findOne({_id:folIDMove}, (err, newParentFol)=>{
                            Folders.findById(IDMultMove[k], (err, toMove)=>{
                                if(toMove){
                                    console.log("FOUNDFOUNDFOUND");
                                    toMove.parent = newParentFol._id;
                                    toMove.save((err, updated)=>{});
                                   
                                }
                            })
                            Files.findById(IDMultMove[k], (err, toMove)=>{
                                if(toMove){
                                    console.log("FOUNDFOUNDFOUND");
                                    toMove.parent = newParentFol._id;
                                    toMove.save((err, updated)=>{});
                                }
                            })
                        })
                    }                    
                }
                directory1 = "";
                folIDMove = "";
                folMove = "";
                await new Promise(resolve => setTimeout(resolve, 1000));
                if(directory == ""){
                    res.redirect('/admanagerhome');
                }
                else{
                    const folders = await Folders.find({parent:folID});
                    const files = await Files.find({parent:folID});
                    if(user.role == "Administrator"){
                        res.render('adManagerHome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User" ,path:directory,func:"backFolder()"});
                    }
                    else if(user.role == "Manager"){
                        
                        res.render('adManagerHome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()" ,path:directory})
                    }
                }
            }           
        })    
    }
})

app.get('/downloadSingleFile', (req, res) => {
    Files.findOne({ _id: req.query.filename }, (error, result) => {
        res.download(path.join(__dirname, 'uploaded', result.name));
    })
});

app.get('/downloadMultipleFile', (req, res) => {
    const filenames = req.query.filenames.split(",")
    var container = []

    Files.find({ _id: filenames }, (error, result) => {
        result.forEach(file => {
            console.log(file.name);
            container.push({ path: path.join(__dirname, 'uploaded', file.name), name: file.name })
        })

        res.zip(container);
    })
});

app.listen(3000, (err)=>{
    console.log("Server listening on Port 3000")
});
