const express = require('express');
const router = express.Router();

const packageController = require('../controllers/package-controller');
const {jwtCheckAdmin} = require("../helpers/auth-helper");

router.post('/createPackage', jwtCheckAdmin, packageController.createPackage);
router.get('/getAllPackages', jwtCheckAdmin, packageController.getAllPackages);
router.post('/updatePackage', jwtCheckAdmin, packageController.updatePackage);
router.post('/deletePackage', jwtCheckAdmin, packageController.deletePackage);

module.exports = router;
