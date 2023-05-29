const { Logtail } = require("@logtail/node");

require("dotenv").config();

module.exports.loggerInfo = async function (...args) {
  console.log(...args);

  const logtail = new Logtail(process.env.LOGTAIL_TOKEN);
  await logtail.info(...args);
  await logtail.flush();
};
