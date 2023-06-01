const fetch = require("node-fetch");

const { getImage } = require("../../support/dynamo");
const { loggerInfo: loggerInfoHelper } = require("../../support/log");

const loggerInfo = async (msg) => {
  await loggerInfoHelper(`classify-image: ${msg}`);
};

const downloadImage = async (path) => {
  loggerInfo(`downloading image: ${path}`);

  const response = await fetch(path);
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return imageBuffer;
};

exports.handler = async function (event, _context) {
  await loggerInfo("==== start");

  if (!process.env.ENABLE_CRON) {
    await loggerInfo("processing disabled");
    return {
      statusCode: 200,
    };
  }

  const { post: oldestPost, count } = await getImage();

  if (count === 0) {
    await loggerInfo(`0 images`);

    return {
      statusCode: 200,
    };
  }

  await downloadImage(oldestPost.secure_url);

  const newPost = {
    ...oldestPost,
  };

  await loggerInfo(`image classified: ${newPost.id}`);

  await loggerInfo("==== end");

  return {
    statusCode: 200,
    body: ":)",
  };
};
