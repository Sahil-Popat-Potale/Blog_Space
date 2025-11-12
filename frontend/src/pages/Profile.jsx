import React, { useContext, useEffect, useState, useRef } from 'react';
import AuthContext from '../AuthContext';
import api from '../api';
import '../styles/Profile.css';

export default function Profile() {
  const { user, logout, save } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    bio: '',
    avatar: null, // file object
    avatarUrl: '', // preview url
  });
  const [cooldowns, setCooldowns] = useState({});
  const [feedback, setFeedback] = useState({ error: '', success: '' });
  const avatarInputRef = useRef();

  // Load profile details
  useEffect(() => {
    if (!user) return;
    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    const accessToken = tokens.accessToken || '';
    api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        setProfile(res.data);
        setForm({
          username: res.data.username || '',
          email: res.data.email || '',
          bio: res.data.bio || '',
          avatar: null,
          avatarUrl: res.data.avatar_url || '',
        });
        setCooldowns(res.data.cooldowns || {});
      })
      .catch(() => setFeedback({ error: 'Failed to load profile', success: '' }));
  }, [user]);

  if (!user) {
    return (
      <div className="profile-root">
        <div className="profile-card">
          <p>Please <a href="/login">login</a> to view your profile.</p>
        </div>
      </div>
    );
  }

  // Handle form change
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handle avatar select
  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file) {
      setForm(f => ({
        ...f,
        avatar: file,
        avatarUrl: URL.createObjectURL(file)
      }));
    }
  };

  // Submit changes
  const handleSubmit = async e => {
    e.preventDefault();
    setFeedback({ error: '', success: '' });

    const tokens = JSON.parse(localStorage.getItem('tokens') || '{}');
    const accessToken = tokens.accessToken || '';

    // Build form data for avatar/file upload
    const formData = new FormData();
    if (form.username && form.username !== profile.username)
      formData.append('username', form.username);
    if (form.email && form.email !== profile.email)
      formData.append('email', form.email);
    if (form.bio !== profile.bio)
      formData.append('bio', form.bio);
    if (form.avatar)
      formData.append('avatar', form.avatar);

    // If nothing changed, skip
    if (!formData.has('username') && !formData.has('email') &&
        !formData.has('bio') && !formData.has('avatar')) {
      setFeedback({ error: 'No changes to update', success: '' });
      return;
    }

    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setFeedback({ error: '', success: res.data.message || 'Profile updated!' });
      setProfile(res.data.user);
      setEditing(false);
      setCooldowns(res.data.user.cooldowns || {});
      save(
        { ...user, username: res.data.user.username, email: res.data.user.email }, 
        tokens
      );
    } catch (err) {
      const eMsg =
        err.response?.data?.message ||
        'Update failed';
      setFeedback({ error: eMsg, success: '' });
    }
  };

  // Format field cooldown for user display
  const getCooldownMsg = (field) => {
    const rem = cooldowns[field];
    if (rem && rem > 0) {
      if (field === 'bio' || field === 'avatar')
        return `Cooldown active (~${Math.ceil(rem*60)} min remaining)`;
      return `Cooldown active (~${rem} hr remaining)`;
    }
    return '';
  };

  return (
    <div className="profile-root">
      <div className="profile-card">
        <h2 style={{color:'#97ebcd'}}>Profile</h2>
        <div className="profile-avatar">
          <img
            src={form.avatarUrl || '/default-avatar.png'}
            alt="profile avatar"
            className="profile-avatar-img"
          />
          {editing && (
            <input
              type="file"
              name="avatar"
              accept="image/*"
              ref={avatarInputRef}
              className="profile-avatar-input"
              disabled={cooldowns.avatar && cooldowns.avatar > 0}
              onChange={handleAvatarChange}
            />
          )}
          {!editing && <span className="profile-avatar-label">Avatar</span>}
          <span className="profile-cooldown">{getCooldownMsg('avatar')}</span>
        </div>
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-row">
            <label>Username:</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={!editing || (cooldowns.username && cooldowns.username > 0)}
              className="profile-input"
            />
            {editing && <span className="profile-cooldown">{getCooldownMsg('username')}</span>}
          </div>
          <div className="profile-row">
            <label>Email:</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={!editing || (cooldowns.email && cooldowns.email > 0)}
              className="profile-input"
            />
            {editing && <span className="profile-cooldown">{getCooldownMsg('email')}</span>}
          </div>
          <div className="profile-row">
            <label>Bio:</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              disabled={!editing || (cooldowns.bio && cooldowns.bio > 0)}
              className="profile-input"
            />
            {editing && <span className="profile-cooldown">{getCooldownMsg('bio')}</span>}
          </div>
          <div className="profile-actions">
            {!editing ? (
              <>
                <button type="button" className="profile-editbtn" onClick={() => setEditing(true)}>
                  Edit Profile
                </button>
                <button type="button" className="profile-logoutbtn" onClick={logout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  className="profile-savebtn"
                  disabled={
                    (cooldowns.username && cooldowns.username > 0 && form.username !== profile.username) ||
                    (cooldowns.email && cooldowns.email > 0 && form.email !== profile.email) ||
                    (cooldowns.bio && cooldowns.bio > 0 && form.bio !== profile.bio) ||
                    (cooldowns.avatar && cooldowns.avatar > 0 && form.avatar)
                  }
                >
                  Save Changes
                </button>
                <button type="button" className="profile-cancelbtn" onClick={() => {
                  setEditing(false);
                  setForm({
                    username: profile.username || '',
                    email: profile.email || '',
                    bio: profile.bio || '',
                    avatar: null,
                    avatarUrl: profile.avatar_url || '',
                  });
                  setFeedback({ error: '', success: '' });
                }}>
                  Cancel
                </button>
              </>
            )}
          </div>
          {feedback.error && <div className="profile-error">{feedback.error}</div>}
          {feedback.success && <div className="profile-success">{feedback.success}</div>}
        </form>
      </div>
    </div>
  );
}
