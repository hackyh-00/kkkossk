export const getPosts = async () => {
  const url = `.netlify/functions/posts`;

  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  }).then((response) => response.json());
};
