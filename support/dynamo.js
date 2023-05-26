const AWS = require("aws-sdk");

require("dotenv").config();

AWS.config.update({
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
});

const documentClient = new AWS.DynamoDB.DocumentClient();

const save25Items = async (places) => {
  if (!Array.isArray(places) || !places.length) {
    return;
  }

  const batch = places.slice(0, 25).map((item) => ({
    PutRequest: {
      Item: {
        ...item,
      },
    },
  }));

  const params = {
    RequestItems: {
      instagram: batch,
    },
  };

  console.log(`saving ${batch.length} items`);
  await documentClient.batchWrite(params).promise();

  return save25Items(places.slice(25));
};

module.exports.savePosts = async (data) => {
  await save25Items(data);
};

module.exports.getPosts = async () => {
  const params = {
    TableName: "instagram",
  };

  return documentClient.scan(params).promise();
};