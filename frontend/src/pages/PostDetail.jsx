import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import '../styles/PostDetail.css';

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
      <div className="post-detail-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <Link to="/home" className="post-nav-home">Home</Link>
      <h1>{post.title}</h1>
      <small>By {post.author}</small>
      <small> | Posted: {new Date(post.created_at).toLocaleString()}</small>
      <div className="post-tags">
        <br />
        {Array.isArray(post.tags) && post.tags.map(tag =>
          <span className="post-tag" key={tag}># {tag}</span>
        )}
      </div>
      <div dangerouslySetInnerHTML={{ __html: post.content_html }} />
    </div>
  );
}
