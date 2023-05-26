"use client";

import { useEffect, useState } from "react";
import Image from 'next/image';

import { getPosts } from "../support/posts";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPosts()
      .then((data) => {
        setPosts(data.Items);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);
  console.log(posts);
  return (
    <main>
      {loading && "loading"}
      {!loading &&
        posts.map((post, index) => (
          <div key={index}>
            <Image src={post.image} alt={post.caption} width={300} height={300} />
          </div>
        ))}
    </main>
  );
}
