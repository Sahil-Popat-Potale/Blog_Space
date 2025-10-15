import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../AuthContext';
import '../styles/NavBar.css';

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const nav = useNavigate();

  return (
    <nav className="navbar">
      <Link className="navbar-title" to="/">Blog Space</Link>
      <div className="navbar-actions">
        {user ? (
          <>
            <Link className="navbar-link" to="/create">✒️Write</Link>
            {user && user.role === 'admin' && <Link className="navbar-link" to="/admin">Admin</Link> }
            <Link className="navbar-link" to="/profile">Profile</Link>
            <button className="navbar-btn" onClick={() => { logout(); nav('/home'); }}>Logout</button>
          </>
        ) : (
          <>
            <Link className="navbar-link" to="/login">Login</Link>
            <Link className="navbar-link" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
