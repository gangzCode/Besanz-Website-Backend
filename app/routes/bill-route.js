const express = require('express');
const router = express.Router();

const billController = require('../controllers/bill-controller');
const {jwtCheckAdmin, jwtCheckUser} = require("../helpers/auth-helper");

router.post('/createBill', jwtCheckAdmin, billController.createBill);
router.post('/getAllBillsPending', jwtCheckAdmin, billController.getAllBillsPending);
router.post('/getAllBillsSubmitted', jwtCheckAdmin, billController.getAllBillsSubmitted);
router.post('/getBillPDFData', jwtCheckUser, billController.getBillPDFData);
router.post('/getOldBillsUser', jwtCheckUser, billController.getOldBillsUser);
router.post('/getPayableBillsUser', jwtCheckUser, billController.getPayableBillsUser);
router.post('/updateBill', jwtCheckAdmin, billController.updateBill);
router.post('/submitBill', jwtCheckAdmin, billController.submitBill);
router.post('/deleteBill', jwtCheckAdmin, billController.deleteBill);

module.exports = router;
