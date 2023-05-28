// const fetch = require("node-fetch");

// const { savePosts, getPost } = require("../support/dynamo");
// const { loggerInfo } = require("../support/log");

// require("dotenv").config();

async function load() {
  const response = await fetch(
    "https://www.instagram.com/api/v1/tags/logged_out_web_info/?tag_name=valledeguadalupe",
    {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.5",
        "sec-ch-ua":
          '"Brave";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-ch-ua-platform-version": '"12.4.0"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "sec-gpc": "1",
        "x-asbd-id": "129477",
        "x-csrftoken": "zTPCbRd5mNYtMKgC1kfq3VClzG8WgW7M",
        "x-ig-app-id": "936619743392459",
        "x-ig-www-claim": "0",
        "x-requested-with": "XMLHttpRequest",
        "x-web-device-id": "257952BE-898E-48B0-A2FE-80C247C2BCC5",
      },
      referrer: "https://www.instagram.com/explore/tags/valledeguadalupe/",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    }
  );

  console.log(response);
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
  // const { post: newestPost } = await getPost("newest");
  const newestPost = { taken_at_timestamp: 1685293388 };
  console.log(newestPost);

  if (!newestPost) {
    console.log("0 posts, this should not happen");
    return posts;
  }

  const { taken_at_timestamp } = newestPost;
  console.log(
    "newest.taken_at",
    new Date(taken_at_timestamp * 1000),
    taken_at_timestamp
  );

  return posts.filter((post) => post.taken_at_timestamp > taken_at_timestamp);
}

export default async function runETL() {
  const response = await load();

  const posts = transform(response);
  console.log(`found: ${posts.length} posts`);
  const newPosts = await getNewPost(posts);

  console.log(`new posts: ${newPosts.length}`);
  // await savePosts(newPosts);
}
