const express = require("express");
const app = express();

const port = 3000;
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "supersecretkey";
//session middleware
const session = require("express-session");
app.use(express.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));
// middleware to parse html form submission;
// application/x-www-form-urlencoded.
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true,
        secure: false,
        sameSite: 'none'}
}));

const { Pool } = require("pg");
const pool = new Pool({
    user: "hichamessaquy",
    host: "localhost",
    database: "postgres",
    port: 5432
});
// root : method.

app.get("/", (req, res) => {
    res.json({message: "Backend is running!"});
});
// login in this application should store session id, emaill
// adding an api gateway
app.post("/login", async(req, res) => {
    console.log('%clogin attempt');
    console.log(`email value ${req.body.email} and password: ${req.body.password}`);
    const password = req.body.password;
    const email = req.body.email;
    const result = await pool.query('SELECT * FROM users WHERE email = $1;', [email]); 
    if (result.rows.length > 0)
    {
        const match = await bcrypt.compare(password, result.rows[0].password);
        if (match)
        {
            const data = {id: result.rows[0].id, email:result.rows[0].email};
            req.session.user = {id: result.rows[0].id, email: result.rows[0].email};
            req.session.save(err => {
                if (err) {
                  return res.status(500).json({ error: "Failed to save session" });
                }
                res.json({ message: "user logged in successfully!" });
              });
        }
        else
        {
            console.log('wrong password');
            res.status(401).json({
                error: 'incorrect password'
            });
        }
    }
    else
    {
        res.status(401).json({
            error: 'email not found'
        });
    }
});

app.post("/register", async(req, res) => {
    console.log('new register request');
    console.log(`email value ${req.body.email} and password: ${req.body.password}`);
    const email = req.body.email;
    const password = req.body.password;
    // new update should trhow an error if emaill already in users
    const result = await pool.query("SELECT * FROM users WHERE email = $1;", [email]);
    if (result.rows.length > 0)
    {
        res.status(401).json({
            message: "Email already in use"
        });
    }
    else
    {
        try
        {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *;", [email, hashedPassword]);
            console.log('%cA new user has been added', 'color: green');
            res.json({
                message: "user registered successfuly",
                user: result.rows[0]
            });
        }
        catch (err)
        {
            console.error("%cquery error: ", 'color: red'); 
            res.status(500).json({
                error: "query error"
            });
        }
    }
});

function authenticateSession(req, res, next){
    if (!req.session.user){
        return res.status(401).json({
            error: 'not logged in'
        });
    }
    next();
}

app.get('/profile', authenticateSession, (req, res,) =>{
     res.json({
        message: `welcome back  ${req.session.user.email}`,
        user: req.session.user
     });
});

app.listen(port, () => {
    console.log('server is listening on port ${port}');
});
