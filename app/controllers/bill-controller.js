const {Bill} = require("../models/bill");
const {BillInvoice} = require("../models/bill-invoice");
const {BILL_PENDING, BILL_TO_BE_PAID} = require("../util/constants");

const createBill = async (req, res) => {
    try {
        let {pdf_data, ...data} = req.body;
        let pdfFlag =  (!!(pdf_data && pdf_data.length > 0));
        let billObj = new Bill({
            ...data,
            contain_invoice: pdfFlag
        });
        billObj = await billObj.save();
        if (pdfFlag) {
            await BillInvoice.create({
                bill_id: billObj._id,
                data: pdf_data
            });
        }
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getAllBillsPending = async (req, res) => {
    try {
        let data = req.body;
        let bills;
        if (data.filter == 'user') {
            bills = await Bill.find({user_email: data.filterUser, status: BILL_PENDING }).exec();
        } else {
            data.startDate = new Date(new Date(data.startDate).setHours(0, 0, 0, 0));
            data.endDate = new Date(new Date(data.endDate).setHours(23, 59, 59, 999));
            bills = await Bill.find({
                created_date: {
                    $gte: data.startDate,
                    $lte: data.endDate
                },
                status: BILL_PENDING
            }).exec();
        }
        res.send(bills);
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getAllBillsSubmitted = async (req, res) => {
    try {
        let data = req.body;
        let bills;
        if (data.filter == 'user') {
            bills = await Bill.find({user_email: data.filterUser, status: { $ne: BILL_PENDING }}).exec();
        } else {
            data.startDate = new Date(new Date(data.startDate).setHours(0, 0, 0, 0));
            data.endDate = new Date(new Date(data.endDate).setHours(23, 59, 59, 999));
            bills = await Bill.find({
                created_date: {
                    $gte: data.startDate,
                    $lte: data.endDate
                },
                status: { $ne: BILL_PENDING }
            }).exec();
        }
        res.send(bills);
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getBillPDFData = async (req, res) => {
    try {
        let data = req.body;
        let bills = await BillInvoice.find({bill_id: data.bill_id}).exec();
        res.send(bills);
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getPayableBillsUser = async (req, res) => {
    try {
        if (!req?.auth?.payload?.user_email) {
            res.status(400).send("user_email is not found in claims!");
        } else {
            let bills = await Bill.find({status: BILL_TO_BE_PAID, user_email: req.auth.payload.user_email}).exec();
            res.send(bills);
        }
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getOldBillsUser = async (req, res) => {
    try {
        if (!req?.auth?.payload?.user_email) {
            res.status(400).send("user_email is not found in claims!");
        } else {
            let bills = await Bill.find({
                $and: [{status: {$ne: BILL_PENDING}}, {status: {$ne: BILL_TO_BE_PAID}}],
                user_email: req.auth.payload.user_email}).exec();
            res.send(bills);
        }
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const updateBill = async (req, res) => {
    try {
        let bill = await Bill.findById(req.body._id);
        if (bill.status === BILL_PENDING || bill.status === BILL_TO_BE_PAID) {
            let {pdf_data, ...data} = req.body;
            let pdfFlag = (!!(pdf_data && pdf_data.length > 0));
            await Bill.findByIdAndUpdate(req.body._id, {
                ...data,
                contain_invoice: pdfFlag
            });
            if (pdfFlag) {
                await BillInvoice.findOneAndUpdate(
                    {bill_id: data._id},
                    {data: pdf_data},
                    {upsert: true}
                )
            } else {
                await BillInvoice.deleteMany({bill_id: data._id});
            }
            res.send({'code': 0, 'data': 'OK'});
        } else {
            res.send({'code': 1, 'data': 'Cannot update a paid bill.'});
        }
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const submitBill = async (req, res) => {
    try {
        let bill = await Bill.findById(req.body.bill_id);
        if (bill.status === BILL_PENDING || bill.status === BILL_TO_BE_PAID) {
            await Bill.findByIdAndUpdate(req.body.bill_id, {
                status: BILL_TO_BE_PAID
            });
            res.send({'code': 0, 'data': 'OK'});
        } else {
            res.send({'code': 1, 'data': 'Cannot update a paid bill.'});
        }
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const deleteBill = async (req, res) => {
    try {
        let bill = await Bill.findById(req.body._id);
        if (bill.status === BILL_PENDING || bill.status === BILL_TO_BE_PAID) {
            await Bill.deleteOne({_id: req.body._id});
            await BillInvoice.deleteMany({bill_id: req.body._id});
            res.send({'code': 0, 'data': 'OK'});
        } else {
            res.send({'code': 1, 'data': 'Cannot update a paid bill.'});
        }
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

module.exports = {
    createBill,
    getAllBillsPending,
    getAllBillsSubmitted,
    getBillPDFData,
    getPayableBillsUser,
    getOldBillsUser,
    updateBill,
    submitBill,
    deleteBill
}