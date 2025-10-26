import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import '../styles/WelcomeBS.css';

export default function WelcomeBS() {
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const gridRef = useRef(null);

  const cardData = [
    {
      title: 'Home',
      description: 'Return to the BlogSpace homepage.',
      link: '/home',
      label: 'Main'
    },
    {
      title: 'Latest Posts',
      description: 'Check out the newest posts and updates.',
      link: '/home',
      label: 'New'
    },
    {
      title: 'Most Popular',
      description: 'See what’s trending in the community.',
      link: '/popular',
      label: 'Hot'
    },
    {
      title: 'Top Posts',
      description: 'Discover the most loved and shared posts.',
      link: '/top-post',
      label: 'Best'
    }
  ];

  // Particle/star hover effect
  const handleHover = (cardEl) => {
    if (!particlesEnabled) return;
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('span');
      particle.className = 'welcome-bento-particle';
      cardEl.appendChild(particle);

      const x = Math.random() * cardEl.offsetWidth;
      const y = Math.random() * cardEl.offsetHeight;
      const size = Math.random() * 6 + 2;

      gsap.set(particle, {
        left: x,
        top: y,
        width: size,
        height: size,
        opacity: 1,
        scale: 0
      });

      gsap.to(particle, {
        duration: 0.8,
        scale: 1,
        opacity: 0,
        y: -10,
        x: (Math.random() - 0.5) * 20,
        ease: 'power2.out',
        onComplete: () => particle.remove()
      });
    }
  };

  return (
    <div className="welcome-bento-root">
      {/* Header */}
      <header className="welcome-bento-header">
        <nav className="welcome-bento-navbar">
          <Link to="/home" className="welcome-bento-navlink">Home</Link>
          <Link to="/home" className="welcome-bento-navlink">Latest Post</Link>
          <Link to="/popular" className="welcome-bento-navlink">Most Popular</Link>
          <Link to="/top-post" className="welcome-bento-navlink">Top Posts</Link>
        </nav>

        {/* Search Box */}
        <div className="welcome-bento-search">
          <form action="/search" id="welcome-bento-search-form" autoComplete="off">
            <input
              type="text"
              name="keyword"
              placeholder="Search anime..."
              required
              className="welcome-bento-search-input"
            />
            <button type="submit" className="welcome-bento-search-btn">🔍</button>
          </form>
        </div>
      </header>

      {/* Toggle for particle effects */}
      <div className="welcome-bento-toggle">
        <button
          className="welcome-bento-toggle-btn"
          onClick={() => setParticlesEnabled(!particlesEnabled)}
        >
          ✨ {particlesEnabled ? 'Disable Effects' : 'Enable Effects'}
        </button>
      </div>

      {/* Bento Card Grid */}
      <main className="welcome-bento-main">
        <div className="welcome-bento-card-grid" ref={gridRef}>
          {cardData.map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="welcome-bento-card"
              onMouseEnter={(e) => handleHover(e.currentTarget)}
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -8;
                const rotateY = ((x - centerX) / centerX) * 8;
                gsap.to(el, {
                  rotateX,
                  rotateY,
                  duration: 0.2,
                  ease: 'power2.out',
                  transformPerspective: 1000
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  rotateX: 0,
                  rotateY: 0,
                  duration: 0.4,
                  ease: 'power2.out'
                });
              }}
            >
              <div className="welcome-bento-card-header">
                <div className="welcome-bento-card-label">{card.label}</div>
              </div>
              <div className="welcome-bento-card-content">
                <h2 className="welcome-bento-card-title">{card.title}</h2>
                <p className="welcome-bento-card-desc">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
