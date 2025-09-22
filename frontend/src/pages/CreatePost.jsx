import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import TurndownService from 'turndown';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import '../styles/CreatePost.css'; // Make sure this matches your path

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [contentHTML, setContentHTML] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState('none'); // 'none' | 'markdown' | 'html'
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const turndownService = new TurndownService();

  // Tag chip logic (no dupes, no empty, lowercase, trim)
  const addTag = tag => {
    tag = tag.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };
  const handleTagKeyDown = e => {
    if ((e.key === 'Enter' || e.key === ',' || e.key === ' ') && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, tags.length - 1));
    }
  };
  const handleTagRemove = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handlePreviewChange = mode => setPreviewMode(mode);

  const onSubmit = async e => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!contentHTML || turndownService.turndown(contentHTML).trim() === '') {
      return toast.error("Blog post content cannot be empty");
    }
    setLoading(true);
    try {
      const contentMarkdown = turndownService.turndown(contentHTML);
      const payload = {
        title: title.trim(),
        content_html: contentHTML,
        content_markdown: contentMarkdown,
        tags,
      };
      const res = await api.post('/posts', payload, {
        headers: {
          Authorization: 'Bearer ' + (JSON.parse(localStorage.getItem('tokens') || '{}').accessToken || ''),
        },
      });
      toast.success("Blog post published!");
      setTimeout(() => nav(`/posts/${res.data.id}`), 800); // Delay a sec for nice UX
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="createpost-root">
      <form className="createpost-form" onSubmit={onSubmit}>
        <input
          className="createpost-title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
          autoFocus
        />
        <div className="createpost-tags">
          {tags.map((tag, idx) => (
            <span className="createpost-tag" key={tag}>
              {tag}
              <span className="createpost-tag-remove" onClick={() => handleTagRemove(tag)}>×</span>
            </span>
          ))}
          <input
            className="createpost-taginput"
            value={tagInput}
            onChange={e => setTagInput(e.target.value.replace(/[^\w-]/g, ''))}
            onKeyDown={handleTagKeyDown}
            placeholder="Add a tag"
          />
        </div>
        <div className="createpost-toolbar">
          <button type="button" className={previewMode === 'none' ? 'active' : ''} onClick={() => handlePreviewChange('none')}>Write</button>
          <button type="button" className={previewMode === 'markdown' ? 'active' : ''} onClick={() => handlePreviewChange('markdown')}>Markdown Preview</button>
          <button type="button" className={previewMode === 'html' ? 'active' : ''} onClick={() => handlePreviewChange('html')}>HTML Preview</button>
        </div>
        {previewMode === 'none' &&
          <ReactQuill
            value={contentHTML}
            onChange={setContentHTML}
            placeholder="Write your story..."
            className="createpost-editor"
            modules={{
              toolbar: [
                [{ 'header': [1, 2, false] }],
                ['bold', 'italic', 'underline', 'link'],
                ['blockquote', 'code-block', 'image'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }]
              ]
            }}
          />}
        {previewMode === 'markdown' &&
          <pre className="createpost-preview">{turndownService.turndown(contentHTML)}</pre>}
        {previewMode === 'html' &&
          <div className="createpost-preview" dangerouslySetInnerHTML={{ __html: contentHTML }} />}
        <button className="createpost-publishbtn" type="submit" disabled={loading}>
          {loading ? 'Publishing...' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
