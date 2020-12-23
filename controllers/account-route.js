const router = require("express").Router();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const reqIp = require('request-ip');
const geoip = require('geoip-lite');
const parser = require('ua-parser-js');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator')

//middle-ware
router.use(bodyParser.json());
router.use(reqIp.mw());
router.use('/signup', function (req, res, next) {
    if (isEmail(req.body.email)) {
        let query = `SELECT email FROM user WHERE email='${req.body.email}'`;

        conn.query(query, (err, payload) => {
            if (err) console.log(err);
            else {
                if (payload.length > 0) {
                    console.log(false);
                    res.json({ error: "user already exists with the email" })
                } else {
                    next();
                }
            }
        });

    } else {
        console.log(false);
        res.json({ error: 'this is not a valid enail address' });
    }
});


//connect to database
const conn = mysql.createConnection({
    database: 'cheks',
    user: 'root',
    password: '',
    host: 'localhost'
});

conn.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('database connected');
    }
});

//jwt options                                                                                                                                                                                                           
const JWT_OPT = {
    expiresIn: 60 * 60 * 24 * 10
}


router.get('/login', async function (req, res) {
    if (isEmail(req.body.email)) {
        let query = `SELECT password FROM user WHERE email='${req.body.email}'`;

        conn.query(query, async (err, payload) => {
            if (err) console.log(err);
            else {
                if (!payload.length > 0) {
                    console.log(false);
                    res.json({ error: "user does not exist", state: false })
                } else {
                    try {
                        let password = req.body.password;


                        //parse user agent to json
                        let deviceInfo = parser(req.headers['user-agent']);

                        //collect user-agent and ip;
                        let user_agent = {
                            ip: req.ip,
                            agent: deviceInfo.device
                        }

                        /**
                         * ** check if user agent equal user agent in database
                         * ** if not equal, use an npm package to mail the user about it
                         * ** replace user agent in database database of user
                         */

                        let user = await login(password, payload[0].password, req.body.email);
                        let token = createJWT(user._id);
                        res.cookie(process.env.LOGIN_COOKIE || 'jwt', token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });

                        /**
                         * ** query full profile from db
                         */

                        res.status(200).json({ email: user.email }); //will send more fields
                    }
                    catch (err) {
                        res.status(404).json({ error: "invalid password", state: false });
                    }
                }
            }
        });

    } else {
        res.json({ error: 'this is not a valid enail address', state: false });
    }
});


//SIGN UP Routes
router.post('/signup', async (req, res) => {
    let { email, userName, password, phone, id } = req.body;

    let deviceInfo = parser(req.headers['user-agent']);

    //collect user agent
    let user_agent = {
        ip: req.ip,
        agent: deviceInfo.device
    }

    try {
        let salt = await bcrypt.genSalt();
        password = await bcrypt.hash(password, salt);

        let query = 'INSERT INTO user(id, name, email, password, user_agent, user_type) '
        query += `VALUES('${id}', '${userName}', '${email}', '${password}', '${JSON.stringify(user_agent)}', 'seller')`

        //store user in datatbase with user-agent;
        conn.query(query, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("user row created");
            }
        });

        let token = createJWT(2);
        res.cookie(process.env.LOGIN_COOKIE || "jwt", token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });
        res.status(201).json({ userName: userName, id: 2, email: email });

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

//login functon
async function login(password, pass2, email) {
    let auth = await bcrypt.compare(password, pass2);
    if (auth) {
        return { email: email, password: password };
    } else {
        throw Error("wrong password");
    }
}

//creating JWT
function createJWT(id) {
    return jwt.sign({ id }, process.env.SECRET || 'checks', JWT_OPT);
}


module.exports = router;