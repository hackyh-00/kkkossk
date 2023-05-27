const AWS = require("aws-sdk");

require("dotenv").config();

const awsParams = {
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};

AWS.config.update(awsParams);

const documentClient = new AWS.DynamoDB.DocumentClient();

const save25Items = async (places, tableName) => {
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
      [tableName]: batch,
    },
  };

  console.log(`saving into ${tableName} ${batch.length} items`);
  await documentClient.batchWrite(params).promise();

  return save25Items(places.slice(25), tableName);
};

module.exports.savePosts = async (data) => {
  await save25Items(data, "instagram");
};

module.exports.savePostsWithImage = async (data) => {
  await save25Items(data, "instagram_processed");
};

const getData = async (TableName, Limit) => {
  const params = {
    TableName,
    Limit,
  };

  return documentClient.scan(params).promise();
};

async function getSortedPosts() {
  const results = await getData("instagram");

  if (!Array.isArray(results.Items) || !results.Items.length) {
    return [];
  }

  return results.Items.sort(
    (a, b) => a.taken_at_timestamp - b.taken_at_timestamp
  );
}

module.exports.getPost = async (sort) => {
  const sortedPosts = await getSortedPosts();

  const post =
    sort === "newest" ? sortedPosts[sortedPosts.length - 1] : sortedPosts[0];

  return {
    post,
    count: sortedPosts.length,
  };
};

module.exports.getPostsWithImage = async () => {
  return getData("instagram_processed", 20);
};

module.exports.deletePost = async (id, taken_at_timestamp) => {
  const params = {
    TableName: "instagram",
    Key: {
      id,
      taken_at_timestamp,
    },
  };

  return documentClient.delete(params).promise();
};
