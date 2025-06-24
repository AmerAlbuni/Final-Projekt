import { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import "../../styles/admin-style/AdminUsers.css"; // Adjust the path as necessary
const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editedUser, setEditedUser] = useState({ role: '', team: '' });
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Member' });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchTeams();
    }
  }, [token]);

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setFormLoading(true);
    try {
      await api.post('/users', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({ name: '', email: '', password: '', role: 'Member' });
      setMessage('✅ User added successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((u) => u._id !== id));
      setMessage('🗑️ User deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to delete user');
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setEditedUser({ role: user.role, team: user.team?._id || '' });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
    setEditedUser({ role: '', team: '' });
  };

  const saveUserUpdate = async (id) => {
    try {
      await api.put(`/users/${id}`, editedUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('✅ User updated');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      cancelEditing();
    }
  };

  return (
    <div className="admin-users-wrapper">
      <div className="admin-users-container">
        <h1>👥 Manage Users</h1>

        <form onSubmit={handleAddUser}>
          <h2>Add New User</h2>
          {message && <p>{message}</p>}
          {error && <p>{error}</p>}

          <div>
            <input name="name" value={form.name} onChange={handleChange} required placeholder="Name" />
            <input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" />
            <input name="password" value={form.password} onChange={handleChange} required type="password" placeholder="Password" />
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="Admin">Admin</option>
              <option value="TeamLead">TeamLead</option>
              <option value="Member">Member</option>
            </select>
          </div>

          <button type="submit" disabled={formLoading}>
            {formLoading ? 'Creating...' : '➕ Add User'}
          </button>
        </form>

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <div className="user-grid">
            {users.map((user) => (
              <div className="user-card" key={user._id}>
                <h3>{user.name}</h3>
                <p><strong>Email:</strong> {user.email}</p>
                <p>
                  <strong>Role:</strong>{' '}
                  {editingUserId === user._id ? (
                    <select
                      value={editedUser.role}
                      onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                    >
                      <option value="Admin">Admin</option>
                      <option value="TeamLead">TeamLead</option>
                      <option value="Member">Member</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </p>
                <p>
                  <strong>Team:</strong>{' '}
                  {editingUserId === user._id ? (
                    <select
                      value={editedUser.team ?? ''}
                      onChange={(e) => setEditedUser({ ...editedUser, team: e.target.value })}
                    >
                      <option value="">—</option>
                      {teams.map((team) => (
                        <option key={team._id} value={team._id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    user.team?.name || '—'
                  )}
                </p>

                <div className="user-actions">
                  {editingUserId === user._id ? (
                    <>
                      <button onClick={() => saveUserUpdate(user._id)}>💾 Save</button>
                      <button onClick={cancelEditing}>✖ Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(user)}>✏️ Edit</button>
                      <button onClick={() => handleDelete(user._id)}>🗑️ Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
