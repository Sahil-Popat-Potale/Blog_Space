import React, { useContext, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AuthContext from '../AuthContext';

export default function Login() {
  const { save } = useContext(AuthContext);
  const { register, handleSubmit, reset: formReset } = useForm();
  const nav = useNavigate();
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const onSubmit = (data) => {
    api.post('/auth/login', data)
      .then((r) => {
        save(r.data.user, r.data.tokens);
        toast.success('Logged in');
        nav('/');
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Login failed');
      });
  };

  const handleForgot = (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error('Email is required');
      return;
    }
    setForgotLoading(true);
    api.post('/auth/forgot-password', { email: forgotEmail })
      .then(() => {
        toast.success('If that email exists, a reset link has been sent');
        setForgotEmail('');
        setShowForgot(false);
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Failed to send reset link');
      })
      .finally(() => setForgotLoading(false));
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: showForgot ? 'none' : 'block' }}>
        <input
          placeholder="Email or Username"
          {...register('identifier')}
        />
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
        />
        <button type="submit">Login</button>
        <div style={{ marginTop: 16 }}>
          <a
            href="#"
            style={{ color: '#1a8917', fontSize: 14 }}
            onClick={e => {
              e.preventDefault();
              setShowForgot(true);
              formReset();
            }}
          >
            Forgot password?
          </a>
        </div>
      </form>
      {showForgot && (
        <form onSubmit={handleForgot} style={{ marginTop: 30 }}>
          <input
            type="email"
            placeholder="Enter your email"
            value={forgotEmail}
            onChange={e => setForgotEmail(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={forgotLoading}>
            {forgotLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
          <div style={{ marginTop: 16 }}>
            <a
              href="#"
              style={{ color: '#666', fontSize: 14 }}
              onClick={e => {
                e.preventDefault();
                setForgotEmail('');
                setShowForgot(false);
              }}
            >
              Back to Login
            </a>
          </div>
        </form>
      )}
    </div>
  );
}
