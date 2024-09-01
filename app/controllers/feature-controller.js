const {Feature} = require("../models/feature");

const createFeature = async (req, res) => {
    try {
        let feature = new Feature(req.body);
        await feature.save();
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const getAllFeatures = async (req, res) => {
    try {
        let features = await Feature.find({}).sort({parent_id: 1}).exec();
        let data = [];
        for (let feature of features) {
            if (!feature.parent_id) {
                feature = {
                    _id: feature._id,
                    name: feature.name,
                    price: feature.price,
                    collapsed: false,
                    selected: false,
                    children: []
                }
                data.push(feature);
            } else {
                for (let parent of data) {
                    if (parent._id.toString() === feature.parent_id.toString()) {
                        parent.children.push({
                            _id: feature._id,
                            parent_id: feature.parent_id,
                            name: feature.name,
                            price: feature.price,
                            selected: false,
                        });
                        break;
                    }
                }
            }
        }
        res.send(data);
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const updateFeature = async (req, res) => {
    try {
        await Feature.findByIdAndUpdate(req.body._id, req.body);
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

const deleteFeature = async (req, res) => {
    try {
        await Feature.deleteOne({_id: req.body._id});
        if (!req.body.parent_id) {
            await Feature.deleteMany({parent_id: req.body._id});
        }
        res.send({'code': 0, 'data': 'OK'});
    } catch (e) {
        console.error(e)
        res.status(500).send(e);
    }
}

module.exports = {
    createFeature, getAllFeatures, updateFeature, deleteFeature
}