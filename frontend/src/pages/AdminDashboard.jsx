import React, { useState, useEffect } from 'react';
import api from '../api';
import '../styles/AdminDashboard.css';

const TAB_USERS = 'Users';
const TAB_POSTS = 'Posts';
const TAB_COMMENTS = 'Comments';
const TAB_ANALYTICS = 'Analytics';

export default function AdminDashboard() {
  const [tab, setTab] = useState(TAB_USERS);

  // State for each admin feature
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({});

  // Fetch functions
  useEffect(() => {
    if (tab === TAB_USERS) {
      api.get('/admin/users').then(res => setUsers(res.data));
    } else if (tab === TAB_POSTS) {
      api.get('/admin/posts').then(res => setPosts(res.data));
    } else if (tab === TAB_COMMENTS) {
      api.get('/admin/comments').then(res => setComments(res.data));
    } else if (tab === TAB_ANALYTICS) {
      api.get('/admin/analytics').then(res => setStats(res.data));
    }
  }, [tab]);

  // Sample moderation actions
  const handleBanUser = (id) => {
    if (window.confirm('Ban this user?'))
      api.put(`/admin/users/${id}`, { ban: true }).then(() => setTab(TAB_USERS));
  };
  const handleMakeAdmin = (id) => {
    api.put(`/admin/users/${id}`, { role: 'admin' }).then(() => setTab(TAB_USERS));
  };
  const handleApprovePost = (id) => {
    api.put(`/admin/posts/${id}/approve`).then(() => setTab(TAB_POSTS));
  };
  const handleDeletePost = (id) => {
    if (window.confirm('Delete this post?'))
      api.delete(`/admin/posts/${id}`).then(() => setTab(TAB_POSTS));
  };
  const handleDeleteComment = (id) => {
    if (window.confirm('Delete this comment?'))
      api.delete(`/admin/comments/${id}`).then(() => setTab(TAB_COMMENTS));
  };

  return (
    <div className="admin-root">
      <nav className="admin-tabs">
        {[TAB_USERS, TAB_POSTS, TAB_COMMENTS, TAB_ANALYTICS].map(t =>
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        )}
      </nav>
      <div className="admin-panel">
        {tab === TAB_USERS && (
          <section>
            <h2>Users</h2>
            <table>
              <thead><tr>
                <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      {u.role !== 'admin' && <button onClick={()=>handleMakeAdmin(u.id)}>Make Admin</button>}
                      <button onClick={()=>handleBanUser(u.id)}>Ban</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
        {tab === TAB_POSTS && (
          <section>
            <h2>Posts</h2>
            <table>
              <thead><tr><th>ID</th><th>Title</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
              {posts.map(p => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.title}</td>
                  <td>{p.author_id}</td>
                  <td>{p.is_approved ? 'Approved' : 'Pending'}</td>
                  <td>
                    {!p.is_approved && <button onClick={()=>handleApprovePost(p.id)}>Approve</button>}
                    <button onClick={()=>handleDeletePost(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </section>
        )}
        {tab === TAB_COMMENTS && (
          <section>
            <h2>Comments</h2>
            <table>
              <thead><tr><th>ID</th><th>User</th><th>Post</th><th>Content</th><th>Actions</th></tr></thead>
              <tbody>
              {comments.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.user_id}</td>
                  <td>{c.post_id}</td>
                  <td>{c.content.slice(0, 40)}...</td>
                  <td><button onClick={()=>handleDeleteComment(c.id)}>Delete</button></td>
                </tr>
              ))}
              </tbody>
            </table>
          </section>
        )}
        {tab === TAB_ANALYTICS && (
          <section>
            <h2>Analytics</h2>
            <div className="admin-stats">
              <div>Users: <b>{stats.user_count}</b></div>
              <div>Posts: <b>{stats.post_count}</b></div>
              <div>Comments: <b>{stats.comment_count}</b></div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
