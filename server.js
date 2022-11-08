const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const path = require('path');
const hbs = require("hbs");
const fileUpload = require('express-fileupload')
const Account = require('./database/models/Account');
const session = require('express-session')

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

app.get('/adminhome', (req, res)=>{
    res.render('adminhome.hbs');
})
app.get('/userhome', (req, res)=>{
    res.render('userhome.hbs');
})
app.get('/register', (req, res)=>{
    res.render('register.hbs');
})
app.get('/changepassword', (req, res) => {
   
   
    Account.findOne({username: req.session.name}, (err, user)=>{
        if(user){
            
            if(user.role == "Administrator"){
                res.render('changepassword.hbs',{link: "/adminhome"})
            }
            else{
                res.render('changepassword.hbs',{link: "/userhome"})
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
                                    res.render('changepassword.hbs', {link:'/adminhome', error: "Password Change Error!" }) 
                                }
                                else{
                                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!" }) 
                                }
                                
                                }
                        })
                    }
                    else {  

                        if(user.role == "Administrator"){
                        res.render('changepassword.hbs', {link:'/adminhome', error: "Password Change Error!" }) 
                        }

                        else{
                            res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!" }) 
                            } 
                        }
                })
            }
            else { 
                if(user.role == "Administrator"){
                res.render('changepassword.hbs', {link:'/adminhome', error: "Password Change Error!" }) 
                }
                else{
                    res.render('changepassword.hbs', {link:'/userhome', error: "Password Change Error!" }) 
                }
            }
        })
    } catch { res.redirect('/userhome') }
});
app.listen(3000, (err)=>{
    console.log("Server listening on Port 3000")
});
