const router = require('express').Router();
const parser = require('ua-parser-js')


router.post('signup', (req, res) => {
    let deviceInfo = parser(req.headers['user-agent']);

    //collect user-agent and ip;
    let user_agent = {
        ip: req.ip,
        agent: deviceInfo.device,

    }
});