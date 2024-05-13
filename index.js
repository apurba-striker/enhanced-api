import express from "express";
import bodyParser from "body-parser";
import connect from "./Database/db.js";
import bcrypt from 'bcrypt';
import user from "./Models/User.js";
import account from "./Models/Account.js";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import dotenv from "dotenv";
import mongoose from "mongoose";

const app = express();
const port = 3000;
const saltRounds = 10;

dotenv.config();


app.use(bodyParser.json());
app.use(session({
    secret : "Darkzel45123",
    resave : false,
    saveUninitialized : true,
}))

app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", 
    passport.authenticate('google', {scope : ['email','profile'] })
)

app.get("/auth/google/dashboard", passport.authenticate("google" , {
    successRedirect : "/dashboard",
    failureRedirect : "#######" // any route you wish
}));

app.get("/", (req,res) => {
    res.send("Welcome to Home page");
})

app.get("/dashboard", (req,res) => {
    res.send("Welcome to dash board");
})


app.post("/register", async (req,res) => {
    const {name, email, phone, password, user_type} = req.body;

    try{
        const existing = await user.findOne({email : email});
        if(existing){
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password ,saltRounds);
        const newUser = new user({
            name : name,
            email : email,
            phone : phone,
            password : hashedPassword,
            user_type : user_type
        })
    
        await newUser.save();

        const newAccount = new account({
            account_id : newUser.user_id,
            name : name,
            email : email,
            phone : phone,
            password : hashedPassword
        })

        await newAccount.save();
        res.sendStatus(201);

        // res.status(201).render("#######")    // change as per your name of the page
    }catch(error){
        console.error("Error registering the user:", error);
        res.status(500).send("Error registering the user");
    }
})

app.post("/login", async (req,res) => {
    const {email, password} = req.body;

    try{
        const existing = await user.findOne({email : email});
        
        if(!existing){
            return res.status(400).json({ error: 'User not registered' });
        }

        try{
            const match = await bcrypt.compare(password,existing.password);

            if(!match){
                return res.status(401).json({ error: 'Incorrect password' });
            }else{
                req.session.user = existing;
                return res.status(201).json("Successfully logged in" );

                // res.render("##########")   // change as per your name of the page
            }
        }catch(error){
            console.log("Error while comparing", error);
        }

    }catch(error){
        console.log("Error logging in", error);
    }
})


app.get("/myProfile", async (req,res) => {
    if(req.session.user || req.isAuthenticated()){
        const userProfile = req.session.user || req.user ;
        try{
            const accountProfile = await account.findOne({account_id : userProfile.user_id});
            res.status(200).send(JSON.stringify(accountProfile));
        }catch(err){
            res.status(500).send("Error finding the account");
        }

    }else {
        res.status(401).send("Unauthorized"); 
    }
})

app.patch("/edit", async (req,res) => {
    if(req.session.user || req.isAuthenticated()){
        const userProfile = req.session.user || req.user ;

        try{
            const {name, bio, visibility, phone} = req.body;
            const userPro = await user.findOne({email : userProfile.email});
            const accountProfile = await account.findOne({account_id : userProfile.user_id});
            
           
            userPro.name = (name === undefined || name === null) ? userPro.name : name,
            userPro.phone = (phone === undefined || phone === null) ? userPro.phone : phone

            await userPro.save();


            accountProfile.name = (name === undefined || name === null) ? accountProfile.name : name,
            accountProfile.bio = (bio === undefined || bio === null) ? accountProfile.bio : bio,
            accountProfile.visibility = (visibility === undefined || visibility === null) ? accountProfile.visibility : visibility,
            accountProfile.phone = (phone === undefined || phone === null) ? accountProfile.phone : phone

            await accountProfile.save();
            
            res.status(200).send("Account profile updated successfully.");
            
        }catch(err){
            res.status(500).send("Error finding the account");
        }
    }else {
        res.status(401).send("Unauthorized"); 
    }
})

app.get("/user/:id", async (req,res) => {
    if(req.session.user || req.isAuthenticated()){
        const id = req.params;
        const objectId = new mongoose.Types.ObjectId(id);
        try{
            const existing = await user.findOne({user_id : objectId});
            const existingAccount = await account.findOne({account_id : existing.user_id});
            const data = {
                name : existingAccount.name,
                email : existingAccount.email,
                phone : existingAccount.phone,
                bio : existingAccount.bio,
                visibility : existingAccount.visibility
            }
            res.status(200).send(JSON.stringify(data));
            
        }catch(err){
            res.sendStatus(500);
        }
    }else {
        res.status(401).send("Unauthorized"); 
    }
})

app.get("/allProfile", async (req,res) => {
    if(req.session.user || req.isAuthenticated()){
        const userProfile = req.session.user || req.user ;
        try{
            let listOfIds = []
            if(userProfile.user_type === "admin"){
                listOfIds = await account.find({},{name : 1, account_id : 1});
            }else if(userProfile.user_type === "normal"){
                listOfIds = await account.find({visibility : 'public'},{name : 1, account_id : 1});
            }
            res.status(200).send(JSON.stringify(listOfIds));
        }catch(err){
            console.log(err);
            res.sendStatus(500);
        }
    }else {
        res.status(401).send("Unauthorized"); 
    }
})

app.get("/logout", (req, res) => {
    if(req.session.user || req.isAuthenticated()){
        req.logout(function(err) {
            if (err) { return err; }
        });
        res.redirect("/");
    }else{
        res.status(401).send("Unauthorized"); 
    }
});

passport.use("google", new GoogleStrategy({
    clientID:     `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
    callbackURL: "http://localhost:3000/auth/google/dashboard",
  },
  async function(request, accessToken, refreshToken, profile, done) {    
    try{
        const existing = await user.findOne({email : profile.email});

        if(existing){
            return done(null,existing);
        }else{
            const newUser = new user({
                name : profile.displayName,
                email : profile.email,
                password : process.env.GOOGLE_LOGIN_HASH_PASSWORD
            });
    
            await newUser.save();
    
            const newAccount = new account({
                account_id : newUser.user_id,
                name : profile.displayName,
                email : profile.email,
                password : process.env.GOOGLE_LOGIN_HASH_PASSWORD
            });
    
            await newAccount.save();

            return done(null,newUser);
        }

    }catch(error){
        console.error("Error registering the user:", error);
        done(error);
    }

  }
));


passport.serializeUser((user,done) => {
    done(null,user);
})

passport.deserializeUser((user,done) => {
    done(null,user);
})

connect().then(()=>{
    try{ 
        app.listen(port,() => {
            console.log(`Server running on port ${port}`);
        })
    }catch(error){
        console.log("Error while connecting...");
    }
}).catch(error => {
    console.log("Invalid database connection...!");
})

