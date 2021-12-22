const mongojs = require('mongojs');
const express = require('express');
const router = express.Router();
const db = mongojs('meter_calculator', ['calculator']);

// Get all calculators
router.get("/", function (req, res) {
    db.calculator.find({}, function (err, data) {
        respondToUser(res, err, data);
    });
});

// Get one calculator
router.get("/:id", function (req, res) {
    let meterId = req.params.id;
    req.checkParams("id", "invalid meterId").isMongoId();
    let validation_errors = req.validationErrors();
    if (validation_errors) {
        res.status(400).json(validation_errors);
        return false;
    }
    db.calculator.findOne({ _id: mongojs.ObjectId(meterId) }, function (err, data) {
        respondToUser(res, err, data);
    });
});

// Create calculator
router.post("/", function (req, res) {
    req.checkBody("fromUnit", "From unit should be integer").isInt();
    req.checkBody("toUnit", "To unit should be integer").isInt();
    req.checkBody("price", "Price should be Inteber").isInt();

    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json(errors);
        return false;
    }

    req.body.createdAt = new Date();
    req.body.updatedAt = new Date();

    db.calculator.insert(req.body, function (err, data) {
        respondStatusToUser(res, err, data, { msg: 'Calculator added !' });
    });
});

// Update a calculator
router.put("/:id", function (req, res) {
    let calculatorId = req.params.id;
    req.checkParams("id", "Calculator Id should be mongoId").isMongoId();
    req.checkBody("fromUnit", "From unit should be integer").isInt();
    req.checkBody("toUnit", "To unit should be integer").isInt();
    req.checkBody("price", "Price should be Inteber").isInt();
    var errors = req.validationErrors();
    if (errors) {
        res.status(400).json(errors);
        return false;
    }
    req.body.updatedAt = new Date();
    db.calculator.update(
        { _id: mongojs.ObjectId(calculatorId) },
        { $set: req.body },
        { multi: false },
        function (err, data) {
            respondStatusToUser(res, err, data, { msg: 'Calculator Updated !' })
        }
    );
});

// Delete meterunit
router.delete("/:id", function (req, res) {
    let calculatorId = req.params.id;

    req.checkParams("id", "Calculator Id should be mongoId").isMongoId();
    let validation_errors = req.validationErrors();
    if (validation_errors) {
        res.status(400).json(validation_errors);
        return false;
    }

    db.calculator.remove({ _id: mongojs.ObjectId(calculatorId) }, function (err, data) {
        respondStatusToUser(res, err, data, { msg: 'Calculator Deleted !' })
    });
});

module.exports = router;