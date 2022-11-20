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
fol = "";
directory = "";
iter={};
selected="";
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
    const files  = await Files.find({});
    const folders = await Folders.find({});
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user.role == "Administrator"){
            res.render('admanagerhome.hbs', {folders,files, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" });
        }
        else if(user.role == "Manager"){
            
            res.render('admanagerhome.hbs',{link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;", folders, files })
        }
    })
   

})
app.get('/folder', (req,res)=>{
        fol = req.query.folder;
        result = {garbage:"garbage"};
        res.send(result);
    
})
app.get('/loadfolder', async(req, res)=>{
    if(directory == "" || directory == null){
        Folders.findOne({name:fol},async(err, result)=>{
            if(result){
                
            
                directory = "/"+fol;
                arrDirect = directory.split('/');
                //console.log(directory);
                Account.findOne({username:req.session.name}, async(err, user)=>{
                    if(user.role == "Administrator"){
                        console.log("ADMIN");
                        res.render('admanagerhome.hbs', {folders:result.folders, files:result.files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" });
                    }
                    else if(user.role == "Manager"){
                        console.log("Manager");
                        res.render('admanagerhome.hbs', {folders:result.folders, files:result.files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;" });
                    }
                    else{
                        Folders.aggregate([
                            {$unwind : "$folders"},
                            {$match : {"folders.access" : "Unrestricted", name:arrDirect[1]}},
                            {$project : {_id : "$folders._id",
                            name : "$folders.name",
                            access : "$folders.access",}}
                            ], (err, userfol)=>{
                                console.log(userfol)
                                res.render('userhome.hbs', {folders:userfol ,files:result.files, path:directory});
                               
                        })   
                            
                        
                            //const folders = userfol;
                            
                            
                        
                    }
                })
                
            }
        })
    }
    else{
        directory = directory+"/"+fol;
        //console.log(directory);
        arrDirect = directory.split("/");
        
        //console.log(arrDirect);
        var currfolder = "";
        
        for(let i = 1; i < arrDirect.length; i++){
            
            if(i == 1){
                Folders.findOne({name:arrDirect[i]}, (err, result)=>{
                    if(result){
                        currfolder = result.name;
                        //iter = result;
                        iter = JSON.parse(JSON.stringify(result));
                        //console.log(iter.folders.length);
                    }
                    else{
                        
                    }
                });
               
            }
            
            else{
                var found = false;
                //console.log(iter.folders);
                if (iter.folders != undefined){
                    while(!found){
                        for(let k = 0; k < iter.folders.length; k++){
                            if(iter.folders[k].name == fol){
                                console.log(fol);
                               Account.findOne({username:req.session.name}, (err, user)=>{
                                    if(user.role == "Administrator"){
                                        res.render('admanagerhome.hbs', {folders: iter.folders[k].name,files: iter.folders[k].files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" });
                                    }
                                    else if(user.role == "Manager"){
                                        res.render('admanagerhome.hbs', {folders: iter.folders[k].name,files: iter.folders[k].files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;"});
                                    }
                                    else{
                                        res.render('userhome.hbs', {folders:iter.folders[k].name,files: iter.folders[k].files, path:directory})
                                    }
                               })
                                
                                i = arrDirect.length + 1;
                                found = true;
                                break;
                            }
        
                         }
                         if(!found){
                            for (var l = 0; l < iter.folders.length; l++){
                                if(iter.folders[l].name == arrDirect[i]){
                                    iter = iter.folders[l];
                                    break;
                                }
                            }
                           
                         }
                    }
                }
                else{
                    
                    res.render('admanagerhome.hbs', { path:directory});
                }
                
            }
        }

    }
})
app.get('/userhome', async(req, res)=>{
    fol="";
    directory="";
    const files  = await Files.find({});
    const folders = await Folders.find({access:"Unrestricted"});
    res.render('userhome.hbs', {folders,files});
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
   
    const folders  = await Folders.find({});
    const files = await Files.find({});
    if (directory == "" && fol == ""){
        Folders.findOne({name:req.body.foldername}, (err,result)=>{
            if(!result){
                
                    Folders.create({
                        name: req.body.foldername,
                        access: req.body.accesslevel,
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
              
                // else{
                //     var newfolder ={
                //         name: req.body.foldername,
                //     }
                    
                 //}
               
            }
            else{
                Account.findOne({ username: req.session.name }, (err, user) => {
                    if(user.role == 'Administrator' || user.role == 'Manager'){
                        console.log('worked');
                    
                        res.render('admanagerhome.hbs',{error:"Folder name already exists", folders, files});
                    }
                    else{
                        res.render('userhome.hbs', {error:"Folder name already exists", folders, files});
                    }
                });
            }
        })
    }
    else{
        arrDirect = directory.split("/");
        console.log(fol);
        console.log(arrDirect);
        if(arrDirect.length == 2){
            newfolder = {
                name : req.body.foldername,
                access : req.body.accesslevel,
            }
            Folders.findOneAndUpdate({name:arrDirect[1]},{$push:{folders:newfolder}},(err, success)=>{
                if(err){
                    console.log(err)
                }
            })
            Account.findOne({ username: req.session.name }, (err, user) => {
                if(user){
                    Folders.findOne({name:fol}, (err, resultingfolder)=>{
                        if(resultingfolder){
                            if(user.role == 'Administrator'){
                                console.log('worked');
                                res.render('admanagerhome.hbs', {folders: resultingfolder.folders,files: resultingfolder.files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" });
                            }
                            else if(user.role == "Manager"){
                                res.render('admanagerhome.hbs', {folders: resultingfolder.folders,files: resultingfolder.files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;" });
                            }
                            
                            else{
                                res.render('userhome.hbs', {folders: resultingfolder.folders,files: resultingfolder.files, path:directory});
                            }
                        }
                    })
                   
                }
                
            });
        }
        else{
            for(var i = 1; i < arrDirect.length; i++){
                if(i == 1){
                  
                    Folders.findOne({name:arrDirect[i]}, (err, result)=>{
                        if(result){
                            
                            //iter = result;
                            iter = JSON.parse(JSON.stringify(result));
                            //console.log(iter.folders.length);
                        }
                        else{
                            
                        }
                    });
                       
                  
                }
                //else{
                    var found = false;
                   
                   
                        if(iter.folders != undefined){
                            while(!found){
                                for(let k = 0; k < iter.folders.length; k++){
                                    if(iter.folders[k].name == fol){
                                        console.log(iter.folders[k]._id)
                                        
                                        var newfolder = {
                                            name: req.body.foldername,
                                        }
                                        console.log(iter.folders[k].name);
                                        
                                        Folders.findOne({"iter.folders[k]._id":iter.folders[k]._id}, (err, ans)=>{
                                            if(ans){
                                                iter.folders[k].folders.push(newfolder);
                                                //iter.folders[k].folders.save((err, newfol)=>{console.log()})
                                            }
                                            
                                        })
                                        
                                        
                                        // Folders.findOneAndUpdate({"iter.folders[k]._id": iter.folders[k]._id, "iter.folders[k].name" : iter.folders[k].name},{$push:{ "iter.folders[k].folders" : newfolder}}, (err)=>{
                                        //     if(err){
                                        //         console.log(err);
                                        //     }
                                        //     else{
                                        //         console.log(iter.folders[k].folders[0])
                                        //         console.log("pushed")
                                        //     }
                                        // });
                                        console.log("AFTER");
                                        i = arrDirect.length + 1;
                                        found = true;
                                        Account.findOne({ username: req.session.name }, (err, user) => {
                                            if(user){
                                               
                                                        if(user.role == 'Administrator'){
                                                            console.log('worked');
                                                            res.render('admanagerhome.hbs', {folders: iter.folders[k].folders,files: iter.folders[k].files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" });
                                                        }
                                                        else if(user.role == "Manager"){
                                                            res.render('admanagerhome.hbs', {folders: iter.folders[k].folders,files: iter.folders[k].files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;" });
                                                        }
                                                        
                                                        else{
                                                            res.render('userhome.hbs', {folders: iter.folders[k].folders,files: iter.folders[k].files, path:directory});
                                                        }
                                                    
                                                }
                                               
                                            
                                            
                                        });
                                        break;
                                    }
                
                                 }
                                 if(!found){
                                    for (var l = 0; l < iter.folders.length; l++){
                                        if(iter.folders[l].name == arrDirect[i]){
                                            iter = iter.folders[l];
                                            break;
                                        }
                                    }
                                   
                                 }
                            }
                        
                        }
                    
                //}
            }
        }
        
    }
    
});

app.post('/uploadfile',  async(req, res)=> {
    const files = req.files.file
    arrDirect = directory.split("/");
        if (Array.isArray(files)) {
            Account.findOne({ username: req.session.name }, async(err, user) => {
                files.forEach(file => {
                   
                        file.mv(path.resolve(__dirname, 'file', file.name), async(error) => {
                           
                            if(directory == ""){
                                Files.create({ name: file.name, access: user.role }, (error, post) => { })
                            }
                            else{
                                Folders.findOneAndUpdate({name:arrDirect[1]}, {$push:{files:{name:file.name,access:user.role}}}, async(err, ans)=>{

                                })
                            }
                        })
                })
            })
        }
        else {
            Account.findOne({ username: req.session.name }, async(err, user) => {
                
                    files.mv(path.resolve(__dirname, 'file', files.name), async(error) => {
                        if(directory ==""){
                            Files.create({ name: files.name, access: user.role }, (error, post) => { })
                        }
                        else{
                            let filename = files.name;
                            Folders.findOneAndUpdate({name:arrDirect[1]}, {$push:{files:{name:filename,access:user.role}}}, async(err, ans)=>{
                                
                            })
                        }
                    });
            })
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // for some reason it takes time for the file to be displayed
    if(directory ==""){
        
        Account.findOne({username:req.session.name}, (err, user)=>{
            
            if(user.role == "Administrator" || user.role == "Manager"){
                res.redirect('/admanagerhome');
            }
            else{
                res.redirect('/userhome');
            }

        })
    
    }
    else{
        
        console.log("DIRECTORY NOT EMPTY");
        arrDirect = directory.split('/');
        Account.findOne({ username: req.session.name }, (err, user) => {
            if(user){
                console.log("ACCOUNT FUNCTION")
                Folders.findOne({name:arrDirect[arrDirect.length - 1]}, (err, resultingfolder)=>{
                    console.log(resultingfolder);
                    if(resultingfolder){
                        if(user.role == 'Administrator'){
                           console.log("ADMIN");
                            res.render('admanagerhome.hbs', {folders: resultingfolder.folders,files: resultingfolder.files, path:directory, link: "/admanagerhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" });
                        }
                        else if(user.role == "Manager"){
                            res.render('admanagerhome.hbs', {folders: resultingfolder.folders,files: resultingfolder.files, path:directory, link: "/admanagerhome", design:"background:transparent; border: none !important;cursor: context-menu;"});
                        }
                        else{
                            res.render('userhome.hbs', {folders: resultingfolder.folders,files: resultingfolder.files, path:directory});
                        }
                    }
                })
               
            }
            
        });
    }
    
  
});

app.get('/delete-folder', (req, res) => {
    Account.findOne({ username: req.session.name }, (err, user) => {
        Folders.deleteOne({ name: req.query.name }, (error) => {
            if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
            else { res.redirect('/userhome'); }
        })
    });
});

app.get('/delete-file', (req, res) => {
    Account.findOne({ username: req.session.name }, (err, user) => {
        Files.deleteOne({ name: req.query.name }, (error) => {
            if (user.role == 'Administrator' || user.role == "Manager") { res.redirect('/admanagerhome'); }
            else { res.redirect('/userhome'); }
        })
    });
});
app.get('/select', (req, res)=>{
    selected = req.query.selected;
    console.log(selected);
})
app.post('/rename-folder', (req, res)=>{
   
    Account.findOne({ username: req.session.name }, (err, user) => {
        Folders.findOne({name:selected}, (err, folder1)=>{
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
    })
})
app.post('/rename-file', (req, res)=>{
    Account.findOne({ username: req.session.name }, (err, user) => {
        Files.findOne({name:selected}, (err, file1)=>{
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
    })
})

app.listen(3000, (err)=>{
    console.log("Server listening on Port 3000")
});
