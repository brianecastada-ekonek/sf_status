const express = require('express');
const cors = require("cors");
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const https = require("https");
const fs = require("fs");

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json({limit: '100mb'}));

app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'keys, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.use(cors());

app.use((req, res, next) => {
    // -----------------------------------------------------------------------
    // Authentication Middleware

    // Skip authentication for login endpoint
    if (req.path === '/E2M-NODE-API/login') {
        return next();
    }

    // parse login and password from headers
    const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
    const [user, password] = Buffer.from(b64auth, 'base64').toString().split(':')

    console.log('Auth attempt:', { user, password, expectedUser: process.env.AUTHUSER, expectedPass: process.env.AUTHPASS });

    // Verify login and password are set and correct
    if (user && password && user === process.env.AUTHUSER && password === process.env.AUTHPASS) {
        // Access granted...
        return next()
    }

    // Access denied...
    res.set('WWW-Authenticate', 'Basic realm="401"');
    res.status(401).send('Authentication required.');
    // -----------------------------------------------------------------------
});

app.get('/E2M-NODE-API', (req, res) => {
    res.send(`
        <body style="margin: 0px; padding: 0px;">
            <div style="margin: 0px; padding: 0px; height: 100vh; display: flex; justify-content: center; align-items: center; text-align: center; font-size: 100px; background-color: #6b9cf5;">
                <b style="color: #fff;">E2M NODE EXPRESS API</b>
            </div>
        </body>
    `);
});

app.use("/E2M-NODE-API", require("./routes/api"));

app.listen(port, () => {
    console.log(`[server]: Server is running at ${process.env.HOST}:${port}`);
});

// https.createServer({
// 	key: fs.readFileSync("key.pem"),
// 	cert: fs.readFileSync("cert.pem"),
// }, app)
// .listen(port, () => console.log(`Server is running on port ${process.env.HOST}:${port}`));
