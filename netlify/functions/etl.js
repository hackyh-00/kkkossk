const ETL = require("../../etl");

exports.handler = async function (event, _context) {

  await ETL();

  return {
    statusCode: 200,
  };
};
