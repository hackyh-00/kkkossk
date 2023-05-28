const { Logtail } = require("@logtail/node");

require("dotenv").config();

const logtail = new Logtail(process.env.LOGTAIL_TOKEN);

module.exports.loggerInfo = function (...args) {
  console.log(...args);
  logtail.info(...args);
  logtail.flush()
};
