const { getPostsWithImage } = require("../../support/dynamo");

exports.handler = async function (event, _context) {

  const results = await getPostsWithImage();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(results)
  };
};
