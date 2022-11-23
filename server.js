const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require("hbs");
const fileUpload = require('express-fileupload')
const Account = require('./database/models/Account');
const session = require('express-session');
const Files = require('./database/models/Files');
const Folders = require('./database/models/Folders');
const { type } = require('os');
fol = "";
folID = "",
directory = "";
iter={};
selected="";
nameselected="",
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

app.get('/', async(req, res)=>{
    
    //set the credentials of the admin
    adminuser = "admin1";
    adminpass = "abc1234";
    Account.findOne({username: adminuser}, async(err, result)=>{
        if(result){

        }
        else{
            try{
                const hashed = await bcrypt.hash(adminpass, 10);
                Account.create({
                    username: adminuser,
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
                    Folders.findOne({_id:parentFol}, async(err, backfolder)=>{
                        if(backfolder){
                            fol = backfolder.name;
                            const folders = await Folders.find({parent:backfolder._id});
                            const files = await Files.find({parent:backfolder._id});
                            if(user.role == "Administrator"){
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User", func:"backFolder()", contents:"<" });
                            }
                            else if(user.role == "Manager"){
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;", func:"backFolder()", contents:"<"  })
                            }
                            else{
                                res.render('userhome.hbs', {folders: folders,files: files, path:directory, func:"backFolder()", contents:"<"  });
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
        if(user.role == "Administrator"){
            res.render('profile.hbs',{link:"/admanagerhome",profilename: req.session.name, role:user.role, C:"regisbutton",act:"redirectRegister()", content:"Register an Account"});
        }
        else if(user.role == "Manager"){
           
                res.render('profile.hbs',{link: "/admanagerhome",profilename: req.session.name, role:user.role, design:"background:transparent; border: none !important;" })
            }
        
        else{
            res.render('profile.hbs',{link:"/userhome",profilename: req.session.name, role:user.role, design:"background:transparent; border: none !important;"});
        }
        
    })
})

app.get('/admanagerhome', async(req, res)=>{
    fol="";
    directory="";
    const files  = await Files.find({parent:""});
    const folders = await Folders.find({parent:""});
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user.role == "Administrator"){
            res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User",styling:"background:transparent; border: none !important;" });
        }
        else if(user.role == "Manager"){
            
            res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;", folders, files,styling:"background:transparent; border: none !important;" })
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
app.get('/loadfolder', async(req, res)=>{
    if(directory =="" || directory == null){
        directory = "/"+fol;
    }
    else{
        console.log("ADD")
        directory = directory + "/" + fol;
    }
   
    arrDirect = directory.split('/');
        console.log("directory:" + directory);
        console.log("fol:" + fol);
        
        Account.findOne({username:req.session.name}, async(err, user)=>{
            if(user.role == "Administrator"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID})
                console.log("ADMIN");
                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User", func:"backFolder()", contents:"<"  });
            }
            else if(user.role == "Manager"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID})
                console.log("Manager");
                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;", func:"backFolder()", contents:"<"  });
            }
            else{
                const folders = await Folders.find({parent: folID, access:"Unrestricted"});
                const files = await Files.find({parent: folID, access:"Unrestricted"})
                res.render('userhome.hbs', {folders: folders,files: files, path:directory, func:"backFolder()", contents:"<"  })
            }
            
        })
    
})
app.get('/userhome', async(req, res)=>{
    fol="";
    directory="";
    folID = "";
    const files  = await Files.find({access:"Unrestricted",parent:""});
    const folders = await Folders.find({access:"Unrestricted", parent:""});
    res.render('userhome.hbs', {folders,files,styling:"background:transparent; border: none !important;"});
})
app.get('/register', (req, res)=>{
    res.render('register.hbs');
})
app.get('/changepassword', (req, res) => {
   
   
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user){
            
            if(user.role == "Administrator"){
                res.render('changepassword.hbs',{link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" })
            }
            else if(user.role == "Manager"){
                res.render('changepassword.hbs',{link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;" })
            }
            else{
                res.render('changepassword.hbs',{link: "/userhome", design:"background:transparent; border: none !important;cursor: context-menu;"})
            }
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
                            errormsg: "Invalid Credentials",
                        })
                    }
                })
            }
            else{
                res.render("login.hbs",{
                    errormsg: "Invalid Credentials",
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
            if(!result)
            {
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
            else
            {
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
    if (req.body.confirmPassword != req.body.newPassword) { return res.render('changepassword.hbs', { error: "Password Change Error!" }) }
    
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
                                    res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "registeruser", act:"redirectRegister()", Content:"Register a User" }) 
                                }
                                else if(user.role == "Manager"){
                                    res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                                }
                                else{
                                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                                }
                                
                                }
                        })
                    }
                    else {  

                        if(user.role == "Administrator"){
                        res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "registeruser", act:"redirectRegister()", Content:"Register a User" }) 
                        }
                        else if(user.role == "Manager"){
                            res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                        }
                        else{
                            res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                            } 
                        }
                })
            }
            else { 
                if(user.role == "Administrator"){
                res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "registeruser", act:"redirectRegister()", Content:"Register a User" }) 
                }
                else if(user.role == "Manager"){
                    res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                }
                else{
                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                }
            }
        })
    } catch { res.redirect('/userhome') }
});

app.post('/createfolder', async(req, res) =>{
   
    
    if (directory == "" && fol == ""){
        const folders  = await Folders.find({});
        const files = await Files.find({});
        Folders.findOne({name:req.body.foldername}, (err,result)=>{
            if(!result){
                
                    Folders.create({
                        name: req.body.foldername,
                        access: req.body.accesslevel,
                        parent: "",
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
                        
                    
                        res.render('admanagerhome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User",styling:"background:transparent; border: none !important;" });
                    }
                    else if(user.role == 'Manager'){
                        res.render('admanagerhome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;",styling:"background:transparent; border: none !important;"})
                    }
                   
                });
            }
        })
    }
    else{
        
        arrDirect = directory.split("/");
        console.log(fol);
        console.log("INSIDE");
        Folders.findOne({name: req.body.foldername, parent: folID}, (err, result)=>{
            if(!result){
                console.log("inner")
                Folders.create({
                    name: req.body.foldername,
                    access : req.body.accesslevel,
                    parent: folID,
                    
                })
                Account.findOne({ username: req.session.name }, async(err, user) => {
                    const folders  = await Folders.find({parent: folID});
                    const files = await Files.find({parent: folID});
                    if(user.role == 'Administrator'){
                        res.render('admanagerhome.hbs',{folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User", func:"backFolder()", contents:"<"  });
                    }
                    else{
                        res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;", func:"backFolder()", contents:"<"  });
                    }
                    
                    
                });
            }
        
           else{
           
                    
            Account.findOne({ username: req.session.name }, async(err, user) => {
                const folders  = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID});
                if(user.role == 'Administrator'){
                    res.render('admanagerhome.hbs',{error:"Folder name already exists", folders: folders, files: files, func:"backFolder()", contents:"<" });
                }
                else{
                    res.render('admanagerhome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;", func:"backFolder()", contents:"<---"  });
                }
                
            });
           }
            
                
            
        })
       
        
        
    }
    
});

app.post('/uploadfile', async (req, res) => {
    selectedAccess = null

    if(req.body.exclusiveAccess){
        selectedAccess = "Restricted"
    } else {
        selectedAccess = "Unrestricted"
    }

    const files = req.files.uploadFile
    arrDirect = directory.split("/");
    if (Array.isArray(files)) {
        Account.findOne({ username: req.session.name }, async (err, user) => {
            files.forEach(file => {
                file.mv(path.resolve(__dirname, 'file', file.name), async (error) => {
                    if (directory == "") {
                        Files.create({ name: file.name, access: selectedAccess, parent: "" }, (error, post) => { })
                    }
                    else {
                        Files.create({ name: file.name, access: selectedAccess, parent: folID }, (error, post) => { })
                    }
                })
            })
        })
    }
    else {
        Account.findOne({ username: req.session.name }, async (err, user) => {
            files.mv(path.resolve(__dirname, 'file', files.name), async (error) => {
                if (directory == "") {
                    Files.create({ name: files.name, access: selectedAccess, parent: "" }, (error, post) => { })
                }
                else {
                    Files.create({ name: files.name, access: selectedAccess, parent: folID }, (error, post) => { })
                }
            });
        })
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // for some reason it takes time for the file to be displayed
    
    if (directory == "") {
        const files = await Files.find({ parent: "" });
        const folders = await Folders.find({ parent: "" });
        Account.findOne({ username: req.session.name }, (err, user) => {
            if (err){
                res.render('admanagerhome.hbs', { folders, files, link: "/admanagerhome", ID: "registeruser", act: "redirectRegister()", Content: "Register a User", vError: 'visible' , oError: '1', type: 'error'});
            }

            if (user.role == "Administrator") {
                res.render('admanagerhome.hbs', { folders, files, link: "/admanagerhome", ID: "registeruser", act: "redirectRegister()", Content: "Register a User", vSuccess: 'visible' , oSuccess: '1', type: 'success'});
            }
        })
    }
    else {
        console.log("DIRECTORY NOT EMPTY");
        arrDirect = directory.split('/');
        Account.findOne({ username: req.session.name }, (err, user) => {
            Folders.findOne({ name: fol }, async (err, ans) => {
                const resultingfolder = await Folders.find({ parent: folID })
                const resultingfiles = await Files.find({ parent: folID })
                console.log(resultingfolder);
                if (resultingfolder) {
                    if (user.role == 'Administrator') {
                        console.log("ADMIN");
                        res.render('admanagerhome.hbs', { folders: resultingfolder, files: resultingfiles, path: directory, link: "/admanagerhome", ID: "registeruser", act: "redirectRegister()", Content: "Register a User" });
                    }
                    else if (user.role == "Manager") {
                        res.render('admanagerhome.hbs', { folders: resultingfolder, files: resultingfiles, path: directory, link: "/admanagerhome", design: "background:transparent; border: none !important;cursor: context-menu;" });
                    }
                    else {
                        res.render('userhome.hbs', { folders: resultingfolder, files: resultingfiles, path: directory });
                    }
                }
            })
        });
    }
});

app.get('/delete-folder', (req, res) => {
    Account.findOne({ username: req.session.name }, (err, user) => {
        if(directory == ""){
            Folders.deleteOne({ name: req.query.name }, (error) => {
                if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
                else { res.redirect('/userhome'); }
            })
        }
        else{
            Folders.deleteOne({name: req.query.name, parent:folID}, async(err)=>{
                const folders = await Folders.find({parent:folID});
                const files = await Files.find({parent:folID});
                if(user.role == 'Administrator'){
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User"})
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;"})
                }
            })
        }
    });
});

app.get('/delete-file', (req, res) => {
    Account.findOne({ username: req.session.name }, (err, user) => {
        if(directory == ""){
            Files.deleteOne({ name: req.query.name }, (error) => {
                if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
                else { res.redirect('/userhome'); }
            })
        }
        else{
            Files.deleteOne({name: req.query.name, parent:folID}, async(err)=>{
                const folders = await Folders.find({parent:folID});
                const files = await Files.find({parent:folID});
                if(user.role == 'Administrator'){
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User"})
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;"})
                }
            })
        }
       
    });
});
app.get('/select', (req, res)=>{
    Folders.findOne({name:req.query.selected}, (err, ans)=>{
        if(ans){
            selected = ans._id;
            nameselected = ans.name;
        }
    })
    console.log(selected);
})
app.get('/selectfile', (req, res)=>{
    Files.findOne({name: req.query.selected}, (err, ans)=>{
        if(ans){
            selected = ans._id;
            nameselected = ans.name;
        }
    })
})
app.post('/rename-folder', (req, res)=>{
   
    Account.findOne({ username: req.session.name }, (err, user) => {
        if (directory == ""){
            Folders.findOne({_id:selected}, (err, folder1)=>{
                if(folder1){
                    Folders.findOne({name:req.body.newname1}, (err, folder2)=>{
                        if(!folder2){
                            folder1.name =req.body.newname1;
                            folder1.save((err, updated)=>{})
                            if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
                            else { res.redirect('/userhome'); }
                        }
                    })
                }
            })
        }
        else{
            Folders.findOne({_id:selected, parent:folID}, (err, folder1)=>{
                if(folder1){
                    console.log("INNERLOOP")
                    Folders.findOne({name:req.body.newname1, parent: folID}, async(err, folder2)=>{
                        if(!folder2){
                            
                            folder1.name =req.body.newname1;
                            folder1.save((err, updated)=>{})
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == 'Administrator'){
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User"})
                            }
                            else{
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;"})
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
                    Files.findOne({name:req.body.newname2}, (err, file2)=>{
                        if(!file2){
                            file1.name = req.body.newname2;
                            file1.save((err, updated)=>{})
                            if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
                            else { res.redirect('/userhome'); }
                        }
                    })
                }
            })
        }
        else{
            Files.findOne({_id:selected}, (err, file1)=>{
                if(file1){
                    Files.findOne({name:req.body.newname2, parent: folID}, async(err, file2)=>{
                        if(!file2){
                            file1.name = req.body.newname2;
                            file1.save((err, updated)=>{})
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == 'Administrator'){
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User"})
                            }
                            else{
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;"})
                            }
                            
                        }
                    })
                }
            })
        }
        
    })
})
app.get('/search-user', (req, res) => {
    Account.findOne({ username: req.query.text_search }, (error, target_user) => {
        if (target_user) {
            res.render('edit-user.hbs', { username: req.query.text_search })
        } else {
            console.log("wala");
        }
    })
});

app.post('/change-selected-password', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    Account.updateOne({ username: req.query.text_search }, { pass: hashedPassword }, (error, success) => {
        if (success) {
            res.redirect('/search-user?text_search=' + req.query.text_search)
        }
    })
});

app.post('/edit-role', (req, res) => {
    Account.updateOne({ username: req.query.text_search }, { role: req.body.role }, (error, success) => {
        if (success) {
            res.redirect('/search-user?text_search=' + req.query.text_search)
        }
    })
});

app.get('/delete-user', (req, res) => {
    Account.deleteOne({ username: req.query.text_search }, (error, success) => {
        if (success) {
            res.redirect('/admanagerhome')
        } else {
            console.log("wala");
        }
    })
});
app.listen(3000, (err)=>{
    console.log("Server listening on Port 3000")
});
