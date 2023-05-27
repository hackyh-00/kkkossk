const fetch = require("node-fetch");

const { savePosts } = require("../support/dynamo");

async function load() {
  const url =
    "https://www.instagram.com/api/v1/tags/logged_out_web_info/?tag_name=valledeguadalupe";
  const headers = {
    "Content-Type": "application/json",
    "x-ig-app-id": "936619743392459",
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
    content: JSON.stringify(item.node),
    url: item.node.display_url,
    likes: item.node.edge_liked_by.count,
    caption: item.node.edge_media_to_caption?.edges[0]?.node.text,
    comments: item.node.edge_media_to_comment.count,
    is_video: item.node.is_video,
    owner: item.node.owner.id,
    image: item.node.thumbnail_src,
  }));
}

async function ETL() {
  const response = await load();

  const posts = transform(response);

  await savePosts(posts);
}

ETL()
