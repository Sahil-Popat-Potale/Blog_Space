import React, { useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import AuthContext from '../AuthContext';

export default function Login() {
  const { save } = useContext(AuthContext);
  const { register, handleSubmit } = useForm();
  const nav = useNavigate();

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

  return (
    <div className="container">
      <h2>Login</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
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
      </form>
    </div>
  );
}
