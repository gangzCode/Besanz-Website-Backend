const auth0Helper = require("../helpers/auth-helper");

const validateAdminUser = async (req, res) => {
    try {
        let flag = await auth0Helper.validateAdminUser(req.body.email)
        res.send({isAdmin: flag});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const createUser = async (req, res) => {
    try {
        await auth0Helper.createUser(req.body)
        res.send({code: 0, data: "OK"});
    } catch (e) {
        console.error(e)
        if (e?.response?.data?.message) {
            res.status(500).send({code: 1, data: e.response.data.message});
        } else {
            res.status(500).send({code: 1, data: "Internal error occurred. Please try again later."});
        }
    }
}

const getAllUsers = async (req, res) => {
    try {
        let users = await auth0Helper.getUsers()
        res.send(users);
    } catch (e) {
        console.error(e)
        if (e?.response?.data?.message) {
            res.status(500).send({code: 1, data: e.response.data.message});
        } else {
            res.status(500).send({code: 1, data: "Internal error occurred. Please try again later."});
        }
    }
}

module.exports = {
    validateAdminUser, createUser, getAllUsers
}
