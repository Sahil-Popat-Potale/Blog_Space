import React from 'react';
import { useForm } from 'react-hook-form';
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const { register, handleSubmit } = useForm();
  const nav = useNavigate();

  const onSubmit = (data) => {
    api.post(
      '/posts',
      { ...data, content: data.content },
      {
        headers: {
          Authorization:
            'Bearer ' +
            (JSON.parse(localStorage.getItem('tokens') || '{}').accessToken || ''),
        },
      }
    )
      .then((r) => {
        nav(`/posts/${r.data.id}`);
      })
      .catch(() => {
        alert('Failed');
      });
  };

  return (
    <div className="container">
      <h2>Create Post</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          placeholder="Title"
          {...register('title')}
        />
        <textarea
          placeholder="Content (HTML allowed)"
          {...register('content')}
        ></textarea>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
