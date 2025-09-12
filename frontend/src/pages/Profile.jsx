import React, { useContext, useEffect, useState } from 'react';
import AuthContext from '../AuthContext';
import api from '../api';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    const accessToken = tokens.accessToken || '';

    api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => setProfile(res.data))
      .catch((err) => setError('Failed to load profile'));
  }, []);

  if (!user) {
    return (
      <div className="container">
        <p>Please login</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Profile</h2>
      {error && <p className="error">{error}</p>}
      {profile ? (
        <pre>{JSON.stringify(profile, null, 2)}</pre>
      ) : (
        <p>Loading profile...</p>
      )}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
