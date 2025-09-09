import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    api.get('/posts')
      .then((r) => setPosts(r.data))
      .catch(() => {});
  }, []);

  return (
    <div className="container">
      <h2>Latest Posts</h2>
      {posts.length ? (
        posts.map((p) => (
          <div
            key={p.id}
            style={{ border: '1px solid #eee', padding: 12, margin: 8 }}
          >
            <h3>
              <Link to={`/posts/${p.id}`}>{p.title}</Link>
            </h3>
            <small>By {p.author}</small>
            <p>{String(p.content).slice(0, 200)}...</p>
          </div>
        ))
      ) : (
        <p>No posts</p>
      )}
    </div>
  );
}
