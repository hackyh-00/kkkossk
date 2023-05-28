const { runETL } = require("../../etl");

exports.handler = async function (event, _context) {

  await runETL();

  return {
    statusCode: 200,
  };
};
