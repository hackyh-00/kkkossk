const { Logtail } = require("@logtail/node");

require("dotenv").config();

module.exports.loggerInfo = function (...args) {
  console.log(...args);

  const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
  logtail.info(...args);
  logtail.flush();
};
