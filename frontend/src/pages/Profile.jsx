import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const nav = useNavigate();

  const onSubmit = (data) => {
    api.post('/auth/register', data)
      .then(() => {
        toast.success('Registered');
        nav('/login');
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Register failed');
      });
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        {/* Username */}
        <input
          placeholder="Username"
          {...register('username', { required: 'Username is required' })}
        />
        {errors.username && <p className="error">{errors.username.message}</p>}

        {/* Email */}
        <input
          placeholder="Email"
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Invalid email address',
            },
          })}
        />
        {errors.email && <p className="error">{errors.email.message}</p>}

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          {...register('password', {
            required: 'Password is required',
            minLength: {
              value: 6,
              message: 'Password must be at least 6 characters',
            },
          })}
        />
        {errors.password && <p className="error">{errors.password.message}</p>}

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
