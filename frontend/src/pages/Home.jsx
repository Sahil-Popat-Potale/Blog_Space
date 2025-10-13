import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import TurndownService from 'turndown';

import ClickSpark from '../anime/ClickSpark';
import '../styles/Home.css';

const turndownService = new TurndownService();

export default function Home() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get('/posts')
      .then(r => setPosts(r.data))
      .catch(() => {});
  }, []);

  return (
    <main className="home-root">
      <ClickSpark sparkColor="#ff4500">
      <h2 className="home-heading">Latest Posts</h2>
      {posts.length ? (
        <div className="home-grid">
          {posts.map(p => (
            <div className="home-card" key={p.id}>
              <h3>
                <Link className="home-title" to={`/posts/${p.id}`}>{p.title}</Link>
              </h3>
              <div className="home-meta">
                <span>By <strong>{p.author}</strong></span>
                <span>{new Date(p.created_at).toLocaleDateString()}</span>
              </div>
              <div className="home-tags">
                {Array.isArray(p.tags) && p.tags.map(tag =>
                  <span className="home-tag" key={tag}>{tag}</span>
                )}
              </div>
              {/* 
              1.Using turndown to convert HTML content to plain text for snippet
              2.Using dangerouslySetInnerHTML to render HTML snippet
               */}
              {/*<p className="home-snippet">{turndownService.turndown(p.content_html).slice(0, 200)}...</p>*/}
              <div className="home-snippet" dangerouslySetInnerHTML={{ __html: p.content_html.slice(0, 200) + '...' }} />
              <Link className="home-readmore" to={`/posts/${p.id}`}>Read More</Link>
            </div>
          ))}
        </div>
      ) : (
        <p className="home-noposts">No posts yet. Be the first to <Link to="/create">publish</Link>!</p>
      )}
      </ClickSpark>
    </main>
  );
}
