import React from 'react';
import api from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import '../styles/auth.css';

export default function Register() {
  const { register, handleSubmit } = useForm();
  const nav = useNavigate();

  const onSubmit = (data) => {
    api.post('/auth/register', data).then(() => {
        toast.success('Registered');
        nav('/login');
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Register failed');
      });
  };

  return (
    <div className="auth-container" >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="title">Welcome,<br/><span>SignUp to continue or </span>
        <Link to="/login">Sign In!</Link>
        </div>
          <input className="auth-input"
            placeholder="Username"
            {...register('username')}
            />
          <input className="auth-input"
            type="email"
            placeholder="Email"
            {...register('email')}
            />
          <input className="auth-input"
            type="password"
            placeholder="Password"
            {...register('password')}
            />
          <button className="oauthButton" type="submit">Register</button>
      </form>
    </div>
  );
}
