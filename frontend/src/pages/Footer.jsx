import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
  return (
    <footer className="footer-root">
      <div>
        &copy; {new Date().getFullYear()} Blog_Space | Created by Sahil Popat Potale
      </div>
      <div className="footer-links">
        <a href="mailto:blog001.space@gmail.com" target="_blank" rel="noopener">Contact | Email</a>
        <a href="https://github.com/Sahil-Popat-Potale/Blog_Space" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.linkedin.com/in/sahil-popat-potale/" target="_blank" rel="noopener">LinkedIn</a>
        {/* Add other social links */}
      </div>
      <div>All rights reserved.</div>
    </footer>
  );
}
