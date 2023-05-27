const { getPost } = require("../../support/dynamo");

exports.handler = async function (event, _context) {
  const sort = event.multiValueQueryStringParameters?.sort?.[0];

  const result = await getPost(sort);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  };
};
