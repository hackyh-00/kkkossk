const AWS = require("aws-sdk");

const { loggerInfo: loggerInfoHelper } = require("./log");

const loggerInfo = async (msg) => {
  await loggerInfoHelper(`dynamo: ${msg}`);
};

require("dotenv").config();

const awsParams = {
  region: "us-east-1",
  accessKeyId: process.env.MY_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.MY_AWS_SECRET_ACCESS_KEY,
};

AWS.config.update(awsParams);

const documentClient = new AWS.DynamoDB.DocumentClient();

module.exports.getPostClassified = async (id, taken_at_timestamp) => {
  const params = {
    TableName: "instagram_classified",
    Key: {
      id,
      taken_at_timestamp,
    },
  };

  return documentClient.get(params).promise();
};

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

  await loggerInfo(`saving into ${tableName} ${batch.length} items`);
  await documentClient.batchWrite(params).promise();

  return save25Items(places.slice(25), tableName);
};

module.exports.savePosts = async (data) => {
  await save25Items(data, "instagram");
};

module.exports.savePostsWithImage = async (data) => {
  await save25Items(data, "instagram_processed");
};

module.exports.saveClassification = async (data) => {
  const params = {
    TableName: "instagram_classified",
    Item: {
      ...data,
    },
  };

  return documentClient.put(params).promise();
};

module.exports.savePostPromote = async (data) => {
  const params = {
    TableName: "instagram_promote",
    Item: {
      ...data,
    },
  };

  return documentClient.put(params).promise();
};

module.exports.blockUser = async (id, taken_at_timestamp, username) => {
  const params = {
    TableName: "instagram_blocked_user",
    Item: {
      id,
      taken_at_timestamp,
      username,
    },
  };

  return documentClient.put(params).promise();
};

const getData = async (TableName, Limit) => {
  const params = {
    TableName,
    Limit,
  };

  return documentClient.scan(params).promise();
};

async function getPostSorted(tableName, sort) {
  const results = await getData(tableName);

  if (!Array.isArray(results.Items) || !results.Items.length) {
    return [];
  }

  const sortedPosts = results.Items.sort(
    (a, b) => a.taken_at_timestamp - b.taken_at_timestamp
  );

  const post =
    sort === "newest" ? sortedPosts[sortedPosts.length - 1] : sortedPosts[0];

  return {
    post,
    count: sortedPosts.length,
  };
}

module.exports.getPost = async (sort) => {
  const postSorted = await getPostSorted("instagram", sort);

  return postSorted;
};

module.exports.getImage = async (sort) => {
  const postSorted = await getPostSorted("instagram_processed", sort);

  return postSorted;
};

module.exports.getPostsWithImage = async () => {
  return getData("instagram_classified", 20);
};

const deleteItem = async (tableName, id, taken_at_timestamp) => {
  const params = {
    TableName: tableName,
    Key: {
      id,
      taken_at_timestamp,
    },
  };

  return documentClient.delete(params).promise();
};

module.exports.deletePost = async (id, taken_at_timestamp) => {
  await deleteItem("instagram", id, taken_at_timestamp);
};

module.exports.deleteProcessed = async (id, taken_at_timestamp) => {
  await deleteItem("instagram_processed", id, taken_at_timestamp);
};

module.exports.deleteClassified = async (id, taken_at_timestamp) => {
  await deleteItem("instagram_classified", id, taken_at_timestamp);
};

module.exports.saveSwipe = async (post_id, user_uuid, swipe) => {
  if (!post_id || !user_uuid) {
    await loggerInfo("swipe not saved, empty data");
    return;
  }

  await documentClient
    .put({
      Item: {
        post_id,
        user_uuid,
        swipe,
        created_at: new Date().getTime(),
      },
      TableName: "instagram_swipe",
    })
    .promise();

  return true;
};
