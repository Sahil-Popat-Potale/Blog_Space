import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Basic styles
import TurndownService from 'turndown'; // For HTML->Markdown
import api from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [contentHTML, setContentHTML] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const nav = useNavigate();

  // Setup turndown for markdown conversion
  const turndownService = new TurndownService();

  // Handle tag addition (chips)
  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, tags.length - 1));
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert HTML to Markdown
      const contentMarkdown = turndownService.turndown(contentHTML);

      // Send both HTML and Markdown in the payload
      const payload = {
        title,
        content_html: contentHTML,
        content_markdown: contentMarkdown,
        tags,
      };
      // Add token logic here if needed
      const res = await api.post('/posts', payload, {
        headers: {
          Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('tokens') || '{}').accessToken || ''),
        },
      });
      nav(`/posts/${res.data.id}`);
    } catch (err) {
      alert('Create post failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{
      maxWidth: '680px', margin: '40px auto', padding: '24px', background: '#fff',
      borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', fontFamily: 'Georgia, serif'
    }}>
      <form onSubmit={onSubmit}>
        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            width: '100%', border: 'none', fontSize: '2.6rem', fontWeight: 700,
            marginBottom: 16, outline: 'none', background: 'none'
          }}
          required
          autoFocus
        />

        {/* Medium-like Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 16 }}>
          {tags.map((tag, idx) => (
            <span key={idx} style={{
              background: '#eee', borderRadius: 16, padding: '3px 12px', margin: '3px 4px',
              fontSize: 14, display: 'flex', alignItems: 'center'
            }}>
              {tag}
              <span onClick={() => handleTagRemove(tag)} style={{ marginLeft: 8, cursor: 'pointer' }}>×</span>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value.replace(/[^\w-]/g, ''))}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag"
            style={{
              border: 'none', outline: 'none', fontSize: 14, flex: 1, minWidth: 80
            }}
          />
        </div>

        {/* Rich Text Editor */}
        <ReactQuill
          value={contentHTML}
          onChange={setContentHTML}
          placeholder="Write your story..."
          style={{ height: '260px', marginBottom: 32, background: '#e9e9eeff', color: '#000' }}
          modules={{
            toolbar: [
              [{ 'header': [1, 2, false] }],
              ['bold', 'italic', 'underline', 'link'],
              ['blockquote', 'code-block', 'image'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }]
            ]
          }}
        />

        <button type="submit" style={{
          background: '#1a8917', color: '#fff', border: 'none', padding: '10px 28px',
          borderRadius: '20px', fontWeight: 700, fontSize: 16, cursor: 'pointer'
        }}>
          Publish
        </button>
      </form>
    </div>
  );
}
