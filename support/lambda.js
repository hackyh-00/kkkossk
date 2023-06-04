export const getPosts = async () => {
  let response;
  try {
    response = await window.fetch("/.netlify/functions/images");
  } catch (error) {
    console.log(error);
    return [];
  }

  const posts = await response.json();

  return posts.Items;
};

export const deletePost = async (postId, taken_at_timestamp) => {
  try {
    await window.fetch(
      `/.netlify/functions/images?id=${postId}&taken_at_timestamp=${taken_at_timestamp}`,
      {
        method: "DELETE",
      }
    );
  } catch (error) {
    console.log(error);
  }
};

export const promotePost = async (postId, taken_at_timestamp) => {
  try {
    await window.fetch(
      `/.netlify/functions/images?id=${postId}&taken_at_timestamp=${taken_at_timestamp}`,
      {
        method: "POST",
      }
    );
  } catch (error) {
    console.log(error);
  }
};
