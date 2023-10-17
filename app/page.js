"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { getPosts, blockUser, deletePost, promotePost } from "../support/lambda";
import Spinner from "../components/spinner";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const init = async () => {
    const posts = await getPosts();

    setPosts(posts);
  };

  useEffect(() => {
    init();
  }, []);

  const deleteClickHandler = async (post) => {
    if (loading) {
      return;
    }

    if (!confirm("sure?")) {
      return;
    }

    setLoading(true);

    await deletePost(post.id, post.taken_at_timestamp);

    await init();

    setLoading(false);
  };

  const blockClickHandler = async (post) => {
    if (loading) {
      return;
    }

    if (!confirm("sure?")) {
      return;
    }

    setLoading(true);

    await blockUser(post.id, post.taken_at_timestamp, post.username)

    await deletePost(post.id, post.taken_at_timestamp);

    await init();

    setLoading(false);
  }

  const promoteClickHandler = async (post) => {
    if (loading) {
      return;
    }

    if (!confirm("sure?")) {
      return;
    }

    setLoading(true);

    await promotePost(post.id, post.taken_at_timestamp);

    await init();

    setLoading(false);
  };

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto" }}>
      <Spinner loading={loading} />
      {posts.map((post) => (
        <div key={post.id} style={{ display: "flex", margin: "0 0 40px 0" }}>
          <div style={{ width: 300 }}>
            <a href={post.secure_url} target="_blank" style={{display: "block"}}>
            <Image
              src={post.secure_url}
              alt={post.caption}
              width={300}
              height={300}
            />
            </a>
          </div>
          <div style={{ marginLeft: 20, width: 600 }}>
            <div>
              {post.classification.map((classifier, index) => (
                <div key={index} style={{ fontSize: 20, margin: "0 0 24px 0" }}>
                  {(classifier.probability * 100).toFixed(0)}%{" "}
                  {classifier.className}
                </div>
              ))}
            </div>
            <div>{post.caption}</div>
            <br />
            <div>
              user: <a href={`https://www.instagram.com/${post.username || post.owner}/`} target="_blank">{post.username || post.owner} </a><br />
              likes: {post.likes} <br />
              comments: {post.comments} <br />
              taken:{" "}
              {
                new Date(post.taken_at_timestamp * 1000).toJSON().split("T")[0]
              }{" "}
              <br />
              url: {post.id}
            </div>
          </div>
          <div style={{display: "flex", flexDirection: "column", justifyContent: "space-evenly"}}>
            <button
              style={{
                padding: "20px 40px",
                width: 160,
                cursor: "pointer",
                backgroundColor: "white",
                opacity: 0.6,
                fontSize: 20,
                border: "2px solid red",
                opacity: 0.7,
              }}
              onClick={() => deleteClickHandler(post)}
            >
              Delete
            </button>
            <button
              style={{
                padding: "20px 40px",
                width: 160,
                cursor: "pointer",
                backgroundColor: "white",
                opacity: 0.6,
                fontSize: 20,
                border: "2px solid red",
                opacity: 0.7,
              }}
              onClick={() => blockClickHandler(post)}
            >
              Block
            </button>

            <button
              style={{
                padding: "20px 40px",
                width: 160,
                cursor: "pointer",
                backgroundColor: "white",
                opacity: 0.6,
                fontSize: 20,
                border: "2px solid green",
                opacity: 0.7,
              }}
              onClick={() => promoteClickHandler(post)}
            >
              Promote
            </button>
          </div>
        </div>
      ))}
    </main>
  );
}
