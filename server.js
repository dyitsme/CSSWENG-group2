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
folmove= "";
folID = "",
folIDmove = "",
directory = "";
selected="";
nameselected="",
IDselected="";
directory1 = "";
IDmultMove=[];
allID=[];
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
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<" });
                            }
                            else if(user.role == "Manager"){
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"  })
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
        if(user){
            if(user.role == "Administrator"){
                res.render('profile.hbs',{link:"/admanagerhome",profilename: req.session.name, role:user.role, C:"regisbutton",act:"redirectRegister()", content:"Register an Account"});
            }
            else if(user.role == "Manager"){
               
                    res.render('profile.hbs',{link: "/admanagerhome",profilename: req.session.name, role:user.role, design:"trap" })
                }
            
            else{
                res.render('profile.hbs',{link:"/userhome",profilename: req.session.name, role:user.role, design:"trap"});
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
                res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;" });
            }
            else if(user.role == "Manager"){
                
                res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files,styling:"background:transparent; border: none !important;" })
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
    folmove = req.query.folder;
    Folders.findOne({name:req.query.folder}, (err, ans)=>{
        if(ans){
            folIDmove = ans._id;
        }
    })
  
    result = {garbage:"garbage"};
    res.send(result);

})
app.get('/movloadfolder', async(req, res)=>{
    if(directory1 =="" || directory1 == null){
        directory1 = "/"+folmove;
    }
    else{
        console.log("ADD")
        directory1 = directory1 + "/" + folmove;
    }
   
    arrDirect1 = directory1.split('/');
        console.log("directory:" + directory1);
        console.log("fol:" + folmove);
        
        Account.findOne({username:req.session.name}, async(err, user)=>{
            if(user.role == "Administrator"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID});
                let folders1;
                if(IDselected != ""){
                    console.log(IDselected);
                     folders1 = await Folders.find({parent: folIDmove,_id:{$ne:IDselected}})
                }
                else{
                    if(fol === folmove){
                       console.log("SPECIAL");
                       
                         folders1 = await Folders.find({_id:{$in:allID}});
                    }
                    else{
                         folders1 = await Folders.find({parent:folIDmove});
                    }

                }
                //const folders1 = await Folders.find({parent: folIDmove,_id:{$ne:IDselected}})
                console.log("ADMIN");
                if(directory == ""){
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", styling:"background:transparent; border: none !important;",movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex"  });
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome",ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<",movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex"  });
                }
                
            }
            else if(user.role == "Manager"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID});
                let folders1;
                if(IDselected != ""){
                    console.log(IDselected);
                     folders1 = await Folders.find({parent: folIDmove,_id:{$ne:IDselected}})
                }
                else{
                    if(fol === folmove){
                       console.log("SPECIAL");
                       
                         folders1 = await Folders.find({_id:{$in:allID}});
                    }
                    else{
                         folders1 = await Folders.find({parent:folIDmove});
                    }

                }
                console.log("Manager");
                if(directory == ""){
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", styling:"background:transparent; border: none !important;",movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex"  });
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<",movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex"  });
                }
                
            }
            // else{
            //     const folders = await Folders.find({parent: folID, access:"Unrestricted"});
            //     const files = await Files.find({parent: folID, access:"Unrestricted"})
            //     res.render('userhome.hbs', {folders: folders,files: files, path:directory, func:"backFolder()", contents:"<",link: "/userhome",design:"trap"  })
            // }
            
        })
    
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
                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome",ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<"  });
            }
            else if(user.role == "Manager"){
                const folders = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID})
                console.log("Manager");
                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"  });
            }
            else{
                const folders = await Folders.find({parent: folID, access:"Unrestricted"});
                const files = await Files.find({parent: folID, access:"Unrestricted"})
                res.render('userhome.hbs', {folders: folders,files: files, path:directory, func:"backFolder()", contents:"<",link: "/userhome",design:"trap"  })
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
                res.render('userhome.hbs', {folders,files,styling:"background:transparent; border: none !important;"});
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
                res.render('changepassword.hbs',{link: "/admanagerhome", ID: "/register", Content:"Register a User"})
            }
            else if(user.role == "Manager"){
                res.render('changepassword.hbs',{link: "/admanagerhome", design:"trap" })
            }
            else{
                res.render('changepassword.hbs',{link: "/userhome", design:"trap"})
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
                                    res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "/register", Content:"Register a User" }) 
                                }
                                else if(user.role == "Manager"){
                                    res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"trap" }) 
                                }
                                else{
                                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"trap" }) 
                                }
                                
                                }
                        })
                    }
                    else {  

                        if(user.role == "Administrator"){
                        res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "/register", Content:"Register a User" }) 
                        }
                        else if(user.role == "Manager"){
                            res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"trap" }) 
                        }
                        else{
                            res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"trap" }) 
                            } 
                        }
                })
            }
            else { 
                if(user.role == "Administrator"){
                res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",ID: "/register", Content:"Register a User"}) 
                }
                else if(user.role == "Manager"){
                    res.render('changepassword.hbs', {link:'/admanagerhome', error: "Password Change Error!",design:"trap" }) 
                }
                else{
                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"trap" }) 
                }
            }
        })
    } catch { res.redirect('/userhome') }
});

app.post('/createfolder', async(req, res) =>{
   
    
    if (directory == "" && fol == ""){
        const folders  = await Folders.find({parent:""});
        const files = await Files.find({parent:""});
        Folders.findOne({name:req.body.foldername}, (err,result)=>{
            if(!result){
                today = new Date();
                dd = String(today.getDate()).padStart(2, '0');
                mm = String(today.getMonth() + 1).padStart(2, '0');
                yyyy = today.getFullYear();
                now = mm + '/' + dd + '/' + yyyy;
                
                    Folders.create({
                        name: req.body.foldername,
                        access: req.body.accesslevel,
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
                        
                    
                        res.render('admanagerhome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;" });
                    }
                    else if(user.role == 'Manager'){
                        res.render('admanagerhome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",styling:"background:transparent; border: none !important;"})
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
                console.log("inner");
                today = new Date();
                dd = String(today.getDate()).padStart(2, '0');
                mm = String(today.getMonth() + 1).padStart(2, '0');
                yyyy = today.getFullYear();
                now = mm + '/' + dd + '/' + yyyy;
                Folders.create({
                    name: req.body.foldername,
                    access : req.body.accesslevel,
                    parent: folID,
                    date: now,
                    uploader: req.session.name,
                    
                })
                Account.findOne({ username: req.session.name }, async(err, user) => {
                    const folders  = await Folders.find({parent: folID});
                    const files = await Files.find({parent: folID});
                    if(user.role == 'Administrator'){
                        res.render('admanagerhome.hbs',{folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<"  });
                    }
                    else{
                        res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"  });
                    }
                    
                    
                });
            }
        
           else{
           
                    
            Account.findOne({ username: req.session.name }, async(err, user) => {
                const folders  = await Folders.find({parent: folID});
                const files = await Files.find({parent: folID});
                if(user.role == 'Administrator'){
                    res.render('admanagerhome.hbs',{error:"Folder name already exists", folders: folders, files: files, func:"backFolder()", contents:"<", ID: "/register", Content:"Register a User" });
                }
                else{
                    res.render('admanagerhome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"  });
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
            files.forEach(file => {
                Files.find({ name: { $regex: file.name } }, (error, result) => {
                    if (result != 0) {
                        file.name = "(" + result.length + ") " + file.name
                    }

                    file.mv(path.resolve(__dirname, 'uploaded', file.name), async (error) => {
                        if (directory == "") {
                            Files.create({ name: file.name, access: selectedAccess, parent: "", date: now, size: file.size, uploader: req.session.name }, (error, post) => { })
                        }
                        else {
                            Files.create({ name: file.name, access: selectedAccess, parent: folID, date: now, size: file.size, uploader: req.session.name }, (error, post) => { })
                        }
                    })
                })
            })
        })
    }
    else {
        Account.findOne({ username: req.session.name }, async (err, user) => {
            Files.find({ name: { $regex: files.name } }, (error, result) => {
                if (result != 0) {
                    files.name = "(" + result.length + ") " + files.name
                }

                files.mv(path.resolve(__dirname, 'uploaded', files.name), async (error) => {
                    if (directory == "") {
                        Files.create({ name: files.name, access: selectedAccess, parent: "", date: now, size: files.size, uploader: req.session.name }, (error, post) => { })
                    }
                    else {
                        Files.create({ name: files.name, access: selectedAccess, parent: folID, date: now, size: files.size, uploader: req.session.name }, (error, post) => { })
                    }
                });
            })
        })
    }

        await new Promise(resolve => setTimeout(resolve, 1000)); // for some reason it takes time for the file to be displayed
        
        if (directory == "") {
            const files = await Files.find({ parent: "" });
            const folders = await Folders.find({ parent: "" });
            Account.findOne({ username: req.session.name }, (err, user) => {
                if (err){
                    res.render('admanagerhome.hbs', { folders, files, link: "/admanagerhome", ID: "/register", Content:"Register a User", vError: 'visible' , oError: '1', type: 'error'});
                }

                if (user.role == "Administrator") {
                    res.render('admanagerhome.hbs', { folders, files, link: "/admanagerhome", ID: "/register", Content:"Register a User", vSuccess: 'visible' , oSuccess: '1', type: 'success',styling: "background:transparent; border: none !important;"});
                }
                if (user.role == "Manager") {
                    res.render('admanagerhome.hbs', { folders: folders, files: files , link: "/admanagerhome", design:"trap",styling: "background:transparent; border: none !important;" });
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
                        if (user.role == 'Administrator') {
                            console.log("ADMIN");
                            res.render('admanagerhome.hbs', { folders: resultingfolder, files: resultingfiles, path: directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()", contents:"<" });
                        }
                        else if (user.role == "Manager") {
                            res.render('admanagerhome.hbs', { folders: resultingfolder, files: resultingfiles, path: directory, link: "/admanagerhome", design:"trap",func:"backFolder()", contents:"<" });
                        }
                        else {
                            res.render('userhome.hbs', { folders: resultingfolder, files: resultingfiles, path: directory,func:"backFolder()", contents:"<" });
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
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<"})
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"})
                }
            })
        }
    });
});

app.get('/delete-file', (req, res) => {
    Account.findOne({ username: req.session.name }, (err, user) => {
        if(directory == ""){
            Files.deleteOne({ name: req.query.name }, (error) => {
                fs.unlink(path.join(__dirname, 'uploaded', req.query.name), (error, result)=>{});
                if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
                else { res.redirect('/userhome'); }
            })
        }
        else{
            Files.deleteOne({name: req.query.name, parent:folID}, async(err)=>{
                const folders = await Folders.find({parent:folID});
                const files = await Files.find({parent:folID});
                fs.unlink(path.join(__dirname, 'uploaded', req.query.name), (error, result)=>{});
                if(user.role == 'Administrator'){
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<"})
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"})
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
                    Folders.findOne({name:req.body.newname1}, async(err, folder2)=>{
                        if(!folder2){
                            folder1.name =req.body.newname1;
                            folder1.save((err, updated)=>{})
                            if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
                            else { res.redirect('/userhome'); }
                        }
                        else{
                            const folders = await Folders.find({parent:""});
                            const files= await Files.find({parent:""});
                            if(user.role == 'Administrator'){
                                res.render('admanagerhome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",styling:"background:transparent; border: none !important;" });
                            }
                            else if(user.role == 'Manager'){
                                res.render('admanagerhome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",styling:"background:transparent; border: none !important;"})
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
                    Folders.findOne({name:req.body.newname1, parent: folID}, async(err, folder2)=>{
                        if(!folder2){
                            
                            folder1.name =req.body.newname1;
                            folder1.save((err, updated)=>{})
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if(user.role == 'Administrator'){
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<" })
                            }
                            else{
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<" })
                            }
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if(user.role == 'Administrator'){
                        
                    
                                res.render('admanagerhome.hbs',{error:"Folder name already exists", folders: folders,files: files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()", contents:"<" });
                            }
                            else if(user.role == 'Manager'){
                                res.render('admanagerhome.hbs', {error: "Folder name already exists", folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap",func:"backFolder()", contents:"<"})
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
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<" })
                            }
                            else{
                                res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<" })
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
        if (target_user && req.query.success == "password") {
            return res.render('edit-user.hbs', { username: req.query.text_search, vSuccess: 'visible', oSuccess: '1', type: 'success', mSuccess: "Password has been changed" })
        } else if (target_user && req.query.success == "role") {
            return res.render('edit-user.hbs', { username: req.query.text_search, vSuccess: 'visible', oSuccess: '1', type: 'success', mSuccess: "Role has been changed" })
        } else if (target_user) {
            return res.render('edit-user.hbs', { username: req.query.text_search })
        } else {
            Account.findOne({ username: req.session.name }, (err, user) => {
                if (user.role == "Administrator") {
                    return res.render('profile.hbs', { link: "/admanagerhome", profilename: req.session.name, role: user.role, C: "regisbutton", act: "redirectRegister()", content: "Register an Account", vError: 'visible', oError: '1', type: 'error', mError: "Failed to find user" });
                }
                else if (user.role == "Manager") {
                    return res.render('profile.hbs', { link: "/admanagerhome", profilename: req.session.name, role: user.role, design: "trap", vError: 'visible', oError: '1', type: 'error', mError: "Failed to find user" })
                }
            });
        }
    })
});

app.get('/search-file', async (req, res) => {

    Account.findOne({ username: req.session.name }, async(err, user) => {
        if (user.role == "Administrator") {
            const files = await Files.find({ name: { $regex: req.query.text_search } });
            const folders = await Folders.find({ name: { $regex: req.query.text_search } });
            return res.render('admanagerhome.hbs', { folders, files, link: "/admanagerhome", ID: "/register", Content: "Register a User",styling: "background:transparent; border: none !important;" });
        }
        else if (user.role == "Manager") {
            const files = await Files.find({ name: { $regex: req.query.text_search } });
            const folders = await Folders.find({ name: { $regex: req.query.text_search } });
            return res.render('admanagerhome.hbs', { link: "/admanagerhome", design: "trap", folders, files,styling: "background:transparent; border: none !important;" })
        }
        else if(user.role == "Employee"){
            const files = await Files.find({ name: { $regex: req.query.text_search }, access:"Unrestricted" });
            const folders = await Folders.find({ name: { $regex: req.query.text_search }, access:"Unrestricted" });

            return res.render('userhome.hbs',{link:"/userhome", folders, files, styling: "background:transparent; border: none !important;" });
        }
    });
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
    Account.updateOne({ username: req.query.text_search }, { role: req.body.roles }, (error, success) => {
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
app.get('/deleteManyResult', async(req,res)=>{
    if(directory == ""){
        res.redirect('/admanagerhome');
    }
    else{
        const folders = await Folders.find({parent:folID});
        const files = await Files.find({parent:folID});
        Account.findOne({username:req.session.name}, (err, user)=>{
            if(user){
                if(user.role == 'Administrator'){
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", ID: "/register", Content:"Register a User", func:"backFolder()", contents:"<"})
                }
                else{
                    res.render('admanagerhome.hbs', {folders:folders, files:files, path:directory, link: "/admanagerhome", design:"trap", func:"backFolder()", contents:"<"})
                }
            }
        })
    }
})

app.get('/deleteMany', async (req, res) => {
    arrSelected = req.query.arrDelete;
    for (let i = 0; i < arrSelected.length; i++) {
        console.log(arrSelected[i]);

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

        Folders.deleteOne({ _id: arrSelected[i] }, (err, ans2) => {
            if (ans2) {
                console.log(ans2);
            }
        })
    }
})

app.get('/getMove', (req, res)=>{
    IDselected = req.query.arrFilter;
    allID = [];
   
})
app.get('/getMultMove', (req, res)=>{
    IDmultMove = req.query.arrFilter;
    allID = req.query.arrNotFilter;
    IDselected = "";
    
   
})
app.get('/filterMany', async(req, res)=>{
    IDselected = "";
    if(directory == ""){
        const folders1 = await Folders.find({_id:{$in:allID}, parent:""});
        const folders = await Folders.find({parent:""});
        const files = await Files.find({parent:""});
        Account.findOne({username: req.session.name}, (err, user)=>{
            if(user.role == "Administrator"){
                res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1,movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,styling: "background:transparent; border: none !important;"});
            }
            else if(user.role == "Manager"){
                
                res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,styling: "background:transparent; border: none !important;" })
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
                res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1, movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,func:"backFolder()", contents:"<"});
            }
            else if(user.role == "Manager"){
                
                res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,func:"backFolder()", contents:"<" })
            }
        })
    }
})
app.get('/filterSelected', async(req, res)=>{
        const folders1 = await Folders.find({_id:{$ne:IDselected}, parent:""});
        if(directory == ""){
            const folders = await Folders.find({parent:""});
            const files = await Files.find({parent:""});
            Account.findOne({username: req.session.name}, (err, user)=>{
                if(user.role == "Administrator"){
                    res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1,movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,styling: "background:transparent; border: none !important;"});
                }
                else if(user.role == "Manager"){
                    
                    res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,styling: "background:transparent; border: none !important;" })
                }
            })
        }
        else{
            const folders = await Folders.find({parent:folID});
            const files = await Files.find({parent:folID});
            Account.findOne({username: req.session.name}, (err, user)=>{
                if(user.role == "Administrator"){
                    res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",movFolder: folders1, movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,func:"backFolder()", contents:"<"});
                }
                else if(user.role == "Manager"){
                    
                    res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files, movFolder:folders1,movemodal:"visibility:visible", blockermodal:"display:flex",path:directory,func:"backFolder()", contents:"<" })
                }
            })
        }
})
app.get('/moveAction', async(req, res)=>{
    if(IDselected != ""){
        Account.findOne({username:req.session.name}, (err, user)=>{
            if(folIDmove == ""){
                console.log("START");
                Folders.findOne({_id:IDselected}, async(err, tomove)=>{
                    if(tomove){
                        tomove.parent = "";
                        tomove.save((err, updated)=>{});
                        directory1 = "";
                        folIDmove = "";
                        folmove = "";
                        if(directory == ""){
                            res.redirect('/admanagerhome');
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == "Administrator"){
                                res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User", contents:"<",path:directory,func:"backFolder()"});
                            }
                            else if(user.role == "Manager"){
                                
                                res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()", contents:"<",path:directory})
                            }
                        }
                    }
                        
                })
                Files.findOne({_id:IDselected}, async(err, tomove)=>{
                    if(tomove){
                        tomove.parent = "";
                        tomove.save((err, updated)=>{});
                        directory1 = "";
                        folIDmove = "";
                        folmove = "";
                       if(directory == ""){
                            res.redirect('/admanagerhome');
                        }
                        else{
                            const folders = await Folders.find({parent:folID});
                            const files = await Files.find({parent:folID});
                            if(user.role == "Administrator"){
                                res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()", contents:"<",path:directory});
                            }
                            else if(user.role == "Manager"){
                                
                                res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()", contents:"<",path:directory })
                            }
                        }
                    }  
                })
            }
            else{
                Folders.findOne({_id:folIDmove}, (err, newparentfol)=>{
                    Folders.findOne({_id:IDselected}, async(err, tomove)=>{
                        if(tomove){
                            tomove.parent = newparentfol._id;
                            tomove.save((err, updated)=>{});
                            directory1 = "";
                            folIDmove = "";
                            folmove = "";
                            if(directory == ""){
                                res.redirect('/admanagerhome');
                            }
                            else{
                                const folders = await Folders.find({parent:folID});
                                const files = await Files.find({parent:folID});
                                if(user.role == "Administrator"){
                                    res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()", contents:"<",path:directory});
                                }
                                else if(user.role == "Manager"){
                                    
                                    res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()", contents:"<",path:directory })
                                }
                            }
                        }
                       
                    })
                    Files.findOne({_id:IDselected}, async(err,tomove)=>{
                        if(tomove){
                            tomove.parent = newparentfol._id;
                            tomove.save((err, updated)=>{});
                            directory1 = "";
                            folIDmove = "";
                            folmove = "";
                            if(directory == ""){
                                res.redirect('/admanagerhome');
                            }
                            else{
                                const folders = await Folders.find({parent:folID});
                                const files = await Files.find({parent:folID});
                                if(user.role == "Administrator"){
                                    res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User",func:"backFolder()", contents:"<",path:directory});
                                }
                                else if(user.role == "Manager"){
                                    
                                    res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()", contents:"<",path:directory })
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
                if(folIDmove == ""){
                    for(let k = 0; k < IDmultMove.length; k++){
                        console.log(IDmultMove[k]);
                        
                        Folders.findById(IDmultMove[k], (err, tomove)=>{
                            if(tomove){
                                tomove.parent = "";
                                tomove.save((err, updated)=>{});
                            }
                            
                        })
                        Files.findById(IDmultMove[k], (err, tomove)=>{
                        
                            if(tomove){
                                tomove.parent = "";
                                tomove.save((err, updated)=>{});
                            }  
                        })
                    }
                  
                    
                }
                else{
                    for(let k = 0; k < IDmultMove.length; k++){
                        console.log(IDmultMove[k]);
                        Folders.findOne({_id:folIDmove}, (err, newparentfol)=>{
                            //Folders.findOne({_id: IDmultMove[k]}, (err, tomove)=>{
                            Folders.findById(IDmultMove[k], (err, tomove)=>{
                                if(tomove){
                                    console.log("FOUNDFOUNDFOUND");
                                    tomove.parent = newparentfol._id;
                                    tomove.save((err, updated)=>{});
                                   
                                }
                            })
                            Files.findById(IDmultMove[k], (err, tomove)=>{
                                if(tomove){
                                    console.log("FOUNDFOUNDFOUND");
                                    tomove.parent = newparentfol._id;
                                    tomove.save((err, updated)=>{});
                                }
                            })
                        })
                    }
                    
                }
                directory1 = "";
                folIDmove = "";
                folmove = "";
                await new Promise(resolve => setTimeout(resolve, 1000));
                if(directory == ""){
                    res.redirect('/admanagerhome');
                }
                else{
                    const folders = await Folders.find({parent:folID});
                    const files = await Files.find({parent:folID});
                    if(user.role == "Administrator"){
                        res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "/register", Content:"Register a User", contents:"<",path:directory,func:"backFolder()"});
                    }
                    else if(user.role == "Manager"){
                        
                        res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"trap", folders, files,func:"backFolder()", contents:"<",path:directory})
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
