require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require("mongoose");
const {testAuth0} = require("./app/helpers/auth-helper");
const useRoutes = require('./app/routes/user-route');
const featureRoutes = require('./app/routes/feature-route');
const packageRoutes = require('./app/routes/package-route');
const billRoutes = require('./app/routes/bill-route');
const cloverRoutes = require('./app/routes/clover-route');
const {json, raw} = require("body-parser");

mongoose.connect(process.env.MONGODB_URI).then(() => {
    console.log("TESTING DATABASE");
    console.log(" --> DATABASE OK");
}).catch(error => {
    console.log("TESTING DATABASE");
    console.error(" --> DATABASE ERROR ", error);
});

testAuth0()

app.use(cors());
app.use('*/cloverWebhook', raw({type: "*/*"}))
app.use(express.json({limit: '5mb'}));
app.use(express.urlencoded({limit: '5mb'}));
app.use(json({type: 'application/json'}))

app.options('*', cors())

const CONTEXT_PATH = process.env.CONTEXT_PATH

// Backend Routes
app.use(`/${CONTEXT_PATH}/user`, useRoutes);
app.use(`/${CONTEXT_PATH}/feature`, featureRoutes);
app.use(`/${CONTEXT_PATH}/package`, packageRoutes);
app.use(`/${CONTEXT_PATH}/bill`, billRoutes);
app.use(`/${CONTEXT_PATH}/clover`, cloverRoutes);

app.get(`/${CONTEXT_PATH}/`, (req, res, next) => {
    res.send({
        version: 'v1.0.0',
        author: 'BesanzAPI',
        lastUpdated: '2024-03-18'
    })
});

const PORT = process.env.PORT;
app.listen(PORT, (error) => {
    if (!error) {
        console.log("Server Initialized | Port - " + PORT)
    } else {
        console.error(" --> Server initialization error ", error);
    }
});
