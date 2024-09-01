const {Package} = require("../models/package");

const createPackage = async (req, res) => {
    try {
        let packageObj = new Package(req.body);
        await packageObj.save();
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getAllPackages = async (req, res) => {
    try {
        let features = await Package.find({}).exec();
        res.send(features);
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const updatePackage = async (req, res) => {
    try {
        await Package.findByIdAndUpdate(req.body._id, req.body);
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const deletePackage = async (req, res) => {
    try {
        await Package.deleteOne({_id: req.body._id});
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

module.exports = {
    createPackage,
    getAllPackages,
    updatePackage,
    deletePackage
}