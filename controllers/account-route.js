const router = require("express").Router();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const reqIp = require('request-ip');
const geoip = require('geoip-lite');
const parser = require('ua-parser-js');


//middle-ware
router.use(bodyParser.json());
router.use(reqIp.mw());
//router.use(bodyParser.urlencoded({ extended: true }));

//jwt options                                                                                                                                                                                                           
const JWT_OPT = {
    expiresIn: 60 * 60 * 24 * 10
}



//SIGN UP Routes
router.post('/signup', (req, res) => {
    let { email, userName, password, phone } = req.body;

    //collect user agent
    let user_agent = {
        ip: req.ip,
        agent: req.headers["user-agent"]
    }


    try {
        let salt = await bcrypt.genSalt();
        password = await bcrypt.hash(password, salt);

        //store user in datatbase with user-agent
        let user = {};

        let token = createJWT(user._id);
        res.cookie(process.env.LOGIN_COOKIE || "jwt", token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });
        res.status(201).json({ user_name: user.userName, id: user._id, email: user.email });

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});



// LOGIN Routes for checks
router.get('login', (req, res) => {
    //collect user-agent and ip
    let user_agent = {
        ip: req.ip,
        agent: req.headers["user-agent"]
    }
    
    let name = req.body.user_name;
    let password = req.body.password;

    try {
        let user = await login(name, password, user_agent);
        let token = createJWT(user._id);
        res.cookie(process.env.LOGIN_COOKIE || 'jwt', token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });
        res.status(200).json({ user_name: user.userName, id: user._id, email: user.email });
    }
    catch (err) {
        res.status(404).json({ err: err });
    }
});





//login functon
async function login(name, password, user_agent) {

    //query username frodm database
    let user = {};

    if (user) {
        let auth = await bcrypt.compare(password, user.password);
        if (auth) {

            /***
             * *** compare user agent and Ip from data base,
             * *** if they dont match, send mail to the user email and then replace the user-agent in the data base with the new one 
             */

            return user;
        } else {
            throw Error("wrong password")
        }
    } else {
        throw Error("No user found")
    }
}

//creating JWT
function createJWT(id) {
    return jwt.sign({ id }, process.env.SECRET || 'checks', JWT_OPT);
}
