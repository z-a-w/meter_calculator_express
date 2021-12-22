const mongojs = require("mongojs");
const express = require("express");
const router = express.Router();
const db = mongojs("meter_calculator", ["meter_units"]);
const Promise = require("core-js-pure/features/promise");
const { respondToUser, respondStatusToUser } = require("../helper");

// Get all meter_units
router.get("/", function (req, res) {
  db.meter_units.find({}, function (err, data) {
    respondToUser(res, err, data);
  });
});

// Get one meterunit
router.get("/:id", function (req, res) {
  let meterId = req.params.id;
  req.checkParams("id", "invalid meterId").isMongoId();
  let validation_errors = req.validationErrors();
  if (validation_errors) {
    res.status(400).json(validation_errors);
    return false;
  }
  db.meter_units.findOne(
    { _id: mongojs.ObjectId(meterId) },
    function (err, data) {
      respondToUser(res, err, data);
    }
  );
});

// Create meter unit
router.post("/", async function (req, res) {
  req.checkBody("unit", "Meter unit should be int").isInt();
  req.checkBody("readDate", "Date should be date").notEmpty();
  req.checkBody("readTime", "Time should be date").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return false;
  }
  req.body.createdAt = new Date(req.body.readDate);
  req.body.updatedAt = new Date();

  // Calculate for net unit
  var totalCount = await getTotalCount();
  if (totalCount == 0) {
    req.body.netUnit = req.body.unit;
  } else {
    var latestData = await getLaestData(totalCount);
    if (latestData.unit > req.body.unit) {
      res.status(400).json({ msg: "Latest should be greater" });
    }
    req.body.netUnit = req.body.unit - latestData.unit;
  }
  db.meter_units.insert(req.body, function (err, data) {
    respondStatusToUser(res, err, data, { msg: "Meter Unit Added !" });
  });
});

// Update meter unit
router.put("/:id", function (req, res) {
  let meterId = req.params.id;
  req.checkParams("id", "MeterId should be mongoId").isMongoId();
  req.checkBody("unit", "Meter unit should be int").isInt();
  req.checkBody("readDate", "Date should be date").notEmpty();
  req.checkBody("readTime", "Time should be date").notEmpty();
  var errors = req.validationErrors();
  if (errors) {
    res.status(400).json(errors);
    return false;
  }
  req.body.updatedAt = new Date();
  db.mater_units.update(
    { _id: mongojs.ObjectId(meterId) },
    { $set: req.body },
    { multi: false },
    function (err, data) {
      respondStatusToUser(res, err, data, { msg: "Meter Updated !" });
    }
  );
});

// Delete meterunit
router.delete("/:id", function (req, res) {
  let meterId = req.params.id;

  req.checkParams("id", "Meter Id should be mongoId").isMongoId();
  let validation_errors = req.validationErrors();
  if (validation_errors) {
    res.status(400).json(validation_errors);
    return false;
  }

  db.meter_units.remove(
    { _id: mongojs.ObjectId(meterId) },
    function (err, data) {
      respondStatusToUser(res, err, data, { msg: "Meter Deleted !" });
    }
  );
});

//get a total number of meters
router.get("/get/total", function (req, res) {
  db.meter_units.aggregate(
    {
      $count: "count",
    },
    function (err, data) {
      respondToUser(res, err, data);
    }
  );
});

//get with start and end
router.post("/limit", function (req, res) {
  req.checkBody("skip", "Invalid skip").isInt();
  req.checkBody("limit", "Invalid limit").isInt();
  let validation_errors = req.validationErrors();
  if (validation_errors) {
    res.status(400).json(validation_errors);
  }

  db.meter_units.aggregate(
    [
      {
        $facet: {
          totalData: [
            { $match: {} },
            { $skip: req.body.skip },
            { $limit: req.body.limit },
            { $sort: { createdAt: -1 } },
          ],
        },
      },
    ],
    function (err, data) {
      respondToUser(res, err, data);
    }
  );
});

// get with time range
router.post("/range", function (req, res) {
  req.checkBody("start", "Start should not be empty").notEmpty();
  req.checkBody("end", "End should not be empty").notEmpty();
  let validation_errors = req.validationErrors();
  if (validation_errors) {
    res.status(400).json(validation_errors);
  }

  db.meter_units.find(
    {
      createdAt: {
        $gte: new Date(req.body.start),
        $lt: new Date(req.body.end),
      },
    },
    function (err, data) {
      respondToUser(res, err, data);
    }
  );
});

var getTotalCount = function () {
  return new Promise(function (resolve, reject) {
    db.meter_units.aggregate(
      {
        $count: "count",
      },
      function (err, data) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          if (!data[0]) {
            resolve(0);
          } else {
            resolve(data[0].count);
          }
        }
      }
    );
  });
};

var getLaestData = function (count) {
  return new Promise(function (resolve, reject) {
    db.meter_units.aggregate(
      [
        {
          $facet: {
            totalData: [
              { $match: {} },
              { $skip: count - 1 },
              { $limit: 1 },
              { $sort: { createdAt: -1 } },
            ],
          },
        },
      ],
      function (err, data) {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(data[0].totalData[0]);
        }
      }
    );
  });
};

module.exports = router;
