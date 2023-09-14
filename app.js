const express = require('express')
const app = express();
const mongoose = require('mongoose');
const ejsmate = require('ejs-mate')
const methodOverride = require('method-override');
const passport = require('passport')
const LocalStrategy = require('passport-local')
const flash = require('connect-flash');

const User = require('./models/user')
const session = require('express-session');
const e = require('connect-flash');
const sessionConfig = {
    secret : 'x',
    resave : false,
    saveUninitialized : true,
    cookie : {
      maxAge : 1000 * 60 * 60 * 24 * 7 
    }
  }
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(session(sessionConfig))
app.use(flash());
app.engine('ejs',ejsmate); 
app.set('view engine','ejs');
app.listen('3000' , ()=>console.log('listening on port 3000'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




mongoose.set('strictQuery', true);
mongoose.connect('mongodb://0.0.0.0:27017/WaterTracker')
.then(()=>{
    console.log("Mongo connected")
})
.catch(err =>{
    console.log("Error")
})

app.use((req,res,next)=>{
  
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})



app.get('/' ,(req,res)=>{
    res.render('home')
})
app.get('/tracker' ,(req,res)=>{
    res.render('tracker')
})



app.get('/register',(req,res)=>{
    res.render('register')
})
app.post('/register',async (req,res)=>{
    try{
        
        const {email,username,password} =req.body;
        const user = new User({email,username})
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,(err)=>{
            if(err) return next(err)
            req.flash('success','registered and logged in')
            res.redirect('/tracker')
        })
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('/')
    }
    
})

app.get('/login',(req,res)=>{
    res.render('login')
})

app.post('/login',passport.authenticate('local',{failureFlash:true , failureRedirect:'/login'}),(req,res)=>{
    req.flash('success','Logged in')
    
    res.redirect('/tracker')
} )

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      req.flash('success','Logged out')
      
      res.redirect('/')
      
    });
});

app.post('/postdetails',async (req,res)=>{
    const details = req.body
    res.render('stats',{details})
})




