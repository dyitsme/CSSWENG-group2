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
    adminpass = "abcdef12345";
    Account.findOne({username: adminuser}, async(err, result)=>{
        if(result){

        }
        else{
            try{
                const hashed = await bcrypt.hash(adminpass, 10);
                Account.create({
                    username: adminuser,
                    pass : hashed,
                    role : "Admin"
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
                        res.redirect("/");
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
app.listen(3000, (err)=>{
    console.log("Server listening on Port 3000")
});