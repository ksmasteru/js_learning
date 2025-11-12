const express = require("express");
const app = express();

const port = 3000;
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "supersecretkey";

const session = require("express-session");
app.use(express.json());
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}));

app.use(express.urlencoded({extended : true}));

app.use(session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
    coookie : {
        httpOnly: true,
        secure: false,
        sameSite: 'none'}
}));

const { Pool } = require("pg");

const pool = new Pool({
    user: "hicham",
    host: "localhost",
    database: "postgres",
    port: 5432
});

app.get("/", (req, res) =>{
    res.json({message: "Backend is running!"});
});

app.post("/login", async(req, res) =>{
    // user  send  email and password in the body.
    const email = req.body.email;
    const password = req.body.password;
    const result = await pool.query('SELECT * FROM users WHERE email = $1;'[email]);
    if (result.rows.length > 0)
    {
        // tthe password in the table is hashed.
        const match = await bcrypt.compare(password, result.rows[0].password);
        if (match)
        {
            const data ={id: result.rows[0].id,
                            email:result.rows[0].email};
            req..sessionuser = {id: result,rows[]}
        }
        
    }
})
