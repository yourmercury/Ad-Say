const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const reqIp = require('request-ip');
const device = require('express-device');
const account_route = require('./controllers/account-route');
const parser = require('ua-parser-js');
const { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql_schema/graphql_root_query');

const fetch = require('fetch')

//PORT
const port = process.env.PORT || 9000;

//instantiate exrepss
const app = express();


//middlewares
app.use(reqIp.mw());
app.use(device.capture());

//graphQL end point
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}))

//front-end host
app.get('/', (req, res) => {
    res.end()
});

app.use('/seller', account_route);


//listening to PORT
app.listen(port, () => {
    console.log("server is listening at port " + port);
});
