const {Bill} = require("../models/bill");
const { BILL_TO_BE_PAID, BILL_PAID, BILL_PENDING} = require("../util/constants");
const crypto = require('crypto');
const {CloverLog} = require("../models/clover-log");
const {request} = require("axios");

const cloverWebhook = async (req, res) => {
    try {
        await CloverLog.create({
            type: "WEBHOOK_RECEIVED",
            json: req.body.toString(),
        });
        const signatureParts = req.headers['clover-signature'].split(',');
        const timeStamp = signatureParts[0].split('=')[1];
        const signature = signatureParts[1].split('=')[1];
        const hmac = crypto.createHmac('sha256', process.env.CLOVER_WEBHOOK_SECRET)
            .update((timeStamp + "." + req.body))
            .digest('hex');
        if (hmac === signature) {
            let data = JSON.parse(req.body.toString());
            await CloverLog.create({
                type: "WEBHOOK_AUTHORIZED",
                json: req.body.toString(),
            });
            let bill = await Bill.findOne({clover_session: data.checkoutSessionId}).exec();
            if (!bill) {
                await CloverLog.create({
                    type: "WEBHOOK_BILL_NOT_FOUND",
                    json: req.body.toString(),
                });
            } else {
                if (data.status === "APPROVED") {
                    bill.status = BILL_PAID;
                    bill.clover_id = data.id;
                    await bill.save();
                    await CloverLog.create({
                        type: "WEBHOOK_BILL_UPDATED",
                        session_id: data.checkoutSessionId,
                        status: data.status,
                        json: req.body.toString(),
                    });
                } else {
                    await CloverLog.create({
                        type: "WEBHOOK_BILL_NOT_UPDATED",
                        session_id: data.checkoutSessionId,
                        status: data.status,
                        json: req.body.toString(),
                    });
                }
            }
        } else {
            await CloverLog.create({
                type: "WEBHOOK_UNAUTHORIZED",
                json: req.body.toString(),
            });
        }
        res.send({"status": "OK"});
    } catch (e) {
        await CloverLog.create({
            type: "WEBHOOK_ERROR",
            json: req.body.toString() + e.stack
        });
        console.error(e)
        res.send({"status": "BAD"});
    }
}

const getCloverURL = async (req, res) => {
    try {
        await CloverLog.create({
            type: "PAY_REQUEST",
            user_email: req.body.email,
            status: req.body.bill_id,
            json: JSON.stringify(req.body),
        });
        let bill = await Bill.findById(req.body.bill_id).exec();
        if (!bill) {
            res.status(404).send("Bill not found");
            return;
        } else if (bill.status === BILL_PENDING) {
            res.status(400).send("Bill still pending");
            return;
        } else if (bill.status !== BILL_TO_BE_PAID) {
            res.status(400).send("Bill already paid");
            return;
        }
        const price = (bill.price * 100);
        const options = {
            method: 'POST',
            url: process.env.CLOVER_URL,
            headers: {
                accept: 'application/json',
                'X-Clover-Merchant-Id': process.env.CLOVER_MERCHANT_ID,
                'content-type': 'application/json',
                authorization: 'Bearer ' + process.env.CLOVER_ACCESS_TOKEN,
            },
            data: {
                customer: {email: req.body.email},
                shoppingCart: {total: price, lineItems: [{price: price, name: bill.name, unitQty: 1}]}
            }
        };
        request(options).then(async (response) => {
            await CloverLog.create({
                type: "PAY_SESSION_OK",
                session_id: response.data.checkoutSessionId,
                user_email: req.body.email,
                status: req.body.bill_id,
                json: JSON.stringify(response.data),
            });
            bill.clover_session = response.data.checkoutSessionId;
            await bill.save();
            res.send({url: response.data.href});
        }).catch(async (error) => {
            await CloverLog.create({
                type: "PAY_ERROR",
                user_email: req.body.email,
                status: req.body.bill_id,
                json: JSON.stringify(req.body) + " " + error.stack,
            });
            console.error(error);
            console.error(error.response.data);
            res.status(500).send(error);
        });
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

module.exports = {
    cloverWebhook,
    getCloverURL
}