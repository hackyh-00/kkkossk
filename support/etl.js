const fetch = require("node-fetch");

const { savePosts, getPost } = require("../support/dynamo");
const { loggerInfo: loggerInfoHelper } = require("./log");

const loggerInfo = async (msg) => {
  await loggerInfoHelper(`etl: ${msg}`);
};

require("dotenv").config();

async function load() {
  const url =
    "https://www.instagram.com/api/v1/tags/logged_out_web_info/?tag_name=valledeguadalupe";
  const headers = {
    "user-agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36",
    "x-ig-app-id": process.env.INSTAGRAM_TOKEN,
  };

  const response = await fetch(url, {
    headers,
  });

  const body = await response.json();

  return body;
}

function transform(response) {
  return response.data.hashtag.edge_hashtag_to_media.edges.map((item) => ({
    id: item.node.id,
    taken_at_timestamp: item.node.taken_at_timestamp,
    url: item.node.display_url,
    likes: item.node.edge_liked_by.count,
    caption: item.node.edge_media_to_caption?.edges[0]?.node.text,
    comments: item.node.edge_media_to_comment.count,
    owner: item.node.owner.id,
    image: item.node.thumbnail_src,
  }));
}

async function getNewPost(posts) {
  const { post: newestPost } = await getPost("newest");

  if (!newestPost) {
    await loggerInfo("0 posts, this should not happen");
    return posts;
  }

  const { taken_at_timestamp } = newestPost;
  await loggerInfo(`newest.taken_at: ${new Date(taken_at_timestamp * 1000)}`);

  return posts.filter((post) => post.taken_at_timestamp > taken_at_timestamp);
}

async function runETL() {
  const response = await load();

  const posts = transform(response);
  await loggerInfo(`found: ${posts.length} posts`);
  const newPosts = await getNewPost(posts);

  await loggerInfo(`new posts: ${newPosts.length}`);
  await savePosts(newPosts);
}

async function main() {
  await runETL();
}

if (require.main === module) {
  main();
}
