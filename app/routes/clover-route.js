const express = require('express');
const router = express.Router();

const cloverController = require('../controllers/clover-controller');
const {jwtCheckUser} = require("../helpers/auth-helper");

router.post('/getCloverURL', jwtCheckUser, cloverController.getCloverURL);
router.post('/cloverWebhook', require("body-parser").raw({type: "*/*"}), cloverController.cloverWebhook);

module.exports = router;