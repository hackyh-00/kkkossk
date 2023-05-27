const { saveSwipe } = require("../../support/dynamo");

exports.handler = async function (event, _context) {
  const { post_id, user_uuid, swipe } = event.body || {};

  const saved = await saveSwipe(post_id, user_uuid, swipe);

  if (!saved) {
    return {
      statusCode: 400,
    };
  }

  return {
    statusCode: 200,
  };
};
