const { getPosts } = require("../../support/dynamo");

exports.handler = async function (event, _context) {

  const results = await getPosts();

  results.Items = results.Items.sort((a, b) => a.taken_at_timestamp - b.taken_at_timestamp).slice(0, 20)

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(results)
  };
};
