const {
  getPostsWithImage,
  savePostPromote,
  deleteClassified,
  getPostClassified,
} = require("../../support/dynamo");

const { deleteImage } = require('../../support/cloudinary')

exports.handler = async function (event, _context) {
  if (event.httpMethod === "DELETE") {
    const { id, taken_at_timestamp } = event.multiValueQueryStringParameters;

    if (!id?.length || !taken_at_timestamp?.length) {
      return {
        statusCode: 400,
      };
    }

    const post = await getPostClassified(id[0], parseInt(taken_at_timestamp[0]))

    await deleteImage(post.Item.public_id)

    await deleteClassified(id[0], parseInt(taken_at_timestamp[0]));

    return {
      statusCode: 200,
    };
  }

  if (event.httpMethod === "POST") {
    const { id, taken_at_timestamp } = event.multiValueQueryStringParameters;

    if (!id?.length || !taken_at_timestamp?.length) {
      return {
        statusCode: 400,
      };
    }

    const post = await getPostClassified(
      id[0],
      parseInt(taken_at_timestamp[0])
    );
    console.log(post);
    if (!post.Item) {
      return {
        statusCode: 400,
      };
    }

    await savePostPromote(post.Item);

    await deleteClassified(id[0], parseInt(taken_at_timestamp[0]));

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
