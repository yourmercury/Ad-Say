const router = require("express").Router();
const bodyParser = require('body-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const reqIp = require('request-ip');
const geoip = require('geoip-lite');
const parser = require('ua-parser-js');
const jwt = require('jsonwebtoken');
const { isEmail } = require('validator');
const { sequelize, User } = require("../graphql_schema/model/db");
const { v4: uuidv4 } = require('uuid');

/**
 *
 *
 *
 *
 *
 * ******* creating connection pool to MySQL  database
 *
 *
 *
 *
 *
 */

/**
 * ** JWT options
 */

const JWT_OPT = {
    expiresIn: 60 * 60 * 24 * 10
}

/***
 * **** Middle wares
 */

router.use(bodyParser.json());
router.use(reqIp.mw());

/**
 * *** Sign up middle ware
 */

router.use('/signup', async function (req, res, next) {
    if (isEmail(req.body.email)) {
        try {
            let result = await sequelize.query(`SELECT email FROM users WHERE email="${req.body.email}"`, { type: sequelize.QueryTypes.SELECT });

            console.log(result);

            if (result.length > 0) {
                res.json({ error: "user already exists with the email" });
            } else {
                next();
            }

        } catch (err) {
            res.json({ error: "problem connecting to database at the moment" });
        }

    } else {
        res.json({ error: 'this is not a valid enail address' });
    }
});

/**
 *
 *
 *
 *
 *
 * ******* Login Route
 *
 *
 *
 *
 *
 */

router.post('/login', async function (req, res) {
    if (isEmail(req.body.email)) {
        let query = `SELECT * FROM users WHERE email='${req.body.email}'`;

        try {

            let result = await sequelize.query(query, { type: sequelize.QueryTypes.SELECT });

            console.log(result)

            if (!result.length > 0) {
                res.json({ error: "Wrong email or password", state: false });
            } else {
                if (!result[0].acc_verification) {
                    /**
                     * **** Execute nodemailer for account verification
                     */

                    res.json({ error: "vefiy account" });
                } else {

                    let password = req.body.password;
                    let geo = geoip.lookup(req.ip);

                    //parse user agent to json;
                    let deviceInfo = parser(req.headers['user-agent']);

                    //collect user-agent and ip;
                    let user_agent = {
                        ip: req.ip,
                        agent: deviceInfo.device,

                    }

                    let db_ua = result[0].user_agent;

                    let ua = JSON.stringify(user_agent);

                    if (ua !== db_ua) {
                        let query = `UPDATE users SET user_agent="${ua}" WHERE id="${req.params.id}"`;


                        /**
                         * ***** execute nodemailer for user-agent notification;
                         */

                        await sequelize.query(query);
                    }

                    let user = await login(password, result[0].password, req.body.email);
                    let token = createJWT(user._id);
                    res.cookie(process.env.LOGIN_COOKIE || 'chek-jwt', token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });


                    delete result[0].password;
                    delete result[0].createdAt;
                    delete result[0].updatedAt;
                    delete result[0].user_agent;

                    res.status(200).json(result[0]); //will send more fields
                }

            }

        }
        catch (err) {
            res.status(404).json({ error: "invalid password", state: false });
        }

    } else {
        res.json({ error: 'this is not a valid email address', state: false });
    }
});


/**
 *
 *
 *
 *
 *
 * ******* SignUP Route
 *
 *
 *
 *
 *
 */

router.post('/signup', async (req, res) => {
    let { email, name, password, phone, address } = req.body;

    let id = uuidv4();

    let deviceInfo = parser(req.headers['user-agent']);
    let geo = geoip.lookup(req.ip);

    //collect user agent
    let user_agent = {
        ip: req.ip,
        agent: deviceInfo.device,

    }

    try {
        let salt = await bcrypt.genSalt();
        password = await bcrypt.hash(password, salt);

        let query = 'INSERT INTO users(id, name, email, password, phone, user_agent, membership, address, acc_verification) '
        query += `VALUES('${id}', '${name}', '${email}', '${password}', '${phone}', '${JSON.stringify(user_agent)}', '${JSON.stringify(user_agent)}', '${address}', '${false}')`


        /**
         * ***** execute nodemailer for email verification
         */


        try {
            let result = await sequelize.query(query);

            console.log(result);

            let token = createJWT(id);
            res.cookie(process.env.LOGIN_COOKIE || "chek-jwt", token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });
            res.status(201).json({ userName: name, email: email });
        } catch (err) {
            console.log(err)
        }

    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});


/**
 *
 *
 *
 *
 *
 * ******* account verification route
 *
 *
 *
 *
 *
 */

router.get("/verification/:id", async (req, res) => {
    let result = await User.findAll({
        where: {
            id: req.params.id
        }
    });

    if (result[0] && !result[0].dataValues.acc_verification) {
        let query = `UPDATE users SET acc_verification="${1}" WHERE id="${req.params.id}"`;

        await sequelize.query(query);

        result = await User.findAll({
            where: {
                id: req.params.id
            }
        });

        delete result[0].dataValues.password;
        delete result[0].dataValues.createdAt
        delete result[0].dataValues.updatedAt

        let token = createJWT(result[0].dataValues.id);
        res.cookie(process.env.LOGIN_COOKIE || "chek-jwt", token, { maxAge: JWT_OPT.expiresIn * 1000, httpOnly: true });
        res.status(201).json(result[0].dataValues);
    } else if (result[0].dataValues.acc_verification) {
        res.json({ msg: "already verified" });
    } else {
        res.json({ error: "no user found" });
    }
});

/**
 * 
 * 
 * 
 * 
 * 
 * ******* Login function for the login route
 * 
 * 
 * 
 * 
 * 
 */

async function login(password, pass2, email) {
    let auth = await bcrypt.compare(password, pass2);
    if (auth) {
        return { email: email, password: password };
    } else {
        throw Error("wrong password");
    }
}

/**
 * 
 * 
 * 
 * 
 * ****** creating JWT
 * 
 * 
 * 
 * 
 * 
 */

function createJWT(id) {
    return jwt.sign({ id }, process.env.SECRET || 'checks', JWT_OPT);
}

module.exports = router;