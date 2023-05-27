const {
  getPost,
  savePostsWithImage,
  deletePost,
} = require("../../support/dynamo");
const { uploadImage } = require("../../support/cloudinary");

exports.handler = async function (event, _context) {
  if (!process.env.ENABLE_CRON) {
    console.log("processing disabled");
    return;
  }

  const { post: oldestPost, count } = await getPost();
  if (count === 0) {
    console.log("0 posts, this should not happen");
    return {
      statusCode: 400,
    };
  }

  if (count === 1) {
    console.log(`only one post, processing skipped`);
    return {
      statusCode: 400,
    };
  }

  let response;

  try {
    response = await uploadImage(oldestPost.url);
  } catch (error) {
    console.log(error);
  }

  if (response) {
    const data = [
      {
        ...oldestPost,
        secure_url: response.secure_url,
        asset_id: response.asset_id,
        public_id: response.public_id,
      },
    ];

    await savePostsWithImage(data, "instagram_processed");
  }

  await deletePost(oldestPost.id, oldestPost.taken_at_timestamp);

  return {
    statusCode: 200,
  };
};
