const { getPost, savePosts } = require("../../support/dynamo");
const fetch = require("node-fetch");

const { loggerInfo: loggerInfoHelper } = require("../../support/log");

const loggerInfo = async (...args) => {
  await loggerInfoHelper("process-post", ...args);
};

const extract = async () => {
  const url = "https://api.garitacenter.com/ig_recent_posts.json";
  const response = await fetch(url);
  const body = await response.json();

  return body;
};

const transform = (body) => {
  const posts = body.data.recent.sections.reduce((accu, section) => {
    if (
      !Array.isArray(section?.layout_content?.medias) ||
      !section.layout_content.medias.length
    ) {
      return accu;
    }

    section.layout_content.medias.forEach(({ media }) => {
      const image = media.image_versions2
        ? media.image_versions2?.candidates[0]?.url
        : media.carousel_media[0]?.image_versions2?.candidates[0]?.url;

      const post = {
        id: media.id,
        taken_at_timestamp: media.taken_at,
        url: `https://www.instagram.com/p/${media.code}/`,
        likes: media.like_count,
        caption: media.caption?.text,
        comments: media.comment_count,
        username: media.user?.username,
        image,
      };

      accu.push(post);
    });

    return accu;
  }, []);

  return posts;
};

async function getNewPost(posts) {
  const { post: newestPost } = await getPost("newest");

  if (!newestPost) {
    await loggerInfo("0 posts, this should not happen");
    return posts;
  }

  const { taken_at_timestamp } = newestPost;
  await loggerInfo(
    "newest.taken_at",
    new Date(taken_at_timestamp * 1000),
    taken_at_timestamp
  );

  return posts.filter((post) => post.taken_at_timestamp > taken_at_timestamp);
}

exports.handler = async function (event, _context) {
  await loggerInfo("\n\n==== start");
  const body = await extract();

  if (
    !Array.isArray(body?.data?.recent?.sections) ||
    !body.data.recent.sections.length
  ) {
    return {
      statusCode: 400,
    };
  }

  const posts = transform(body);

  await loggerInfo(`found: ${posts.length} posts`);
  const newPosts = await getNewPost(posts);

  await loggerInfo(`new posts: ${newPosts.length}`);
  await savePosts(newPosts);

  await loggerInfo("==== end\n\n");

  return {
    statusCode: 200,
  };
};
