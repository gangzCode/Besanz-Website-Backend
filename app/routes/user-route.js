const express = require('express');
const router = express.Router();

const userController = require('../controllers/user-controller');
const {jwtCheckAdmin} = require("../helpers/auth-helper");

router.post('/validateAdminUser', jwtCheckAdmin, userController.validateAdminUser);
router.post('/createUser', jwtCheckAdmin, userController.createUser);
router.get('/getAllUsers', jwtCheckAdmin, userController.getAllUsers);

module.exports = router;
