const {
  getPosts,
  savePostsWithImage,
  deletePost,
} = require("../../support/dynamo");
const { uploadImage } = require("../../support/cloudinary");

exports.handler = async function (event, _context) {
  const results = await getPosts();
  if (!Array.isArray(results.Items) || !results.Items.length) {
    return;
  }

  const firstPost = results.Items[0];

  let response;

  try {
    response = await uploadImage(firstPost.url);
  } catch (error) {
    console.log(error);
  }

  if (response) {
    const data = [
      {
        ...firstPost,
        secure_url: response.secure_url,
        asset_id: response.asset_id,
        public_id: response.public_id,
      },
    ];

    await savePostsWithImage(data, "instagram_processed");
  }

  await deletePost(firstPost.id, firstPost.taken_at_timestamp);

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },
    body: "✔️",
  };
};
