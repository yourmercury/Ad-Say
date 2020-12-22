const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const reqIp = require('request-ip');
const device = require('express-device');

//PORT
const port = process.env.PORT || 9000;

//instantiate exrepss
const app = express();


//middlewares
app.use(reqIp.mw());
app.use(device.capture());

//front-end host
app.get('/', (req, res) => {
    res.end()
})


//listening to PORT
app.listen(port, () => {
    console.log("server is listening at port " + port);
})