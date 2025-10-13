import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/WelcomeBS.css';

export default function WelcomeBS() {
  return (
    <div className="welcome-root">
      <header className="welcome-header">
        <div className="welcome-menu">
          
          <nav className="welcome-navbar">
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/home" className="nav-link">Latest Post</Link>
            <Link to="/popular" className="nav-link">Most Popular</Link>
            <Link to="/top-post" className="nav-link">Top Posts</Link>
          </nav>
          {/*}
          <ul className="welcome-ul-nav">
            <li><Link to="/home" className="nav-link">Home</Link></li>
            <li><Link to="/home" className="nav-link">Latest Post</Link></li>
            <li><Link to="/popular" className="nav-link">Most Popular</Link></li>
            <li><Link to="/top-post" className="nav-link">Top posts</Link></li>
          </ul>
          */}
        </div>
      </header>

      <main className="welcome-main">
        <div className="welcome-main-container">
          <div className="welcome-main-content">
            <div className="welcome-img"><img src="img.png" /></div>
            <div className="welcom-logo"><Link to="/home" className="nav-link">Blog Space</Link></div>
          </div>
          <div className="search-bar">
            <div className="search-content">
              <form action="/search" autoComplete="off" id="search-form">
                <div className="search-submit">
                  <div className="search-icon btn-search"><i className="fa fa-search"></i></div>
                </div>
                <input type="text" className="form-control search-input" name="keyword" 
                  placeholder="Search anime..." required />
                <button className="search-btn">🔍</button>
              </form>
            </div>
          </div>
          <div className="top-search">
            <p>
              <strong>Top search:</strong> Demon Slayer, One Piece, One Punch Man, Chainsaw Man, My Hero Academia...
            </p>
          </div>
          <button className="watch-btn">Watch anime ➜</button>
        </div>

        <div className="hero-right">
          <div className="anime-image"></div>
        </div>
      </main>

      {/* Info Section */}
      <section className="hianime-info">
        <h2>HiAnime.to – The best site to watch anime online for Free</h2>
        <p>
          Anime is famous worldwide! We've created HiAnime.to to make watching your favorite anime easy,
          safe, and enjoyable. Stream in HD, discover trending titles, and join our friendly community.
        </p>
      </section>

      {/* Features Section */}
      <section className="hianime-features">
        <h3>So what makes HiAnime.to the best site to watch anime free online?</h3>
        <ul>
          <li><strong>Safety:</strong> We do our best to ensure no harmful ads or links.</li>
          <li><strong>Content Library:</strong> Huge selection of anime from all genres.</li>
          <li><strong>Quality/Resolution:</strong> Stream in 360p to 1080p based on your connection.</li>
          <li><strong>Streaming Experience:</strong> Fast load times and smooth playback.</li>
          <li><strong>Updates:</strong> We regularly add new titles and fulfill user requests.</li>
          <li><strong>User Interface:</strong> Simple, clean, and modern design.</li>
          <li><strong>Device Compatibility:</strong> Works perfectly on mobile and desktop.</li>
          <li><strong>Customer Care:</strong> Active 24/7 support for any issue.</li>
        </ul>
      </section>

      {/* Trending Posts Section */}
      <section className="hianime-trending">
        <h3>Trending Posts</h3>
        <div className="trending-grid">
          <div className="trending-card">
            <h4>My First Experience of This Feature</h4>
            <p>“I knew about this site long ago but started using recently — and wow, it’s amazing!”</p>
          </div>
          <div className="trending-card">
            <h4>How I Gained +999 Aura While Cosplaying</h4>
            <p>“Cosplayed as Levi from AOT and the crowd went wild! Here's what I learned…”</p>
          </div>
          <div className="trending-card">
            <h4>Describe a Character and Let Others Guess</h4>
            <p>“Example: brown hair, strong but cold — guess who?”</p>
          </div>
          <div className="trending-card">
            <h4>Top 15 Greatest Experiences Ever</h4>
            <p>“Falling in love, finishing something big, making family proud — unforgettable moments.”</p>
          </div>
        </div>
      </section>
    </div>
  );
}
