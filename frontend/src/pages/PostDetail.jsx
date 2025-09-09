import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function PostDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api.get(`/posts/${id}`)
      .then((r) => setPost(r.data))
      .catch(() => {});
  }, [id]);

  if (!post) {
    return (
      <div className="container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{post.title}</h2>
      <small>By {post.author}</small>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}
