const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const reqIp = require('request-ip');
const device = require('express-device');
const account_route = require('./controllers/account-route');
const parser = require('ua-parser-js');
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cheks'
});

con.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("database connected");
    }
})

//PORT
const port = process.env.PORT || 9000;

//instantiate exrepss
const app = express();


//middlewares
app.use(reqIp.mw());
app.use(device.capture());

//front-end host
app.get('/', (req, res) => {
    // let query = 'INSERT INTO user(id, name, email, password, user_agent, user_type) '
    // query += `VALUES('1','jon','email','123456','${JSON.stringify(parser(req.headers['user-agent']))}','seller')`;
    // con.query(query, (err, payload) => {
    //     if (err) {
    //         console.log(err)
    //     }

    //     if (payload) {
    //         console.log(payload)
    //     }
    // })
    res.end()
});

app.use('/seller', account_route);


//listening to PORT
app.listen(port, () => {
    console.log("server is listening at port " + port);
});