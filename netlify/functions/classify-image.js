// const mobilenet = require("@tensorflow-models/mobilenet");
const tfnode = require("@tensorflow/tfjs-node");
const fetch = require("node-fetch");

const {
  getImage,
  saveClassification,
  deleteProcessed,
} = require("../../support/dynamo");
const { loggerInfo: loggerInfoHelper } = require("../../support/log");

const loggerInfo = async (...args) => {
  await loggerInfoHelper("classify-image", ...args);
};

const downloadImage = async (path) => {
  loggerInfo("downloading image:", path);

  const response = await fetch(path);
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  const image = tfnode.node.decodeImage(imageBuffer);

  return image;
};

// const getImageClassification = async (image) => {
//   const model = await mobilenet.load();
//   const classification = await model.classify(image);

//   return classification;
// };

exports.handler = async function (event, _context) {
  await loggerInfo("\n\n==== start");

  if (!process.env.ENABLE_CRON) {
    await loggerInfo("processing disabled");
    return {
      statusCode: 200,
    };
  }

  const { post: oldestPost, count } = await getImage();

  if (count === 0) {
    await loggerInfo("0 images", oldestPost);

    return {
      statusCode: 200,
    };
  }

  const image = await downloadImage(oldestPost.secure_url);

  // const classification = await getImageClassification(image);

  const newPost = {
    ...oldestPost,
    // classification,
  };

  // await saveClassification(newPost);

  // await deleteProcessed(newPost.id, newPost.taken_at_timestamp);

  await loggerInfo("image classified", newPost.id);

  await loggerInfo("==== end\n\n");

  return {
    statusCode: 200,
    body: ":)",
  };
};
