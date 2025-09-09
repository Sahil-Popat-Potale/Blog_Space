import React from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';

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
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Username"
          {...register('username')}
        />
        <input
          placeholder="Email"
          {...register('email')}
        />
        <input
          type="password"
          placeholder="Password"
          {...register('password')}
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
