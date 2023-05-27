const {
  getPost,
  savePostsWithImage,
  deletePost,
} = require("../../support/dynamo");
const { uploadImage } = require("../../support/cloudinary");

exports.handler = async function (event, _context) {
  const oldestPost = await getPost();
  if (!oldestPost) {
    return;
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
    headers: {
      "Content-Type": "application/json",
    },
    body: "✔️",
  };
};
