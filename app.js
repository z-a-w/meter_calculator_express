const express = require("express");
const validator = require("express-validator");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

// Import routes here
const meter_units = require("./routes/meter_units");
const calculator = require("./routes/calculator");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(validator());

app.use(function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "http://meter.intelimyanmar.com:8080");
  res.set("Access-Control-Allow-Credentials", "true");
  res.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.set(
    "Access-Control-Allow-Headers",
    "Origin, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5,Content-Type, Date, X-Api-Version"
  );
  next();
});

app.use("/api/meter_units", meter_units);
app.use("/api/calculator", calculator);

// TODO: use route here
app.listen(3002, () => {
  console.log(
    "=====================================================================\n"
  );
  console.log(
    " < METER CALCULATOR API > \n Express server is running at port 3000 \n ready to go ! "
  );
  console.log(
    "=====================================================================\n"
  );
});
