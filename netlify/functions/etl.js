const { runETL } = require("../../etl");

exports.handler = async function (event, _context) {
  console.log(runETL.toString())
  // await runETL();

  return {
    statusCode: 200,
  };
};
