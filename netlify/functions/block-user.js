const {
    blockUser
} = require("../../support/dynamo");

exports.handler = async function (event, _context) {
  console.log(JSON.stringify(event));

  if (event.httpMethod === "POST") {
    const { id, taken_at_timestamp, username } = event.multiValueQueryStringParameters;

    if (!id?.length || !taken_at_timestamp?.length || !username) {
      return {
        statusCode: 400,
      };
    }

    const user = await blockUser(
      id[0],
      parseInt(taken_at_timestamp[0]),
      username[0]
    );
    console.log(user);
    // if (!post.Item) {
    //   return {
    //     statusCode: 400,
    //   };
    // }

    return {
      statusCode: 200,
    };
  }

  const results = await getPostsWithImage();

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(results),
  };
};
