import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import "../styles/WelcomeBS.css";
import MagicBento from "../assets/MagicBento";

export default function WelcomeBS() {
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const gridRef = useRef(null);
  const trailContainer = useRef(null);

  const cardData = [
    { title: "Home", description: "Return to the BlogSpace homepage.", link: "/home", label: "Main" },
    { title: "Latest Posts", description: "Check out the newest posts and updates.", link: "/home", label: "New" },
    { title: "Most Popular", description: "See what’s trending in the community.", link: "/popular", label: "Hot" },
    { title: "Top Posts", description: "Discover the most loved and shared posts.", link: "/top-post", label: "Best" },
  ];

  // Apply theme to root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Particle Trail Effect
  const createParticle = (x, y) => {
    if (!particlesEnabled) return;
    const particle = document.createElement("span");
    particle.className = "welcome-bento-particle";
    trailContainer.current.appendChild(particle);

    gsap.set(particle, {
      x,
      y,
      scale: 0,
      opacity: 1,
    });

    gsap.to(particle, {
      duration: 0.6,
      scale: Math.random() * 0.6 + 0.4,
      opacity: 0,
      x: x + (Math.random() - 0.5) * 40,
      y: y + (Math.random() - 0.5) * 40,
      ease: "power2.out",
      onComplete: () => particle.remove(),
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => createParticle(e.clientX, e.clientY);
    const handleTouch = (e) => {
      const touch = e.touches[0];
      createParticle(touch.clientX, touch.clientY);
    };

    if (particlesEnabled) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchstart", handleTouch);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
    };
  }, [particlesEnabled]);

  return (
    <div className="welcome-bento-root">
      <div ref={trailContainer} className="welcome-bento-particle-container"></div>

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

        {/* Theme Switch */}
        <div className="welcome-bento-theme-toggle">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="welcome-bento-theme-btn"
          >
            {darkMode ? "☀️ Day" : "🌙 Night"}
          </button>
        </div>
      </header>

      {/* Toggle for particle effects */}
      <div className="welcome-bento-toggle">
        <button
          className="welcome-bento-toggle-btn"
          onClick={() => setParticlesEnabled(!particlesEnabled)}
        >
          ✨ {particlesEnabled ? "Disable Trail" : "Enable Trail"}
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
              onMouseMove={(e) => {
                const el = e.currentTarget;
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -15;
                const rotateY = ((x - centerX) / centerX) * 15;
                gsap.to(el, {
                  rotateX,
                  rotateY,
                  duration: 0.2,
                  ease: "power2.out",
                  transformPerspective: 1000,
                });
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                  rotateX: 0,
                  rotateY: 0,
                  duration: 0.4,
                  ease: "power2.out",
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
