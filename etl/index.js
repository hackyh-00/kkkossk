const fetch = require("node-fetch");

const { savePosts, getPost } = require("../support/dynamo");
const { loggerInfo } = require("../support/log");

require("dotenv").config();

async function load() {
  const url =
    "https://www.instagram.com/api/v1/tags/logged_out_web_info/?tag_name=valledeguadalupe";
  const headers = {
    "Content-Type": "application/json",
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
    is_video: item.node.is_video,
    owner: item.node.owner.id,
    image: item.node.thumbnail_src,
  }));
}

async function getNewPost(posts) {
  const { post: newestPost } = await getPost("newest");

  if (!newestPost) {
    loggerInfo("0 posts, this should not happen");
    return posts;
  }

  const { taken_at_timestamp } = newestPost;
  loggerInfo(
    "newest.taken_at",
    new Date(taken_at_timestamp * 1000),
    taken_at_timestamp
  );

  return posts.filter((post) => post.taken_at_timestamp > taken_at_timestamp);
}

async function runETL() {
  const response = await load();

  const posts = transform(response);
  loggerInfo(`found: ${posts.length} posts`);
  const newPosts = await getNewPost(posts);

  loggerInfo(`new posts: ${newPosts.length}`);
  await savePosts(newPosts);
}

module.exports = runETL
