import React, { useContext, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AuthContext from '../AuthContext';
import '../styles/auth.css';

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
        nav('/home');
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
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} /*style={{ display: showForgot ? 'none' : 'block' }}*/>
        <div className="title">Welcome,<br/><span>sign in to continue</span></div>
        <input className="auth-input"
          placeholder="Email or Username"
          {...register('identifier')}
        />
        <input className="auth-input"
          placeholder="Password"
          type="password"
          {...register('password')}
        />
        <button className="button-confirm" type="submit">Continue »</button>

        <div className="auth-separator">
          <div></div>
          <span>OR</span>
          <div></div>
        </div>

        <div className="login-with">
          <div className="button-log"><b>t</b></div>
          <div className="button-log"></div>
          <div className="button-log"></div>
      </div>

        <div style={{ marginTop: 16 }}>
          <a href="#"
            style={{ color: '#1a8917', fontSize: 14 }}
            onClick={e => {
              e.preventDefault();
              setShowForgot(true);
              formReset();
            }}
          > Forgot password?
          </a>
        </div>
      </form>
        {showForgot && (
          <form className="auth-form" onSubmit={handleForgot} style={{ marginTop: 30 }}>
            <input className="auth-input"
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={e => setForgotEmail(e.target.value)}
              autoFocus
              />
            <button className="button-confirm" type="submit" disabled={forgotLoading}>
              {forgotLoading ? 'Sending...' : 'Send Link'}
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
