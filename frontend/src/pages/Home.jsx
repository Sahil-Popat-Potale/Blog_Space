import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TurndownService from "turndown";
import api from "../api";
import ClickSpark from "../assets/ClickSpark";
import "../styles/scss/_home.scss";

const turndownService = new TurndownService();

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/posts")
      .then((res) => {
        setPosts(res.data);
      })
      .catch((err) => console.error("Error fetching posts:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="home__loading">
        <div className="spinner"></div>
        <p>Loading knowledge...</p>
      </div>
    );
  }

  return (
    <ClickSpark sparkColor="#ff4500">
    <main className="home">
      {/* ===== Hero Section ===== */}
      <section className="home__hero">
        <div className="home__hero-content">
          <h1>Empower Your Mind</h1>
          <p>Read, learn, and share your ideas with the world.</p>
          <Link to="/create" className="btn btn--primary">
            Start Writing
          </Link>
        </div>
      </section>

      {/* ===== Main Feed Section ===== */}
        <section className="home__content">
          <div className="home__posts">
            {posts.length ? (
              posts.map((p) => (
                <article key={p.id} className="post-card">
                  <div className="post-card__content">
                    <h2>
                      <Link to={`/posts/${p.id}`}>{p.title}</Link>
                    </h2>

                    <div className="post-card__meta">
                      <span>
                        By <strong>{p.author || "Anonymous"}</strong>
                      </span>
                      <span> | {new Date(p.created_at).toLocaleDateString()}</span>
                    </div>
                    <br />

                    {Array.isArray(p.tags) && (
                      <div className="post-card__tags">
                        {p.tags.map((tag) => (
                          <span className="post-tag" key={tag}> #{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Render snippet from HTML content */}
                    <div
                      className="post-card__excerpt"
                      dangerouslySetInnerHTML={{
                        __html:
                          (p.content_html
                            ? p.content_html.slice(0, 200)
                            : turndownService.turndown(p.content_markdown || "")
                          ) + "...",
                      }}
                    />

                    <div className="post-card__footer">
                      <Link
                        to={`/posts/${p.id}`}
                        className="btn btn--outline"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="home__no-posts">
                No posts yet. Be the first to <Link to="/create">publish</Link>!
              </p>
            )}
          </div>

          {/* ===== Sidebar ===== */}
          <aside className="home__sidebar">
            <div className="card sidebar__about">
              <h3>About KnowledgeHub</h3>
              <p>
                A place where students and thinkers share insights and grow
                together through meaningful content.
              </p>
            </div>

            <div className="card sidebar__tips">
              <h3>Writing Tips</h3>
              <ul>
                <li>Keep titles short and powerful.</li>
                <li>Write from your experience.</li>
                <li>Share facts with examples.</li>
                <li>Be clear, concise, and inspiring.</li>
              </ul>
            </div>
          </aside>
        </section>
    </main>
    </ClickSpark>
  );
}
