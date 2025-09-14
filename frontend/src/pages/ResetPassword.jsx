import React, { useState } from 'react';
import api from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const nav = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) return toast.error('Missing token in URL');
    if (!newPassword) return toast.error('Enter a new password');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      toast.success('Password reset successful. You can now log in.');
      setSuccess(true);
      setTimeout(() => nav('/login'), 2000); // Redirect after 2 sec
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div style={{ margin: 40 }}>Missing or invalid token.</div>;

  return (
    <div className="container" style={{ maxWidth: 380, margin: '60px auto' }}>
      <h2>Reset Password</h2>
      {success ? (
        <div>Your password has been reset. Redirecting to login...</div>
      ) : (
        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            minLength={6}
            autoFocus
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
