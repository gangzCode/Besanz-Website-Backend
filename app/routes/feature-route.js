const express = require('express');
const router = express.Router();

const featureController = require('../controllers/feature-controller');
const {jwtCheckAdmin} = require("../helpers/auth-helper");

router.post('/createFeature', jwtCheckAdmin, featureController.createFeature);
router.get('/getAllFeatures', jwtCheckAdmin, featureController.getAllFeatures);
router.post('/updateFeature', jwtCheckAdmin, featureController.updateFeature);
router.post('/deleteFeature', jwtCheckAdmin, featureController.deleteFeature);

module.exports = router;
