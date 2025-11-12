const express = require("express");
const app = express(); // this runs the backend ?
const port = 3000;
const bcrypt = require("bcrypt");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "supersecretkey";

app.use(express.json());
app.use(cors());
// middleware to parse html form submission;
// application/x-www-form-urlencoded.
app.use(express.urlencoded({ extended: true}));
app.use(express.json());

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
// using sent req
// new login gateway to support refresh refresh_tokens
app.post('/login', async(req, res)) =>{
    if (!(req.body.username && req.body.password))
    {
        return res.status(401).json({
            error: 'invalid request body'
        });
    }
    const {username, password} = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1;", [email]);
    if (result.rows.length != 0)
    {
        const match = await.bcrypt(password, result.rows[0].password);
        if (match)
        {
            console.log(`user found !`);
            return res.status(200).json({
                id: result.rows[0].id,
                email: result.rows[0].email
            });
        }
    }
    else
    {
        console.log('user not found');
        return res.status(401).json({
            error: 'user not found'
        });
    }
});
app.post('/login', async(req, res) => {
    if (!(req.body.username && req.body.password))
    {
        retu
    }
})
app.post('/login', async(req, res) =>{
    if (!(req.body.username && req.body.password))
    {
        return res.status(401).json({
            error: 'invalid request body'
        });
    }
    const {username, password} = req.body;
    // each login ?
    // check validty of login
    const result = await pool.query('SELECT * FROM users WHERE username = $1;',[username]);
    if (result.rows.length == 0)
    {
        return res.status(401).json({
            error: 'user not found'
        });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match)
    {
        const accessToken = await jwt.sign({
            id: user.id, role:user.role},
                SECRET_KEY, {expiresIn:'1h'});
        const refreshToken = await jwt.sign({
            id: user.id, role: user.role},
                SECRET_KEY, {expiresIn : '7d'});
        await pool.query(`UPDATE refresh_tokens
            SET token = $1, expires_at = NOW() + interval '7 days' WHERE user_id = $2;`,[refreshToken, user.id]);
        return res.json({
            message: 'login successful',
            accessToken: accessToken,
            refreshToken: refreshToken
        });
    }
    else
    {
        return res.status(401).json({
            error: 'incorrect password'
        });
    }
});

async function refreshAccessToken(refreshToken)
{
    // refresh  token and call back schduleTokenRefresh
    const result = await fetch('http://localhost:3000/refresh',{
        method: GET,
        headers:{
            'content-type': 'application/json'
        },
        authorization: `Bearer ${refreshToken}`
    });
    const res = await result.json();
    if (res.status(401).error)
    {
        console.err('failed to refsh token');
        return null;
    }
    // how doe updating work ? : by express res. or in the client side.
    return res.body.refreshToken;
}

function schduleTokenRefresh(accessToken, refreshToken)
{
    // extract the expiry time JWT:header.payload.signature
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = payload.exp * 1000;
    const now = Date.now();
    // 1 min before expiry
    const timeout = expiresAt - now - 60 * 1000;
    if (timeout > 0)
    {
        setTimeout(async () => {
            await refreshAccessToken(refreshToken)  
        }, timeout);
    }
}


// adding an api gateway.
app.post("/register", async(req, res) => {
    console.log('new register request');
    const username = req.body.username;
    const password = req.body.password;
    const role = req.body.role;
    // new update should trhow an error if usernamel already in users
    const result = await pool.query("SELECT * FROM users WHERE username = $1;", [username]);
    if (result.rows.length > 0)
    {
        res.status(401).json({
            message: "username already in use"
        });
    }
    else
    {
        try
        {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query("INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *;", [username, hashedPassword, role]);
            res.json({
                message: "user registered successfuly",
                user: result.rows[0] // ?
            });
        }
        catch (err)
        {
            console.error("query error", err);
            res.status(500).json({
                error: "query error"
            });
        }
    }
});

// check the validity of refresh token then issue a new acces token.
app.post('/refresh', authenticaterefreshToken, async (req, res) => {
     // here  the refreshtoken is valid
    // well i guess we have to fetch data using  refreshToke.
    const authHeader = req.headers['refreshtoken'];
    const refreshtoken = authHeader && authHeader.split(" ")[1];
    const result = await pool.query(`SELECT * FROM refresh_tokens WHERE token = $1;`, [refreshtoken]);
    const user_id = result.rows[0].user_id;
    const users_result = await pool.query(`SELECT * FROM users WHERE id = $1;`, [user_id]);
    const accessToken = await jwt.sign({
        id: users_result.id, role: users_result.role}, SECRET_KEY, {expiresIn: '1h'});
    return res.json({
        accessToken: accessToken,
        message: 'new accessToken has been issued'
    });
});
//jwt.verify(token, secretOrPublicKey, [options, callback])

async function authenticaterefreshToken(req, res, next)
{
    // JWT is ALWsy sent by the clien in headers 
    const authHeader = req.headers['refreshtoken'];
    //console.log(authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    console.log(`token is: ${token}`);
    if (!token)
    {
        return res.status(401).json({
            error: 'access denied, token missing'
        });
    }
    const result = await pool.query(`SELECT * FROM refresh_tokens WHERE token = $1;`,[token]);
    if (result.rows.length == 0)
    {
        return res.status(401).json({
            error: 'No such refreshToken'
        });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err){
            return res.status(401).json({
                error: 'Invalid token'
            });
        }
        console.log('valid refreshtoken');
        req.user = user;
        next();
    });
}

// middleware to verify t;
function authenticateToken(req, res, next)
{
    // first we get the token sent by the client
    const authHeader = req.headers["authorization"];
    // a mask to extract it
    const token = authHeader && authHeader.split(" ")[1];
    if (!token)
    {
        return res.status(401).json({
            error: "Acces denied, token missing"});
    }
    //check if token exists in database 
    jwt.verify(token, SECRET_KEY, (err, user) => {
        // if verify fails err is set else user is filled.
        if (err) return res.status(403).json({
            error: "Invalid token"
        });
        // user is token data decoded.
        req.user = user;
        next();
    });
}

//  this is how it works
function authenticateRole(role) {
    return (req, res, next) => { // prarams provided by express
      if (req.user.role !== role) {
         console.log(`forbidden user role is ${req.user.role}`);
        return res.status(403).json({ error: "Forbidden" });
      }
      next();
    };
}

// protect routes with the middleware
app.get("/profile", authenticateToken, (req, res) => {
    res.json({
        message: "hello, you are a valid user and already logged in",
        user: req.user
    });
});

app.get('/admin', authenticateToken,authenticateRole('admin'), (req, res) => {
    res.json({
        message: 'welcome mr admin',
        user: req.user
    }); 
})

app.listen(port, () =>{
    console.log('server is listening on port ${port}');
});

app.listen(port, () => {
    
})
