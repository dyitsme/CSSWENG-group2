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
            res.render('profile.hbs',{link:"/adminhome",profilename: req.session.name, role:user.role, C:"regisbutton",act:"redirectRegister()", content:"Register an Account"});
        }
        else{
            res.render('profile.hbs',{link:"/userhome",profilename: req.session.name, role:user.role, design:"background:transparent; border: none !important;"});
        }
        
    })
})

app.get('/adminhome', async(req, res)=>{
    fol="";
    directory="";
    const files  = await Files.find({});
    const folders = await Folders.find({});
    res.render('adminhome.hbs', {folders,files});

})
app.get('/folder', (req,res)=>{
    if(req.query.folder != "" && req.query.folder != null){
        Folders.findOne({name:req.query.folder}, (err, result)=>{
            if(result){
               fol = result.name;
               res.send(result);
            }
            else{
                
            }
        });
    }
})
app.get('/loadfolder', (req, res)=>{
    Folders.findOne({name:fol},(err, result)=>{
        if(result){
            console.log(fol);
            directory = "/"+fol;
            Account.findOne({name:req.session.name}, (err, user)=>{
                if(user.role == "Administrator"){
                    res.render('adminhome.hbs', {folders: result.folders, path:directory});
                }
                else{
                    res.render('userhome.hbs', {folders: result.folders, path:directory});
                }
            })
            
        }
    })
})
app.get('/userhome', async(req, res)=>{
    fol="";
    directory="";
    const files  = await Files.find({});
    const folders = await Folders.find({});
    res.render('adminhome.hbs', {folders,files});
})
app.get('/register', (req, res)=>{
    res.render('register.hbs');
})
app.get('/changepassword', (req, res) => {
   
   
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user){
            
            if(user.role == "Administrator"){
                res.render('changepassword.hbs',{link: "/adminhome", ID: "registeruser", act:"redirectRegister()", Content:"Register a User" })
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
                            res.redirect("/adminhome");
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
                    res.redirect('/adminhome')
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
        res.redirect('/adminhome');
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
                                if(user.role == "Administrator"){
                                    res.redirect('/adminhome')
                                }
                                else{
                                    res.redirect('/userhome') 
                                }
                                
                                }
                            else {
                                if(user.role == "Administrator"){
                                    res.render('changepassword.hbs', {link:'/adminhome', error: "Password Change Error!",ID: "registeruser", act:"redirectRegister()", Content:"Register a User" }) 
                                }
                                else{
                                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                                }
                                
                                }
                        })
                    }
                    else {  

                        if(user.role == "Administrator"){
                        res.render('changepassword.hbs', {link:'/adminhome', error: "Password Change Error!",ID: "registeruser", act:"redirectRegister()", Content:"Register a User" }) 
                        }

                        else{
                            res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!",design:"background:transparent; border: none !important;cursor: context-menu;" }) 
                            } 
                        }
                })
            }
            else { 
                if(user.role == "Administrator"){
                res.render('changepassword.hbs', {link:'/adminhome', error: "Password Change Error!",ID: "registeruser", act:"redirectRegister()", Content:"Register a User" }) 
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
    Folders.findOne({name:req.body.foldername}, (err,result)=>{
        if(!result){
            if(!fol){
                Folders.create({
                    name: req.body.foldername,
                });
                Account.findOne({ username: req.session.name }, (err, user) => {
                    if(user.role == 'Administrator'){
                        console.log('worked');
                        res.redirect('/adminhome');
                    }
                    else{
                        res.redirect('/userhome');
                    }
                });
            }
            else{
                var newfolder ={
                    name: req.body.foldername,
                }
                Folders.findOneAndUpdate({name:fol},{$push:{folders:newfolder}},(err, success)=>{
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
                                    res.render('adminhome.hbs', {folders: resultingfolder.folders, path:directory});
                                }
                                else{
                                    res.render('userhome.hbs', {folders: resultingfolder.folders, path:directory});
                                }
                            }
                        })
                       
                    }
                    
                });
            }
           
        }
        else{
            Account.findOne({ username: req.session.name }, (err, user) => {
                if(user.role == 'Administrator'){
                    console.log('worked');
                
                    res.render('adminhome.hbs',{error:"Folder name already exists", folders, files});
                }
                else{
                    res.render('userhome.hbs', {error:"Folder name already exists", folders, files});
                }
            });
        }
    })
});

app.post('/uploadfile', function (req, res) {
    const files = req.files.file

    if (Array.isArray(files)) {
        Account.findOne({ username: req.session.name }, (err, user) => {
            files.forEach(file => {
                file.mv(path.resolve(__dirname, 'file', file.name), (error) => {
                    Files.create({ name: file.name, access: user.role }, (error, post) => { })
                })
            })
        })
    }
    else {
        Account.findOne({ username: req.session.name }, (err, user) => {
            files.mv(path.resolve(__dirname, 'file', files.name), (error) => {
                Files.create({ name: files.name, access: user.role }, (error, post) => { })
            });
        })
    }

    res.redirect('/adminhome')
});

app.listen(3000, (err)=>{
    console.log("Server listening on Port 3000")
});
